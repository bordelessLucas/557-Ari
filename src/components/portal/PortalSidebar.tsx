import { Link } from 'react-router-dom'
import PortalPulsePanel from '@/components/portal/PortalPulsePanel'
import type { Article } from '@/types/article'

interface PortalSidebarProps {
  latest: Article[]
  mostRead: Article[]
  categoryNames: Record<string, string>
}

export default function PortalSidebar({
  latest,
  mostRead,
  categoryNames,
}: PortalSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <PortalPulsePanel
        latest={latest}
        mostRead={mostRead}
        categoryNames={categoryNames}
      />

      <section className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Publicidade
        </p>
        <Link
          to="/sobre"
          className="mt-2 inline-block text-xs font-medium text-navy-700 hover:underline"
        >
          Anuncie conosco
        </Link>
      </section>
    </aside>
  )
}
