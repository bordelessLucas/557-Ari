import { useState } from 'react'
import { type User } from 'firebase/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import type { AdminPageId } from '@/constants/adminNavigation'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminNewsPage from '@/pages/admin/AdminNewsPage'
import AdminPublicationsPage from '@/pages/admin/AdminPublicationsPage'
import AdminReviewPage from '@/pages/admin/AdminReviewPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminSourcesPage from '@/pages/admin/AdminSourcesPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import { isViewOnlyAdmin } from '@/services/userService'
import type { UserProfile } from '@/types/user'

interface AdminAppProps {
  user: User
  profile: UserProfile
}

export default function AdminApp({ user, profile }: AdminAppProps) {
  const [page, setPage] = useState<AdminPageId>('dashboard')
  const viewOnly = isViewOnlyAdmin(profile)

  let content = <AdminDashboardPage onNavigate={setPage} />

  if (page === 'sources') content = <AdminSourcesPage viewOnly={viewOnly} />
  if (page === 'news') content = <AdminNewsPage viewOnly={viewOnly} />
  if (page === 'review') content = <AdminReviewPage viewOnly={viewOnly} />
  if (page === 'publications') {
    content = <AdminPublicationsPage viewOnly={viewOnly} />
  }
  if (page === 'admins') content = <AdminUsersPage profile={profile} />
  if (page === 'settings') content = <AdminSettingsPage profile={profile} />

  return (
    <AdminLayout
      user={user}
      profile={profile}
      activeNav={page}
      onNavigate={setPage}
    >
      {content}
    </AdminLayout>
  )
}
