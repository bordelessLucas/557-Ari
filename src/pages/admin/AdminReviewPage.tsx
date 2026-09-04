import { useCallback, useEffect, useState } from 'react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Spinner,
  Text,
  Textarea,
} from '@/components/ui'
import { auth } from '@/lib/firebase'
import {
  approveArticle,
  isAiApiConfigured,
  rejectArticle,
} from '@/services/aiApi'
import {
  formatArticleDate,
  listArticlesByStatus,
} from '@/services/articleService'
import { listCategories } from '@/services/categoryService'
import type { Article, ArticleStatus } from '@/types/article'

interface Props {
  viewOnly?: boolean
}

type FilterStatus = ArticleStatus | 'all'

export default function AdminReviewPage({ viewOnly }: Props) {
  const [filter, setFilter] = useState<FilterStatus>('review')
  const [articles, setArticles] = useState<Article[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, categories] = await Promise.all([
        listArticlesByStatus(filter),
        listCategories().catch(() => []),
      ])
      setArticles(list)
      const map: Record<string, string> = {}
      categories.forEach((cat) => {
        map[cat.id] = cat.name
      })
      setCategoryNames(map)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a fila de revisão.',
      )
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  async function handleApprove(article: Article) {
    if (viewOnly) return
    setActingId(article.id)
    setError(null)
    setSuccess(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada.')
      const token = await user.getIdToken()
      await approveArticle(article.id, token)
      setSuccess(`Aprovado: ${article.adaptedTitle}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao aprovar.')
    } finally {
      setActingId(null)
    }
  }

  async function handleReject(article: Article) {
    if (viewOnly) return
    setActingId(article.id)
    setError(null)
    setSuccess(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada.')
      const token = await user.getIdToken()
      await rejectArticle(article.id, token, rejectReasons[article.id])
      setSuccess(`Rejeitado: ${article.adaptedTitle}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao rejeitar.')
    } finally {
      setActingId(null)
    }
  }

  function categoryLabel(ids: string[]): string {
    if (!ids.length) return '—'
    return ids.map((id) => categoryNames[id] ?? id).join(', ')
  }

  const pendingCount = articles.filter((a) => a.status === 'review').length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Aguardando revisão</Heading>
          <Text variant="muted" className="mt-1">
            Compare o original com a versão adaptada pela IA antes de publicar.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
          {!isAiApiConfigured() && (
            <Badge variant="warning">API não configurada</Badge>
          )}
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterStatus)}
          >
            <option value="review">Em revisão</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {viewOnly && (
        <Alert variant="info">
          <p className="text-sm">
            Seu perfil é de visualização. Aprovar ou rejeitar exige permissão de
            edição total.
          </p>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <p className="text-sm">{success}</p>
        </Alert>
      )}

      <Text variant="muted">
        {filter === 'review'
          ? `${pendingCount} matéria(s) na fila de revisão.`
          : `${articles.length} matéria(s) neste filtro.`}
      </Text>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Text variant="muted">
              Nenhum artigo neste filtro. Processe notícias coletadas com IA
              primeiro.
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {item.adaptedTitle}
                    </CardTitle>
                    {item.insufficientInfo && (
                      <Badge variant="warning">Info insuficiente</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    Original: {item.originalTitle}
                  </CardDescription>
                </div>
                <StatusBadge status={item.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Text variant="small">Fonte</Text>
                    <p className="text-sm font-medium">{item.sourceName}</p>
                  </div>
                  <div>
                    <Text variant="small">Categoria</Text>
                    <p className="text-sm font-medium">
                      {categoryLabel(item.categoryIds)}
                    </p>
                  </div>
                  <div>
                    <Text variant="small">Gerado em</Text>
                    <p className="text-sm font-medium">
                      {formatArticleDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="max-h-48 w-full rounded-lg object-cover"
                  />
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <Text variant="small">Original</Text>
                    <p className="mt-2 text-sm font-semibold">
                      {item.originalTitle}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.originalSummary || '—'}
                    </p>
                    {item.originalUrl && (
                      <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs text-navy-600 hover:underline"
                      >
                        Abrir fonte
                      </a>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <Text variant="small">Adaptado pela IA</Text>
                    <p className="mt-2 text-sm font-semibold">
                      {item.adaptedTitle}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.adaptedSummary}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {item.adaptedBody}
                    </p>
                  </div>
                </div>

                {item.aiWarnings.length > 0 && (
                  <Alert variant="warning">
                    <p className="text-sm">
                      Avisos da IA: {item.aiWarnings.join(' · ')}
                    </p>
                  </Alert>
                )}

                {item.status === 'rejected' && item.rejectionReason && (
                  <Text variant="small">
                    Motivo da rejeição: {item.rejectionReason}
                  </Text>
                )}

                {!viewOnly && item.status === 'review' && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="space-y-2">
                      <Text variant="small">Motivo da rejeição (opcional)</Text>
                      <Textarea
                        value={rejectReasons[item.id] ?? ''}
                        onChange={(e) =>
                          setRejectReasons((current) => ({
                            ...current,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="Ex.: fatos incompletos, tom inadequado..."
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        loading={actingId === item.id}
                        disabled={!isAiApiConfigured()}
                        onClick={() => void handleApprove(item)}
                      >
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        loading={actingId === item.id}
                        disabled={!isAiApiConfigured()}
                        onClick={() => void handleReject(item)}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
