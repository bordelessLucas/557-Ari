import { Badge } from '@/components/ui'
import { statusLabel } from '@/data/adminMock'

const variantByStatus: Record<
  string,
  'default' | 'navy' | 'outline' | 'muted' | 'success' | 'warning'
> = {
  active: 'success',
  inactive: 'muted',
  collected: 'navy',
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

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantByStatus[status] ?? 'muted'}>{statusLabel(status)}</Badge>
  )
}
