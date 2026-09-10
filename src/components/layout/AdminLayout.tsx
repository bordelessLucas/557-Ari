import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
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
import type { UserProfile } from '@/types/user'
import { cn } from '@/lib/utils'

const MOBILE_DRAWER_MS = 280

const iconMap = {
  dashboard: LayoutDashboard,
  sources: FolderOpen,
  news: FileText,
  review: ShieldCheck,
  publications: FileText,
  admins: Users,
  settings: Settings,
} as const

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileMounted, setMobileMounted] = useState(false)
  const [mobileEntered, setMobileEntered] = useState(false)
  const permissionLabel =
    profile.isPrincipal || profile.adminPermission === 'full'
      ? 'Edição total'
      : 'Somente visualização'

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

  return (
    <div className="min-h-screen bg-muted lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar inteira, sem scroll interno; trava no fim ao rolar a página */}
      <aside className="sticky top-[min(0px,calc(100vh-100%))] z-30 hidden self-start border-r border-border bg-navy-900 text-white lg:flex lg:w-full lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo size="md" />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-navy-200">
            Painel administrativo
          </p>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const Icon = iconMap[item.id]
            const isActive = item.id === activeNav

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-current"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-navy-300">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <Text variant="small" className="text-navy-300">
            {user.email}
          </Text>
          <p className="mt-1 text-xs text-navy-200">{permissionLabel}</p>
          {onOpenPortal && (
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
            className="mt-2 w-full justify-start border border-white/20 text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="size-4 shrink-0" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {getAdminPageTitle(activeNav)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Central de operação editorial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPortal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPortal()}
                >
                  Ver portal
                </Button>
              )}
              <span className="hidden rounded-md bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700 sm:inline">
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

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {mobileMounted && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
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
              'absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-900 text-white shadow-[var(--shadow-elevated)] transition-transform ease-out will-change-transform',
              mobileEntered ? 'translate-x-0' : '-translate-x-full',
            )}
            style={{ transitionDuration: `${MOBILE_DRAWER_MS}ms` }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
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
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
                    <Icon className="mt-0.5 size-4" strokeWidth={1.75} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}
