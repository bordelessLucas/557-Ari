import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import NewsFeed from '@/components/portal/NewsFeed'
import { Container, Text } from '@/components/ui'
import { newsCategories } from '@/constants/navigation'
import { listPortalArticlesByCategory } from '@/services/articleService'
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
        const [list, categories] = await Promise.all([
          listPortalArticlesByCategory(categorySlug, 40),
          listCategories().catch(() => []),
        ])
        if (cancelled) return
        setArticles(list)
        const map: Record<string, string> = {}
        categories.forEach((cat) => {
          map[cat.id] = cat.name
          if (cat.slug) map[cat.slug] = cat.name
        })
        setCategoryNames(map)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar esta categoria. Tente novamente.',
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

  return (
    <AppLayout
      user={user}
      documentTitle={`${label} — Agência da Notícia`}
    >
      <Container size="lg" className="space-y-4">
        <Text variant="small">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span className="text-muted-foreground"> / Notícias / </span>
          <span className="font-medium text-foreground">{label}</span>
        </Text>

        <NewsFeed
          title={label}
          subtitle={`Notícias da categoria ${label}.`}
          articles={articles}
          categoryNames={categoryNames}
          loading={loading}
          error={error}
          emptyTitle={`Nenhuma matéria em ${label}`}
          emptyDescription="Ainda não há publicações nesta categoria. Volte ao início ou escolha outra seção no menu."
        />
      </Container>
    </AppLayout>
  )
}
