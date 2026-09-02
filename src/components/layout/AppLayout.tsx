import { type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { defaultPortalState } from '@/constants/states'
import MainNav from '@/components/layout/MainNav'
import StateSelector from '@/components/layout/StateSelector'
import UserMenu from '@/components/layout/UserMenu'
import { Container, Logo, PageContent, PageHeader } from '@/components/ui'
import { getUserProfile } from '@/services/userService'
import type { PortalState } from '@/types/user'

interface AppLayoutProps {
  user: User
  children: ReactNode
}

export default function AppLayout({ user, children }: AppLayoutProps) {
  const [selectedState, setSelectedState] = useState<PortalState>(defaultPortalState)

  useEffect(() => {
    getUserProfile(user.uid).then((profile) => {
      if (profile?.selectedState) {
        setSelectedState(profile.selectedState)
      }
    })
  }, [user.uid])

  return (
    <div className="min-h-screen bg-muted">
      <PageHeader className="border-b-0 bg-navy-700 py-4">
        <Container size="lg" className="flex items-center justify-between gap-4">
          <a href="/" aria-label="Agência da Notícia">
            <Logo size="md" />
          </a>

          <div className="flex items-center gap-3 sm:gap-4">
            <StateSelector
              uid={user.uid}
              value={selectedState}
              onChange={setSelectedState}
              className="hidden sm:flex"
            />
            <UserMenu user={user} selectedState={selectedState} />
          </div>
        </Container>
      </PageHeader>

      <div className="border-b border-navy-800 bg-navy-700 px-4 py-2 sm:hidden">
        <StateSelector
          uid={user.uid}
          value={selectedState}
          onChange={setSelectedState}
        />
      </div>

      <MainNav />

      <PageContent>{children}</PageContent>
    </div>
  )
}
