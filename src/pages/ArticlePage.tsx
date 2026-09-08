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
import {
  formatArticleDate,
  getArticleById,
} from '@/services/articleService'
import { listCategories } from '@/services/categoryService'
import type { Article } from '@/types/article'

interface ArticlePageProps {
  user: User
}

export default function ArticlePage({ user }: ArticlePageProps) {
  const { articleId } = useParams<{ articleId: string }>()
  const [article, setArticle] = useState<Article | null>(null)
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
        if (!item || item.status !== 'published') {
          setArticle(null)
          setError('Matéria não encontrada ou ainda não publicada.')
        } else {
          setArticle(item)
        }
        const map: Record<string, string> = {}
        categories.forEach((cat) => {
          map[cat.id] = cat.name
        })
        setCategoryNames(map)
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

  return (
    <AppLayout user={user}>
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/">← Voltar ao feed</Link>
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error || !article ? (
          <Alert variant="destructive">
            <p className="text-sm">{error ?? 'Matéria indisponível.'}</p>
          </Alert>
        ) : (
          <article className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {article.categoryIds.map((id) => (
                <Badge key={id} variant="default">
                  {categoryNames[id] ?? id}
                </Badge>
              ))}
              <Text variant="small">
                {formatArticleDate(article.publishedAt)}
              </Text>
            </div>
            <Heading level={1}>{article.adaptedTitle}</Heading>
            <Text variant="muted" className="text-base">
              {article.adaptedSummary}
            </Text>
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt=""
                className="max-h-[420px] w-full rounded-lg object-cover"
              />
            )}
            <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {article.adaptedBody}
            </div>
            {article.sourceName && (
              <Text variant="small">Fonte original: {article.sourceName}</Text>
            )}
          </article>
        )}
      </Container>
    </AppLayout>
  )
}
