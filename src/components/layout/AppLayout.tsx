import { type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { defaultPortalState } from '@/constants/states'
import MainNav from '@/components/layout/MainNav'
import UserMenu from '@/components/layout/UserMenu'
import PortalFooter from '@/components/portal/PortalFooter'
import { Container, Logo, PageContent, PageHeader } from '@/components/ui'
import { detectPortalState } from '@/lib/detectPortalState'
import { getUserProfile, updateUserState } from '@/services/userService'
import type { PortalState } from '@/types/user'

interface AppLayoutProps {
  user: User
  children: ReactNode
  documentTitle?: string
}

export default function AppLayout({
  user,
  children,
  documentTitle = 'Agência da Notícia',
}: AppLayoutProps) {
  const [selectedState, setSelectedState] =
    useState<PortalState>(defaultPortalState)

  useEffect(() => {
    document.title = documentTitle
  }, [documentTitle])

  useEffect(() => {
    let cancelled = false

    async function initRegion() {
      const profile = await getUserProfile(user.uid)

      if (profile?.stateSetBy === 'manual' && profile.selectedState) {
        if (!cancelled) setSelectedState(profile.selectedState)
        return
      }

      const detected = await detectPortalState()

      if (cancelled) return

      if (detected) {
        setSelectedState(detected)
        if (
          profile?.selectedState !== detected ||
          profile.stateSetBy !== 'auto'
        ) {
          try {
            await updateUserState(user.uid, detected, { setBy: 'auto' })
          } catch {
            // Mantém UI mesmo se o save falhar
          }
        }
        return
      }

      if (profile?.selectedState) {
        setSelectedState(profile.selectedState)
      }
    }

    void initRegion()
    return () => {
      cancelled = true
    }
  }, [user.uid])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHeader className="border-b-0 bg-navy-700 py-3 sm:py-4">
        <Container
          size="lg"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4"
        >
          <Link to="/" aria-label="Agência da Notícia — início" className="justify-self-start">
            <Logo size="md" />
          </Link>

          <Link
            to="/"
            className="group justify-self-center px-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Agência da Notícia"
          >
            <span className="block text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/90 transition-colors group-hover:text-white sm:text-xs sm:tracking-[0.28em] md:text-sm md:tracking-[0.32em]">
              Agência da Notícia
            </span>
            <span
              className="mx-auto mt-1.5 block h-px w-10 bg-red-500/90 transition-all group-hover:w-14 sm:w-14 sm:group-hover:w-20"
              aria-hidden
            />
            <span className="mt-1.5 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-navy-200 sm:block">
              Portal de notícias
            </span>
          </Link>

          <div className="justify-self-end">
            <UserMenu
              user={user}
              selectedState={selectedState}
              onStateChange={setSelectedState}
            />
          </div>
        </Container>
      </PageHeader>

      <MainNav />

      <PageContent className="flex-1">{children}</PageContent>

      <PortalFooter />
    </div>
  )
}
