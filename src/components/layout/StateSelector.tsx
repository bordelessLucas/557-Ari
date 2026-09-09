import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { portalStates } from '@/constants/states'
import { updateUserState } from '@/services/userService'
import type { PortalState } from '@/types/user'
import { cn } from '@/lib/utils'

interface StateSelectorProps {
  uid: string
  value: PortalState
  onChange: (state: PortalState) => void
  className?: string
  /** Aparência no header escuro vs menu claro */
  variant?: 'onDark' | 'onLight'
  /** Texto auxiliar (ex.: preferência ainda não filtra o feed) */
  hint?: string
}

export default function StateSelector({
  uid,
  value,
  onChange,
  className,
  variant = 'onDark',
  hint,
}: StateSelectorProps) {
  const [saving, setSaving] = useState(false)
  const onLight = variant === 'onLight'

  async function handleChange(nextState: PortalState) {
    if (nextState === value || saving) return

    setSaving(true)
    onChange(nextState)

    try {
      await updateUserState(uid, nextState, { setBy: 'manual' })
    } catch {
      onChange(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <MapPin
          className={cn(
            'size-4 shrink-0',
            onLight ? 'text-muted-foreground' : 'text-navy-200',
          )}
          strokeWidth={1.75}
        />
        <label
          htmlFor="state-selector"
          className={cn(
            'text-xs font-medium',
            onLight ? 'text-muted-foreground' : 'sr-only',
          )}
        >
          Região de preferência
        </label>
        <select
          id="state-selector"
          value={value}
          disabled={saving}
          onChange={(event) => handleChange(event.target.value as PortalState)}
          className={cn(
            'h-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60',
            onLight
              ? 'border border-input bg-background text-foreground focus-visible:ring-navy-600/30'
              : 'border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 focus-visible:ring-white/30',
          )}
        >
          {portalStates.map((state) => (
            <option key={state.id} value={state.id} className="text-foreground">
              {state.label}
            </option>
          ))}
        </select>
      </div>
      {hint && (
        <p
          className={cn(
            'text-[11px] leading-snug',
            onLight ? 'text-muted-foreground' : 'text-navy-300',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}
