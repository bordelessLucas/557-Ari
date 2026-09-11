import { type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { defaultPortalState, getPortalStateLabel } from '@/constants/states'
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
  activeCategorySlug?: string
  /** @deprecated Faixa Últimas removida — use o modal Mais lidas / Último minuto */
  latestArticles?: unknown
}

export default function AppLayout({
  user,
  children,
  documentTitle = 'Agência da Notícia',
  activeCategorySlug,
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
      <PageHeader className="border-b-0 bg-navy-800 py-3 sm:py-3.5">
        <Container
          size="lg"
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5"
        >
          <Link
            to="/"
            aria-label="Agência da Notícia — início"
            className="justify-self-start"
          >
            <Logo size="md" />
          </Link>

          <Link
            to="/"
            className="group justify-self-center px-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Agência da Notícia"
          >
            <span className="font-display block text-sm font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-white sm:text-lg md:text-xl">
              Agência da Notícia
            </span>
            <span
              className="mx-auto mt-1 block h-0.5 w-12 bg-red-500 transition-all group-hover:w-16"
              aria-hidden
            />
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.2em] text-navy-200 sm:block">
              Cobertura · {getPortalStateLabel(selectedState)}
            </span>
          </Link>

          <div className="justify-self-end">
            <UserMenu
              user={user}
              selectedState={selectedState}
              onStateChange={setSelectedState}
              compact
            />
          </div>
        </Container>
      </PageHeader>

      <MainNav activeSlug={activeCategorySlug} />

      <PageContent className="flex-1 py-0">{children}</PageContent>

      <PortalFooter />
    </div>
  )
}
