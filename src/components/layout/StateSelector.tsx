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
}

export default function StateSelector({
  uid,
  value,
  onChange,
  className,
}: StateSelectorProps) {
  const [saving, setSaving] = useState(false)

  async function handleChange(nextState: PortalState) {
    if (nextState === value || saving) return

    setSaving(true)
    onChange(nextState)

    try {
      await updateUserState(uid, nextState)
    } catch {
      onChange(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <MapPin className="size-4 shrink-0 text-navy-200" strokeWidth={1.75} />
      <label htmlFor="state-selector" className="sr-only">
        Selecionar estado
      </label>
      <select
        id="state-selector"
        value={value}
        disabled={saving}
        onChange={(event) => handleChange(event.target.value as PortalState)}
        className="h-9 cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-wait disabled:opacity-60"
      >
        {portalStates.map((state) => (
          <option key={state.id} value={state.id} className="text-foreground">
            {state.label}
          </option>
        ))}
      </select>
    </div>
  )
}
