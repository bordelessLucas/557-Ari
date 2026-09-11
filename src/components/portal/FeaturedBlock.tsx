import { Link } from 'react-router-dom'
import { articleHref } from '@/lib/articlePath'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import { formatArticleDate } from '@/services/articleService'
import type { Article } from '@/types/article'
import { Badge, Text } from '@/components/ui'

interface FeaturedBlockProps {
  articles: Article[]
  categoryNames: Record<string, string>
}

/** Manchete principal + trilho lateral (home). */
export default function FeaturedBlock({
  articles,
  categoryNames,
}: FeaturedBlockProps) {
  const featured = articles[0]
  const side = articles.slice(1, 4)
  if (!featured) return null

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-8">
      <Link
        to={articleHref(featured)}
        className="group block lg:col-span-7"
      >
        <article>
          {featured.imageUrl ? (
            <img
              src={featured.imageUrl}
              alt={featured.adaptedTitle}
              className="aspect-16/10 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="eager"
            />
          ) : (
            <ImagePlaceholder className="aspect-16/10 w-full" />
          )}
          <div className="mt-4 space-y-2">
            <Badge variant="default">
              {categoryLabel(featured.categoryIds, categoryNames)}
            </Badge>
            <h2 className="font-display text-2xl font-bold leading-[1.15] tracking-tight text-foreground transition-colors group-hover:text-navy-800 sm:text-3xl lg:text-[2.15rem]">
              {featured.adaptedTitle}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              {featured.adaptedSummary}
            </p>
            <Text variant="small">
              {formatArticleDate(featured.publishedAt)}
            </Text>
          </div>
        </article>
      </Link>

      {side.length > 0 && (
        <div className="flex flex-col divide-y divide-border border-t border-border pt-4 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {side.map((item) => (
            <Link
              key={item.id}
              to={articleHref(item)}
              className="group flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-20 shrink-0 object-cover sm:size-24"
                  loading="lazy"
                />
              ) : (
                <ImagePlaceholder className="size-20 shrink-0 sm:size-24" />
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <Badge variant="default" className="text-[10px]">
                  {categoryLabel(item.categoryIds, categoryNames)}
                </Badge>
                <p className="font-display text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-navy-700 sm:text-base">
                  {item.adaptedTitle}
                </p>
                <Text variant="small" className="line-clamp-2">
                  {item.adaptedSummary}
                </Text>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
