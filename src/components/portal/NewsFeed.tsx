import { Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
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
}

export default function NewsFeed({
  title,
  subtitle,
  articles,
  categoryNames,
  loading,
  error,
  emptyTitle = 'Nenhuma matéria publicada ainda',
  emptyDescription = 'Assim que a redação publicar, o feed aparece aqui.',
}: NewsFeedProps) {
  function categoryLabel(ids: string[]): string {
    if (!ids.length) return 'Notícia'
    return categoryNames[ids[0]] ?? ids[0]
  }

  const featured = articles[0]
  const side = articles.slice(1, 4)
  const rest = articles.slice(4)

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2}>{title}</Heading>
        {subtitle && (
          <Text variant="muted" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>

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
        <Card>
          <CardContent className="space-y-2 py-12 text-center">
            <Heading level={3}>{emptyTitle}</Heading>
            <Text variant="muted">{emptyDescription}</Text>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-12">
            <Link
              to={`/noticias/${featured.id}`}
              className="block lg:col-span-7"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                {featured.imageUrl ? (
                  <img
                    src={featured.imageUrl}
                    alt=""
                    className="aspect-16/10 w-full object-cover"
                  />
                ) : (
                  <div className="aspect-16/10 bg-linear-to-br from-navy-700 to-red-800" />
                )}
                <CardHeader>
                  <Badge variant="default">
                    {categoryLabel(featured.categoryIds)}
                  </Badge>
                  <CardTitle className="mt-2 text-xl">
                    {featured.adaptedTitle}
                  </CardTitle>
                  <CardDescription>{featured.adaptedSummary}</CardDescription>
                  <Text variant="small" className="mt-2">
                    {formatArticleDate(featured.publishedAt)}
                  </Text>
                </CardHeader>
              </Card>
            </Link>

            <div className="flex flex-col gap-4 lg:col-span-5">
              {side.map((item) => (
                <Link key={item.id} to={`/noticias/${item.id}`}>
                  <Card className="flex gap-4 p-4 transition-shadow hover:shadow-md">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="size-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-20 shrink-0 rounded-lg bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <Badge variant="default" className="mb-2">
                        {categoryLabel(item.categoryIds)}
                      </Badge>
                      <p className="text-sm font-semibold leading-snug text-foreground">
                        {item.adaptedTitle}
                      </p>
                      <Text variant="small" className="mt-1 line-clamp-2">
                        {item.adaptedSummary}
                      </Text>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Últimas notícias</CardTitle>
              <CardDescription>
                {rest.length
                  ? 'Mais matérias publicadas recentemente.'
                  : 'Confira também o destaque acima.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(rest.length ? rest : articles.slice(0, 4)).map((item) => (
                <Link
                  key={item.id}
                  to={`/noticias/${item.id}`}
                  className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-24 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <Badge variant="muted">
                      {categoryLabel(item.categoryIds)}
                    </Badge>
                    <p className="font-semibold text-foreground">
                      {item.adaptedTitle}
                    </p>
                    <Text variant="small" className="line-clamp-2">
                      {item.adaptedSummary}
                    </Text>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
