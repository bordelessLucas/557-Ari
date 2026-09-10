import { useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  adminNavItems,
  type AdminPageId,
} from '@/constants/adminNavigation'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminNewsPage from '@/pages/admin/AdminNewsPage'
import AdminPublicationsPage from '@/pages/admin/AdminPublicationsPage'
import AdminReviewPage from '@/pages/admin/AdminReviewPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminSourcesPage from '@/pages/admin/AdminSourcesPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import { isViewOnlyAdmin } from '@/services/userService'
import type { UserProfile } from '@/types/user'

const ADMIN_PAGE_KEY = 'ari-admin-page'

function isAdminPageId(value: string | null): value is AdminPageId {
  return Boolean(value && adminNavItems.some((item) => item.id === value))
}

function readAdminPage(): AdminPageId {
  try {
    const stored = sessionStorage.getItem(ADMIN_PAGE_KEY)
    if (isAdminPageId(stored)) return stored
  } catch {
    // ignore
  }
  return 'dashboard'
}

function writeAdminPage(page: AdminPageId) {
  try {
    sessionStorage.setItem(ADMIN_PAGE_KEY, page)
  } catch {
    // ignore
  }
}

interface AdminAppProps {
  user: User
  profile: UserProfile
  onOpenPortal?: (path?: string) => void
}

export default function AdminApp({ user, profile, onOpenPortal }: AdminAppProps) {
  const [page, setPage] = useState<AdminPageId>(() => readAdminPage())
  const viewOnly = isViewOnlyAdmin(profile)

  useEffect(() => {
    writeAdminPage(page)
  }, [page])

  function handleNavigate(next: AdminPageId) {
    setPage(next)
  }

  let content = <AdminDashboardPage onNavigate={handleNavigate} />

  if (page === 'sources') content = <AdminSourcesPage viewOnly={viewOnly} />
  if (page === 'news') {
    content = (
      <AdminNewsPage viewOnly={viewOnly} onNavigate={handleNavigate} />
    )
  }
  if (page === 'review') {
    content = (
      <AdminReviewPage viewOnly={viewOnly} onOpenPortal={onOpenPortal} />
    )
  }
  if (page === 'publications') {
    content = (
      <AdminPublicationsPage
        viewOnly={viewOnly}
        onOpenPortal={onOpenPortal}
        onNavigate={handleNavigate}
      />
    )
  }
  if (page === 'admins') content = <AdminUsersPage profile={profile} />
  if (page === 'settings') content = <AdminSettingsPage profile={profile} />

  return (
    <AdminLayout
      user={user}
      profile={profile}
      activeNav={page}
      onNavigate={handleNavigate}
      onOpenPortal={onOpenPortal}
    >
      {content}
    </AdminLayout>
  )
}
