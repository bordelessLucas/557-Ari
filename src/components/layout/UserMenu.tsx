import { signOut, type User } from 'firebase/auth'
import { ChevronDown, LogOut, Mail, MapPin, Shield, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPortalStateLabel } from '@/constants/states'
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
}

export default function UserMenu({ user, selectedState }: UserMenuProps) {
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

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        <span>Bem-vindo, {getFirstName(displayName)}</span>
        <ChevronDown
          className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-elevated)] transition-all duration-200 ease-out',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <div className="mb-4 border-b border-border pb-4">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Minha conta</p>
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
              <dt className="text-xs text-muted-foreground">Estado selecionado</dt>
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
                {profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </dd>
            </div>
          </div>
        </dl>

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
