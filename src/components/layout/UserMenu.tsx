import { signOut, type User } from 'firebase/auth'
import {
  ChevronDown,
  LogOut,
  Mail,
  MapPin,
  Shield,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPortalStateLabel } from '@/constants/states'
import StateSelector from '@/components/layout/StateSelector'
import { Button } from '@/components/ui'
import { auth } from '@/lib/firebase'
import {
  formatBirthDate,
  getFirstName,
  getUserProfile,
} from '@/services/userService'
import type { PortalState, UserProfile } from '@/types/user'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  user: User
  selectedState: PortalState
  onStateChange: (state: PortalState) => void
  /** Masthead do leitor: controle mais discreto */
  compact?: boolean
}

export default function UserMenu({
  user,
  selectedState,
  onStateChange,
  compact = false,
}: UserMenuProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUserProfile(user.uid).then(setProfile)
  }, [user.uid])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const displayName =
    profile?.name || user.displayName || getFirstName(user.email ?? 'Usuário')
  const firstName = getFirstName(displayName)

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={compact ? 'Abrir menu da conta' : undefined}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-2 rounded-lg text-sm font-medium text-white transition-colors hover:bg-white/10',
          compact ? 'px-2 py-2 sm:px-2.5' : 'max-w-[220px] px-2 py-2 sm:px-3',
        )}
      >
        {compact ? (
          <>
            <UserRound className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="hidden text-xs font-medium sm:inline">Conta</span>
          </>
        ) : (
          <span className="truncate">Olá, {firstName}</span>
        )}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-elevated)] transition-all duration-200 ease-out',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <div className="mb-4 border-b border-border pb-4">
          <p className="text-sm font-semibold text-foreground">
            Olá, {firstName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bem-vindo ao portal da Agência da Notícia
          </p>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">E-mail</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Data de nascimento</dt>
              <dd className="font-medium text-foreground">
                {formatBirthDate(profile?.birthDate ?? '')}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Estado atual</dt>
              <dd className="font-medium text-foreground">
                {getPortalStateLabel(selectedState)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Tipo de acesso</dt>
              <dd className="font-medium text-foreground">
                {profile?.role === 'admin' ? 'Administrador' : 'Leitor'}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
          <StateSelector
            uid={user.uid}
            value={selectedState}
            onChange={onStateChange}
            variant="onLight"
            hint="Preferência salva na conta. Em breve poderá filtrar o feed por região."
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={() => signOut(auth)}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}
