import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

/** Altura alinhada dos dois painéis na revisão (desktop e mobile). */
const COLLAPSED_HEIGHT_CLASS = 'h-72'

interface ReviewComparePanelProps {
  label: string
  tone?: 'muted' | 'plain'
  children: ReactNode
}

export function ReviewComparePanel({
  label,
  tone = 'plain',
  children,
}: ReviewComparePanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = bodyRef.current
    if (!node) return

    function measure() {
      if (!bodyRef.current) return
      if (expanded) {
        setNeedsToggle(true)
        return
      }
      const { scrollHeight, clientHeight } = bodyRef.current
      setNeedsToggle(scrollHeight > clientHeight + 4)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [expanded, children])

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-lg border border-border',
        tone === 'muted' ? 'bg-muted/30' : 'bg-background',
        expanded ? 'h-auto' : COLLAPSED_HEIGHT_CLASS,
      )}
    >
      <div className="shrink-0 border-b border-border/70 px-4 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={bodyRef}
          className={cn(
            'h-full px-4 py-3',
            expanded ? 'overflow-visible' : 'overflow-hidden',
          )}
        >
          {children}
        </div>
        {!expanded && needsToggle && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-16',
              tone === 'muted'
                ? 'bg-gradient-to-t from-muted to-transparent'
                : 'bg-gradient-to-t from-background to-transparent',
            )}
            aria-hidden
          />
        )}
      </div>

      {needsToggle && (
        <div className="shrink-0 border-t border-border/70 px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-center gap-1.5 text-navy-700 hover:bg-navy-50 hover:text-navy-900"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" strokeWidth={1.75} />
                Recolher
              </>
            ) : (
              <>
                <ChevronDown className="size-4" strokeWidth={1.75} />
                Ler mais
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

interface ReviewCompareGridProps {
  original: ReactNode
  adapted: ReactNode
}

export function ReviewCompareGrid({
  original,
  adapted,
}: ReviewCompareGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
      <ReviewComparePanel label="Original" tone="muted">
        {original}
      </ReviewComparePanel>
      <ReviewComparePanel label="Versão para o portal" tone="plain">
        {adapted}
      </ReviewComparePanel>
    </div>
  )
}
