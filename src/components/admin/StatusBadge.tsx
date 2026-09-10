import { Badge } from '@/components/ui'
import { statusLabel } from '@/lib/statusLabels'
import { cn } from '@/lib/utils'

const variantByStatus: Record<
  string,
  'default' | 'navy' | 'outline' | 'muted' | 'success' | 'warning'
> = {
  active: 'success',
  inactive: 'muted',
  collected: 'navy',
  prepared: 'success',
  processing: 'warning',
  review: 'warning',
  approved: 'success',
  rejected: 'default',
  published: 'navy',
  failed: 'default',
  error: 'default',
  full: 'navy',
  view: 'muted',
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <Badge
      variant={variantByStatus[status] ?? 'muted'}
      className={cn('whitespace-nowrap', className)}
    >
      {statusLabel(status)}
    </Badge>
  )
}
