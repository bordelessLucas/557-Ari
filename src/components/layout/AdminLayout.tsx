import {
  ArrowLeft,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { signOut, type User } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import {
  adminNavItems,
  getAdminPageTitle,
  type AdminPageId,
} from '@/constants/adminNavigation'
import { Button, Logo, Text } from '@/components/ui'
import { auth } from '@/lib/firebase'
import {
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from '@/lib/adminFocus'
import type { UserProfile } from '@/types/user'
import { cn } from '@/lib/utils'

const MOBILE_DRAWER_MS = 280
const DESKTOP_MQ = '(min-width: 1024px)'

const iconMap = {
  dashboard: LayoutDashboard,
  sources: FolderOpen,
  news: FileText,
  review: ShieldCheck,
  publications: FileText,
  admins: Users,
  settings: Settings,
} as const

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(DESKTOP_MQ).matches
  })

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ)
    const sync = () => setIsDesktop(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return isDesktop
}

interface AdminLayoutProps {
  user: User
  profile: UserProfile
  activeNav: AdminPageId
  onNavigate: (page: AdminPageId) => void
  onOpenPortal?: (path?: string) => void
  children: ReactNode
}

export default function AdminLayout({
  user,
  profile,
  activeNav,
  onNavigate,
  onOpenPortal,
  children,
}: AdminLayoutProps) {
  const isDesktop = useIsDesktop()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileMounted, setMobileMounted] = useState(false)
  const [mobileEntered, setMobileEntered] = useState(false)
  /** Desktop only — default expanded; never applies below lg */
  const [desktopCollapsed, setDesktopCollapsed] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches
      ? readSidebarCollapsed()
      : false,
  )
  const permissionLabel =
    profile.isPrincipal || profile.adminPermission === 'full'
      ? 'Edição total'
      : 'Somente visualização'

  const showDesktopRail = isDesktop
  const railCollapsed = showDesktopRail && desktopCollapsed
  const showBackToDashboard = activeNav !== 'dashboard'

  useEffect(() => {
    if (!isDesktop) {
      setMobileOpen(false)
      setDesktopCollapsed(false)
    } else {
      setDesktopCollapsed(readSidebarCollapsed())
    }
  }, [isDesktop])

  useEffect(() => {
    if (mobileOpen) {
      setMobileMounted(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMobileEntered(true))
      })
      return () => cancelAnimationFrame(id)
    }

    setMobileEntered(false)
    const timeout = window.setTimeout(
      () => setMobileMounted(false),
      MOBILE_DRAWER_MS,
    )
    return () => window.clearTimeout(timeout)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
  }

  function handleLogout() {
    void signOut(auth)
  }

  function handleNav(page: AdminPageId) {
    onNavigate(page)
    closeMobile()
  }

  function toggleDesktopSidebar() {
    if (!isDesktop) return
    setDesktopCollapsed((current) => {
      const next = !current
      writeSidebarCollapsed(next)
      return next
    })
  }

  return (
    <div
      className={cn(
        'flex h-dvh max-h-dvh flex-col overflow-hidden bg-muted',
        'lg:grid',
        railCollapsed
          ? 'lg:grid-cols-[72px_minmax(0,1fr)]'
          : 'lg:grid-cols-[260px_minmax(0,1fr)]',
      )}
    >
      {/* Desktop rail — hidden on mobile/tablet portrait */}
      <aside
        className={cn(
          'hidden min-h-0 flex-col overflow-hidden border-r border-border bg-navy-900 text-white lg:flex',
          railCollapsed ? 'px-0' : '',
        )}
      >
        <div
          className={cn(
            'shrink-0 border-b border-white/10 py-4',
            railCollapsed ? 'px-2' : 'px-4',
          )}
        >
          {railCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Logo size="sm" />
              <button
                type="button"
                className="rounded-lg border border-white/20 p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Expandir menu lateral"
                aria-expanded={false}
                onClick={toggleDesktopSidebar}
              >
                <PanelLeftOpen className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Logo size="md" />
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-navy-200">
                  Painel administrativo
                </p>
              </div>
              <button
                type="button"
                className="mt-0.5 shrink-0 rounded-lg border border-white/20 p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Recolher menu lateral"
                aria-expanded={true}
                onClick={toggleDesktopSidebar}
              >
                <PanelLeftClose className="size-4" />
              </button>
            </div>
          )}
        </div>

        <nav
          className={cn(
            'min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]',
            railCollapsed ? 'px-2' : 'px-3',
          )}
        >
          {adminNavItems.map((item) => {
            const Icon = iconMap[item.id]
            const isActive = item.id === activeNav

            return (
              <button
                key={item.id}
                type="button"
                title={railCollapsed ? item.label : undefined}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'flex w-full rounded-lg text-left transition-colors',
                  railCollapsed
                    ? 'items-center justify-center px-2 py-2.5'
                    : 'items-start gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0 text-current',
                    !railCollapsed && 'mt-0.5',
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
                {!railCollapsed && (
                  <span>
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-navy-300">
                      {item.description}
                    </span>
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div
          className={cn(
            'shrink-0 border-t border-white/10 py-4',
            railCollapsed ? 'px-2' : 'px-4',
          )}
        >
          {!railCollapsed && (
            <>
              <Text variant="small" className="truncate text-navy-300">
                {user.email}
              </Text>
              <p className="mt-1 text-xs text-navy-200">{permissionLabel}</p>
            </>
          )}
          {onOpenPortal && !railCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start border border-white/20 text-white hover:bg-white/10"
              onClick={() => onOpenPortal?.()}
            >
              Ver portal do leitor
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            title={railCollapsed ? 'Sair' : undefined}
            className={cn(
              'border border-white/20 text-white hover:bg-white/10',
              railCollapsed
                ? 'mt-0 w-full justify-center px-0'
                : 'mt-2 w-full justify-start',
            )}
            onClick={handleLogout}
          >
            <LogOut className="size-4 shrink-0" />
            {!railCollapsed && 'Sair'}
          </Button>
        </div>
      </aside>

      {/* Content column — fills leftover height on mobile + desktop */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="shrink-0 rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              {showBackToDashboard && (
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:px-2.5"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {getAdminPageTitle(activeNav)}
                </p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {activeNav === 'dashboard'
                    ? 'Central de operação editorial'
                    : 'Volte ao painel quando terminar'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {onOpenPortal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => onOpenPortal()}
                >
                  Ver portal
                </Button>
              )}
              <span className="hidden rounded-md bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700 md:inline">
                {permissionLabel}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-gutter:stable] [scrollbar-width:thin] sm:px-6 sm:py-6 lg:px-8',
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileMounted && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu administrativo"
        >
          <button
            type="button"
            className={cn(
              'absolute inset-0 bg-navy-950/55 transition-opacity ease-out',
              mobileEntered ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDuration: `${MOBILE_DRAWER_MS}ms` }}
            aria-label="Fechar menu"
            onClick={closeMobile}
          />
          <aside
            className={cn(
              'absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-navy-900 text-white shadow-[var(--shadow-elevated)] transition-transform ease-out will-change-transform',
              mobileEntered ? 'translate-x-0' : '-translate-x-full',
            )}
            style={{ transitionDuration: `${MOBILE_DRAWER_MS}ms` }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">
              <Logo size="sm" />
              <button
                type="button"
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Fechar menu"
                onClick={closeMobile}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
              {adminNavItems.map((item, index) => {
                const Icon = iconMap[item.id]
                const isActive = item.id === activeNav

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,opacity,transform] duration-300 ease-out',
                      isActive ? 'bg-white/10' : 'hover:bg-white/5',
                      mobileEntered
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-2 opacity-0',
                    )}
                    style={{
                      transitionDelay: mobileEntered
                        ? `${40 + index * 28}ms`
                        : '0ms',
                    }}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                    <span>
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-navy-300">
                        {item.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
            <div className="shrink-0 border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Text variant="small" className="truncate text-navy-300">
                {user.email}
              </Text>
              <p className="mt-1 text-xs text-navy-200">{permissionLabel}</p>
              {onOpenPortal && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full justify-start border border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    onOpenPortal()
                    closeMobile()
                  }}
                >
                  Ver portal do leitor
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
