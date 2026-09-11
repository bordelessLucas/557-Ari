import { Link } from 'react-router-dom'
import { Alert, Badge, Heading, Spinner, Text } from '@/components/ui'
import { articleHref } from '@/lib/articlePath'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import { formatArticleDate } from '@/services/articleService'
import type { Article } from '@/types/article'

interface NewsFeedProps {
  title: string
  subtitle?: string
  articles: Article[]
  categoryNames: Record<string, string>
  loading: boolean
  error: string | null
  emptyTitle?: string
  emptyDescription?: string
  onLoadMore?: () => void
  loadingMore?: boolean
  hasMore?: boolean
}

/** Feed genérico (legado). Home/categoria usam layouts editoriais dedicados. */
export default function NewsFeed({
  title,
  subtitle,
  articles,
  categoryNames,
  loading,
  error,
  emptyTitle = 'Nenhuma matéria publicada ainda',
  emptyDescription = 'Assim que a redação publicar, as notícias aparecem aqui.',
  onLoadMore,
  loadingMore,
  hasMore,
}: NewsFeedProps) {
  const featured = articles[0]
  const side = articles.slice(1, 4)
  const rest = articles.slice(4)

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Heading level={2} className="font-display font-bold tracking-tight">
          {title}
        </Heading>
        {subtitle && (
          <Text variant="muted" className="max-w-2xl">
            {subtitle}
          </Text>
        )}
      </header>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !featured ? (
        <div className="rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
          <Heading level={3}>{emptyTitle}</Heading>
          <Text variant="muted" className="mx-auto mt-2 max-w-md">
            {emptyDescription}
          </Text>
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
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
                  <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-navy-700 sm:text-3xl">
                    {featured.adaptedTitle}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {featured.adaptedSummary}
                  </p>
                  <Text variant="small">
                    {formatArticleDate(featured.publishedAt)}
                  </Text>
                </div>
              </article>
            </Link>

            {side.length > 0 && (
              <div className="flex flex-col divide-y divide-border lg:col-span-5">
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
                      <Badge variant="default">
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

          {rest.length > 0 && (
            <section className="space-y-4 border-t border-border pt-8">
              <h3 className="font-display text-lg font-bold text-foreground">
                Mais notícias
              </h3>
              <ul className="divide-y divide-border">
                {rest.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={articleHref(item)}
                      className="group flex items-center gap-4 py-4"
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
                      <div className="min-w-0 flex-1 space-y-1">
                        <Badge variant="muted">
                          {categoryLabel(item.categoryIds, categoryNames)}
                        </Badge>
                        <p className="font-display font-bold text-foreground transition-colors group-hover:text-navy-700">
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
            </section>
          )}

          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {loadingMore ? 'Carregando…' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
