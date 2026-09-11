import { Link } from 'react-router-dom'
import { articleHref, categoryHref } from '@/lib/articlePath'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import type { Article } from '@/types/article'
import { Badge, Text } from '@/components/ui'

interface SectionRailProps {
  title: string
  slug: string
  articles: Article[]
  categoryNames: Record<string, string>
}

/** Bloco de editoria na home (título + grade). */
export default function SectionRail({
  title,
  slug,
  articles,
  categoryNames,
}: SectionRailProps) {
  if (!articles.length) return null
  const [lead, ...rest] = articles.slice(0, 5)

  return (
    <section className="space-y-4 border-t border-border pt-8">
      <div className="flex items-end justify-between gap-3 border-b-2 border-navy-900 pb-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        <Link
          to={categoryHref(slug)}
          className="shrink-0 text-xs font-semibold uppercase tracking-wide text-red-700 hover:underline"
        >
          Ver tudo
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Link
          to={articleHref(lead)}
          className="group block space-y-3 md:col-span-5"
        >
          {lead.imageUrl ? (
            <img
              src={lead.imageUrl}
              alt=""
              className="aspect-16/10 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder className="aspect-16/10 w-full" />
          )}
          <Badge variant="default">
            {categoryLabel(lead.categoryIds, categoryNames)}
          </Badge>
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-navy-700 sm:text-xl">
            {lead.adaptedTitle}
          </h3>
          <Text variant="small" className="line-clamp-3">
            {lead.adaptedSummary}
          </Text>
        </Link>

        <ul className="divide-y divide-border md:col-span-7">
          {rest.map((item) => (
            <li key={item.id}>
              <Link
                to={articleHref(item)}
                className="group flex gap-3 py-3 first:pt-0"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-16 w-24 shrink-0 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder className="h-16 w-24 shrink-0" />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="font-display text-sm font-bold leading-snug transition-colors group-hover:text-navy-700 sm:text-base">
                    {item.adaptedTitle}
                  </p>
                  <Text variant="small" className="line-clamp-2">
                    {item.adaptedSummary}
                  </Text>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
