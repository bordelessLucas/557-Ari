import { cn } from '@/lib/utils'

export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-linear-to-br from-navy-800 to-red-800', className)}
      aria-hidden
    />
  )
}

export function categoryLabel(
  ids: string[],
  categoryNames: Record<string, string>,
): string {
  if (!ids.length) return 'Notícia'
  return categoryNames[ids[0]] ?? ids[0]
}
