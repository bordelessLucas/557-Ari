import { useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import NewsFeed from '@/components/portal/NewsFeed'
import { Container } from '@/components/ui'
import { listCategories } from '@/services/categoryService'
import { listPortalArticles } from '@/services/articleService'
import type { Article } from '@/types/article'

interface HomeProps {
  user: User
}

const PAGE_SIZE = 24

export default function Home({ user }: HomeProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const isFirstPage = limit === PAGE_SIZE
      if (isFirstPage) setLoading(true)
      else setLoadingMore(true)
      setError(null)
      try {
        const [list, categories] = await Promise.all([
          listPortalArticles(limit),
          listCategories().catch(() => []),
        ])
        if (cancelled) return
        setArticles(list)
        setHasMore(list.length >= limit)
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
              : 'Não foi possível carregar as notícias. Tente novamente em instantes.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [limit])

  function handleLoadMore() {
    setLimit((current) => current + PAGE_SIZE)
  }

  return (
    <AppLayout user={user} documentTitle="Agência da Notícia — Início">
      <Container size="lg">
        <NewsFeed
          title="Destaques"
          subtitle="As principais notícias publicadas no portal."
          articles={articles}
          categoryNames={categoryNames}
          loading={loading}
          error={error}
          emptyTitle="Nenhuma matéria publicada ainda"
          emptyDescription="Em breve a redação publica as primeiras notícias aqui."
          hasMore={hasMore && !loading}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
        />
      </Container>
    </AppLayout>
  )
}
