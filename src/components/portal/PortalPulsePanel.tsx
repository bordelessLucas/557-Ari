import { useState } from 'react'
import { Link } from 'react-router-dom'
import { articleHref } from '@/lib/articlePath'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import { formatArticleDate } from '@/services/articleService'
import type { Article } from '@/types/article'
import { Badge, Text } from '@/components/ui'
import { cn } from '@/lib/utils'

type PulseTab = 'read' | 'latest'

interface PortalPulsePanelProps {
  latest: Article[]
  mostRead: Article[]
  categoryNames: Record<string, string>
}

/** Painel sempre expandido: troca só a visualização (Mais lidas | Último minuto). */
export default function PortalPulsePanel({
  latest,
  mostRead,
  categoryNames,
}: PortalPulsePanelProps) {
  const [tab, setTab] = useState<PulseTab>('latest')
  const readList = mostRead.slice(0, 6)
  const latestList = latest.slice(0, 6)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab('latest')}
          className={cn(
            'flex-1 px-3 py-2.5 text-sm font-semibold transition-colors',
            tab === 'latest'
              ? 'border-b-2 border-red-700 text-navy-900'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Último minuto
        </button>
        <button
          type="button"
          onClick={() => setTab('read')}
          className={cn(
            'flex-1 px-3 py-2.5 text-sm font-semibold transition-colors',
            tab === 'read'
              ? 'border-b-2 border-red-700 text-navy-900'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Mais lidas
        </button>
      </div>

      <div className="p-3">
        {tab === 'read' ? (
          <ol className="space-y-3">
            {readList.map((item, index) => (
              <li key={item.id}>
                <Link to={articleHref(item)} className="group flex gap-3">
                  <span className="w-5 shrink-0 font-display text-xl font-bold leading-none text-red-700/80">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug group-hover:text-navy-700">
                      {item.adaptedTitle}
                    </span>
                    <Text variant="small" className="mt-1">
                      {formatArticleDate(item.publishedAt)}
                    </Text>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="divide-y divide-border">
            {latestList.map((item) => (
              <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link to={articleHref(item)} className="group flex gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-12 shrink-0 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImagePlaceholder className="size-12 shrink-0" />
                  )}
                  <div className="min-w-0 space-y-1">
                    <Badge variant="muted" className="text-[10px]">
                      {categoryLabel(item.categoryIds, categoryNames)}
                    </Badge>
                    <p className="text-sm font-semibold leading-snug group-hover:text-navy-700">
                      {item.adaptedTitle}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
