import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import ShareActions from '@/components/portal/ShareActions'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import { newsCategories } from '@/constants/navigation'
import {
  articleHref,
  categoryHref,
  estimateReadMinutes,
  slugifyTitle,
} from '@/lib/articlePath'
import {
  Alert,
  Badge,
  Button,
  Container,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import {
  formatArticleDate,
  listPortalArticlesByCategory,
  resolvePortalArticle,
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

function resolveCategoryLink(
  idOrSlug: string,
  categoryNames: Record<string, string>,
): { label: string; href: string } {
  const fromNav = newsCategories
    .flat()
    .find((item) => item.slug === idOrSlug || item.label === idOrSlug)
  const label = categoryNames[idOrSlug] ?? fromNav?.label ?? idOrSlug
  const slug = fromNav?.slug ?? idOrSlug
  return { label, href: categoryHref(slug) }
}

export default function ArticlePage({ user }: ArticlePageProps) {
  const { articleId: param = '' } = useParams<{ articleId: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!param) return
      setLoading(true)
      setError(null)
      try {
        const [item, categories] = await Promise.all([
          resolvePortalArticle(param),
          listCategories().catch(() => []),
        ])
        if (cancelled) return

        const map: Record<string, string> = {}
        categories.forEach((cat) => {
          map[cat.id] = cat.name
          if (cat.slug) map[cat.slug] = cat.name
        })
        newsCategories.flat().forEach((cat) => {
          if (!map[cat.slug]) map[cat.slug] = cat.label
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
            const relatedList = await listPortalArticlesByCategory(primary, 8)
            if (!cancelled) {
              setRelated(
                relatedList.filter((entry) => entry.id !== item.id).slice(0, 4),
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
  }, [param])

  // Canonical: slug--id (aceita ID legado e redireciona)
  if (article && !loading) {
    const expected = `${slugifyTitle(article.adaptedTitle)}--${article.id}`
    if (param !== expected) {
      return <Navigate to={articleHref(article)} replace />
    }
  }

  const primary = article?.categoryIds[0]
    ? resolveCategoryLink(article.categoryIds[0], categoryNames)
    : null
  const readMinutes = article
    ? estimateReadMinutes(article.adaptedBody)
    : 1

  return (
    <AppLayout
      user={user}
      documentTitle={
        article
          ? `${article.adaptedTitle} — Agência da Notícia`
          : 'Matéria — Agência da Notícia'
      }
      activeCategorySlug={
        article?.categoryIds[0]
          ? newsCategories
              .flat()
              .find(
                (c) =>
                  c.slug === article.categoryIds[0] ||
                  c.label === categoryNames[article.categoryIds[0]],
              )?.slug
          : undefined
      }
    >
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-6 sm:py-8 lg:max-w-4xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span>/</span>
          {primary ? (
            <Link to={primary.href} className="text-navy-600 hover:underline">
              {primary.label}
            </Link>
          ) : (
            <span>Notícias</span>
          )}
          <span>/</span>
          <span className="line-clamp-1 font-medium text-foreground">
            {article?.adaptedTitle ?? 'Matéria'}
          </span>
        </nav>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error || !article ? (
          <Alert variant="destructive">
            <p className="text-sm">{error ?? 'Matéria indisponível.'}</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </Alert>
        ) : (
          <>
            <article className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {article.categoryIds.map((id) => {
                  const cat = resolveCategoryLink(id, categoryNames)
                  return (
                    <Link key={id} to={cat.href}>
                      <Badge variant="default">{cat.label}</Badge>
                    </Link>
                  )
                })}
              </div>

              <Heading
                level={1}
                className="font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]"
              >
                {article.adaptedTitle}
              </Heading>

              <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {article.adaptedSummary}
              </p>

              <div className="space-y-1 border-y border-border py-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">
                    Redação Agência da Notícia
                  </span>
                  {' · '}
                  {formatArticleDate(article.publishedAt)}
                  {' · '}
                  {readMinutes} min de leitura
                </p>
                {article.sourceName && (
                  <p className="text-xs">Fonte: {article.sourceName}</p>
                )}
              </div>

              {article.imageUrl ? (
                <figure className="space-y-2">
                  <img
                    src={article.imageUrl}
                    alt={article.adaptedTitle}
                    className="aspect-16/9 max-h-[480px] w-full object-cover"
                  />
                  <figcaption className="text-xs text-muted-foreground">
                    Imagem de capa · {article.adaptedTitle}
                  </figcaption>
                </figure>
              ) : null}

              <div className="space-y-5 text-[17px] leading-8 text-foreground">
                {bodyParagraphs(article.adaptedBody).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <ShareActions
                title={article.adaptedTitle}
                className="border-t border-border pt-4"
              />
            </article>

            {related.length > 0 && (
              <section className="space-y-4 border-t border-border pt-8">
                <div className="border-b-2 border-navy-900 pb-2">
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Relacionadas
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      to={articleHref(item)}
                      className="group space-y-2"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="aspect-16/10 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImagePlaceholder className="aspect-16/10 w-full" />
                      )}
                      <Badge variant="muted" className="text-[10px]">
                        {categoryLabel(item.categoryIds, categoryNames)}
                      </Badge>
                      <p className="font-display text-base font-bold leading-snug transition-colors group-hover:text-navy-700">
                        {item.adaptedTitle}
                      </p>
                      <Text variant="small" className="line-clamp-2">
                        {item.adaptedSummary}
                      </Text>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </Container>
    </AppLayout>
  )
}
