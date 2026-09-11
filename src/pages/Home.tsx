import { useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import FeaturedBlock from '@/components/portal/FeaturedBlock'
import PortalSidebar from '@/components/portal/PortalSidebar'
import SectionRail from '@/components/portal/SectionRail'
import { newsCategories } from '@/constants/navigation'
import { Alert, Container, Heading, Spinner, Text } from '@/components/ui'
import { listCategories } from '@/services/categoryService'
import { listPortalArticles } from '@/services/articleService'
import type { Article } from '@/types/article'

interface HomeProps {
  user: User
}

/** Editorias priorizadas nos trilhos da home (quando houver matérias). */
const HOME_RAIL_SLUGS = [
  'politica',
  'policia',
  'cidades',
  'economia',
  'esporte',
  'saude',
]

function articleMatchesCategory(article: Article, slug: string): boolean {
  return article.categoryIds.some(
    (id) => id === slug || id.toLowerCase() === slug,
  )
}

export default function Home({ user }: HomeProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [list, categories] = await Promise.all([
          listPortalArticles(60),
          listCategories().catch(() => []),
        ])
        if (cancelled) return
        setArticles(list)
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
              : 'Não foi possível carregar as notícias.',
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
  }, [])

  const featuredPool = articles.slice(0, 4)

  const rails = useMemo(() => {
    const used = new Set(articles.slice(0, 4).map((a) => a.id))
    return HOME_RAIL_SLUGS.map((slug) => {
      const label =
        categoryNames[slug] ??
        newsCategories.flat().find((c) => c.slug === slug)?.label ??
        slug
      const items = articles
        .filter(
          (item) => !used.has(item.id) && articleMatchesCategory(item, slug),
        )
        .slice(0, 5)
      return { slug, label, items }
    }).filter((rail) => rail.items.length >= 2)
  }, [articles, categoryNames])

  // "Mais lidas" preview: reordena por título length como proxy estável (front-only)
  const mostRead = useMemo(() => {
    return [...articles]
      .sort((a, b) => b.adaptedTitle.length - a.adaptedTitle.length)
      .slice(0, 5)
  }, [articles])

  return (
    <AppLayout
      user={user}
      documentTitle="Agência da Notícia — Início"
      latestArticles={articles}
    >
      <Container size="lg" className="space-y-8 py-6 sm:py-8">
        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
            Capa
          </p>
          <Heading
            level={2}
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Destaques
          </Heading>
          <Text variant="muted" className="max-w-2xl">
            As principais notícias da Agência da Notícia — visão editorial do
            portal.
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
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <Heading level={3}>Nenhuma matéria publicada ainda</Heading>
            <Text variant="muted" className="mx-auto mt-2 max-w-md">
              Em breve a redação publica as primeiras notícias aqui.
            </Text>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-8">
              <FeaturedBlock
                articles={featuredPool}
                categoryNames={categoryNames}
              />
              {rails.map((rail) => (
                <SectionRail
                  key={rail.slug}
                  title={rail.label}
                  slug={rail.slug}
                  articles={rail.items}
                  categoryNames={categoryNames}
                />
              ))}
              {rails.length === 0 && articles.length > 4 && (
                <SectionRail
                  title="Mais notícias"
                  slug="geral"
                  articles={articles.slice(4, 9)}
                  categoryNames={categoryNames}
                />
              )}
            </div>
            <div className="lg:col-span-4">
              <PortalSidebar
                latest={articles}
                mostRead={mostRead}
                categoryNames={categoryNames}
              />
            </div>
          </div>
        )}
      </Container>
    </AppLayout>
  )
}
