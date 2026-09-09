import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import {
  Alert,
  Badge,
  Button,
  Container,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import { newsCategories } from '@/constants/navigation'
import {
  formatArticleDate,
  getArticleById,
  listPortalArticlesByCategory,
} from '@/services/articleService'
import { listCategories } from '@/services/categoryService'
import type { Article } from '@/types/article'

interface ArticlePageProps {
  user: User
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function categoryHref(idOrSlug: string): string | null {
  const fromNav = newsCategories
    .flat()
    .find((item) => item.slug === idOrSlug || item.label === idOrSlug)
  if (fromNav) return `/noticias/categoria/${fromNav.slug}`
  // ids do Firestore podem coincidir com slug
  if (/^[a-z0-9-]+$/i.test(idOrSlug)) {
    return `/noticias/categoria/${idOrSlug}`
  }
  return null
}

export default function ArticlePage({ user }: ArticlePageProps) {
  const { articleId } = useParams<{ articleId: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!articleId) return
      setLoading(true)
      setError(null)
      try {
        const [item, categories] = await Promise.all([
          getArticleById(articleId),
          listCategories().catch(() => []),
        ])
        if (cancelled) return

        const map: Record<string, string> = {}
        categories.forEach((cat) => {
          map[cat.id] = cat.name
          if (cat.slug) map[cat.slug] = cat.name
        })
        setCategoryNames(map)

        if (!item || item.status !== 'published') {
          setArticle(null)
          setRelated([])
          setError('Matéria não encontrada ou indisponível.')
        } else {
          setArticle(item)
          const primary = item.categoryIds[0]
          if (primary) {
            const relatedList = await listPortalArticlesByCategory(primary, 6)
            if (!cancelled) {
              setRelated(
                relatedList.filter((entry) => entry.id !== item.id).slice(0, 3),
              )
            }
          } else {
            setRelated([])
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar a matéria.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [articleId])

  const primaryCategory = article?.categoryIds[0]
  const primaryLabel = primaryCategory
    ? (categoryNames[primaryCategory] ?? primaryCategory)
    : null
  const primaryHref = primaryCategory
    ? categoryHref(primaryCategory)
    : null

  return (
    <AppLayout
      user={user}
      documentTitle={
        article
          ? `${article.adaptedTitle} — Agência da Notícia`
          : 'Matéria — Agência da Notícia'
      }
    >
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button asChild variant="outline" size="sm">
            <Link to="/">← Início</Link>
          </Button>
          {primaryHref && primaryLabel && (
            <Button asChild variant="ghost" size="sm">
              <Link to={primaryHref}>{primaryLabel}</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error || !article ? (
          <Alert variant="destructive">
            <p className="text-sm">{error ?? 'Matéria indisponível.'}</p>
          </Alert>
        ) : (
          <>
            <article className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {article.categoryIds.map((id) => {
                  const name = categoryNames[id] ?? id
                  const href = categoryHref(id)
                  return href ? (
                    <Link key={id} to={href}>
                      <Badge variant="default">{name}</Badge>
                    </Link>
                  ) : (
                    <Badge key={id} variant="default">
                      {name}
                    </Badge>
                  )
                })}
              </div>

              <Heading level={1} className="text-3xl sm:text-4xl">
                {article.adaptedTitle}
              </Heading>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{formatArticleDate(article.publishedAt)}</span>
                {article.sourceName && (
                  <span>· Fonte: {article.sourceName}</span>
                )}
              </div>

              <p className="text-lg leading-relaxed text-muted-foreground">
                {article.adaptedSummary}
              </p>

              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.adaptedTitle}
                  className="aspect-16/9 max-h-[420px] w-full object-cover"
                />
              ) : null}

              <div className="space-y-4 text-base leading-7 text-foreground">
                {bodyParagraphs(article.adaptedBody).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </article>

            {related.length > 0 && (
              <section className="space-y-4 border-t border-border pt-8">
                <h2 className="text-lg font-semibold text-foreground">
                  Relacionadas
                </h2>
                <ul className="space-y-4">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/noticias/${item.id}`}
                        className="group block space-y-1"
                      >
                        <p className="font-semibold text-foreground transition-colors group-hover:text-navy-700">
                          {item.adaptedTitle}
                        </p>
                        <Text variant="small" className="line-clamp-2">
                          {item.adaptedSummary}
                        </Text>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  )
}
