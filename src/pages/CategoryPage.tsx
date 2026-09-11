import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import PortalSidebar from '@/components/portal/PortalSidebar'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import { newsCategories } from '@/constants/navigation'
import { articleHref } from '@/lib/articlePath'
import {
  Alert,
  Badge,
  Container,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import {
  formatArticleDate,
  listPortalArticles,
  listPortalArticlesByCategory,
} from '@/services/articleService'
import { listCategories } from '@/services/categoryService'
import type { Article } from '@/types/article'

interface CategoryPageProps {
  user: User
}

function resolveCategoryLabel(
  slug: string,
  categoryNames: Record<string, string>,
): string {
  if (categoryNames[slug]) return categoryNames[slug]
  const fromNav = newsCategories.flat().find((item) => item.slug === slug)
  return fromNav?.label ?? slug
}

export default function CategoryPage({ user }: CategoryPageProps) {
  const { categorySlug = '' } = useParams<{ categorySlug: string }>()
  const [articles, setArticles] = useState<Article[]>([])
  const [allLatest, setAllLatest] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const label = resolveCategoryLabel(categorySlug, categoryNames)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!categorySlug) return
      setLoading(true)
      setError(null)
      try {
        const [list, latest, categories] = await Promise.all([
          listPortalArticlesByCategory(categorySlug, 48),
          listPortalArticles(20),
          listCategories().catch(() => []),
        ])
        if (cancelled) return
        setArticles(list)
        setAllLatest(latest)
        const map: Record<string, string> = {}
        categories.forEach((cat) => {
          map[cat.id] = cat.name
          if (cat.slug) map[cat.slug] = cat.name
        })
        newsCategories.flat().forEach((cat) => {
          if (!map[cat.slug]) map[cat.slug] = cat.label
        })
        setCategoryNames(map)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar esta categoria.',
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
  }, [categorySlug])

  const lead = articles[0]
  const grid = articles.slice(1)

  return (
    <AppLayout
      user={user}
      documentTitle={`${label} — Agência da Notícia`}
      activeCategorySlug={categorySlug}
    >
      <Container size="lg" className="space-y-6 py-6 sm:py-8">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span> / </span>
          <span className="font-medium text-foreground">{label}</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
            Editoria
          </p>
          <Heading
            level={1}
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {label}
          </Heading>
          <Text variant="muted" className="max-w-xl">
            Arquivo de matérias em {label}.
          </Text>
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
        ) : !lead ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <Heading level={3}>Nenhuma matéria em {label}</Heading>
            <Text variant="muted" className="mx-auto mt-2 max-w-md">
              Ainda não há publicações nesta categoria.
            </Text>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <Link to={articleHref(lead)} className="group block space-y-3">
                {lead.imageUrl ? (
                  <img
                    src={lead.imageUrl}
                    alt=""
                    className="aspect-16/9 w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <ImagePlaceholder className="aspect-16/9 w-full" />
                )}
                <Badge variant="default">{label}</Badge>
                <h2 className="font-display text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-navy-700 sm:text-3xl">
                  {lead.adaptedTitle}
                </h2>
                <p className="text-base text-muted-foreground">
                  {lead.adaptedSummary}
                </p>
                <Text variant="small">
                  {formatArticleDate(lead.publishedAt)}
                </Text>
              </Link>

              <div className="grid gap-6 sm:grid-cols-2">
                {grid.map((item) => (
                  <Link
                    key={item.id}
                    to={articleHref(item)}
                    className="group flex flex-col gap-3 border-t border-border pt-4"
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
                    <Badge variant="muted" className="w-fit text-[10px]">
                      {categoryLabel(item.categoryIds, categoryNames)}
                    </Badge>
                    <h3 className="font-display text-base font-bold leading-snug transition-colors group-hover:text-navy-700 sm:text-lg">
                      {item.adaptedTitle}
                    </h3>
                    <Text variant="small" className="line-clamp-3">
                      {item.adaptedSummary}
                    </Text>
                    <Text variant="small">
                      {formatArticleDate(item.publishedAt)}
                    </Text>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <PortalSidebar
                latest={allLatest}
                mostRead={articles.slice(0, 5)}
                categoryNames={categoryNames}
              />
            </div>
          </div>
        )}
      </Container>
    </AppLayout>
  )
}
