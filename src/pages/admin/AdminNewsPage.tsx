import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Alert,
  Badge,
  Button,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import { auth } from '@/lib/firebase'
import { collectedNewsDisplayStatus } from '@/lib/statusLabels'
import {
  isAiApiConfigured,
  processCollectedWithAi,
  processOneCollectedWithAi,
} from '@/services/aiApi'
import {
  collectAllSources,
  isCollectApiConfigured,
} from '@/services/collectApi'
import {
  formatCollectedDate,
  listCollectedNews,
} from '@/services/collectedNewsService'
import { listCategories } from '@/services/categoryService'
import type { CollectedNews } from '@/types/collectedNews'
import type { AdminPageId } from '@/constants/adminNavigation'

type NewsFilter = 'all' | 'pending_ai' | 'prepared' | 'published' | 'error'

interface Props {
  viewOnly?: boolean
  onNavigate?: (page: AdminPageId) => void
}

export default function AdminNewsPage({ viewOnly, onNavigate }: Props) {
  const [items, setItems] = useState<CollectedNews[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<NewsFilter>('all')
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [processingAi, setProcessingAi] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showReviewCta, setShowReviewCta] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [news, categories] = await Promise.all([
        listCollectedNews(),
        listCategories().catch(() => []),
      ])
      setItems(news)
      const map: Record<string, string> = {}
      categories.forEach((cat) => {
        map[cat.id] = cat.name
      })
      setCategoryNames(map)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as notícias coletadas.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    return items.filter((news) => {
      const display = collectedNewsDisplayStatus(news)
      if (filter === 'all') return true
      if (filter === 'pending_ai') {
        return news.status === 'collected' && !news.processedByAi
      }
      if (filter === 'prepared') return display === 'prepared'
      if (filter === 'published') return news.status === 'published'
      if (filter === 'error') return news.status === 'error'
      return true
    })
  }, [items, filter])

  async function handleCollect() {
    if (viewOnly) return
    setCollecting(true)
    setError(null)
    setSuccess(null)
    setShowReviewCta(false)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada. Faça login novamente.')
      const token = await user.getIdToken()
      const result = await collectAllSources(token)

      const sourceErrors = result.sources
        .filter((s) => s.error)
        .map((s) => `${s.source_name}: ${s.error}`)

      setSuccess(
        `Coleta finalizada. Novos: ${result.totalCreated} · Duplicados: ${result.totalDuplicated} · Encontrados: ${result.totalFound}.`,
      )
      if (sourceErrors.length > 0) {
        setError(`Algumas fontes falharam: ${sourceErrors.join(' | ')}`)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na coleta.')
    } finally {
      setCollecting(false)
    }
  }

  async function handleProcessAi() {
    if (viewOnly) return
    setProcessingAi(true)
    setError(null)
    setSuccess(null)
    setShowReviewCta(false)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada. Faça login novamente.')
      const token = await user.getIdToken()
      const result = await processCollectedWithAi(token)
      if (result.processed === 0) {
        setSuccess('Nenhuma notícia pendente de preparação.')
      } else {
        setSuccess(
          `Preparadas: ${result.succeeded} ok · ${result.failed} falha(s).`,
        )
        if (result.succeeded > 0) setShowReviewCta(true)
      }
      const failures = result.items.filter((item) => !item.success && item.error)
      if (failures.length > 0) {
        setError(failures.map((item) => item.error).join(' | '))
      }
      await load()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha no processamento de IA.',
      )
    } finally {
      setProcessingAi(false)
    }
  }

  async function handleProcessOne(news: CollectedNews) {
    if (viewOnly) return
    setActingId(news.id)
    setError(null)
    setSuccess(null)
    setShowReviewCta(false)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada. Faça login novamente.')
      const token = await user.getIdToken()
      const result = await processOneCollectedWithAi(news.id, token)
      if (result.succeeded > 0) {
        setSuccess(`Preparada: ${news.title}`)
        setShowReviewCta(true)
      } else {
        const fail = result.items.find((item) => item.error)
        throw new Error(fail?.error ?? 'Falha ao preparar item.')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao preparar item.')
    } finally {
      setActingId(null)
    }
  }

  function categoryLabel(ids: string[]): string {
    if (ids.length === 0) return '—'
    return ids.map((id) => categoryNames[id] ?? id).join(', ')
  }

  const apiReady = isCollectApiConfigured() || isAiApiConfigured()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Notícias coletadas</Heading>
          <Text variant="muted" className="mt-1">
            Conteúdo capturado das fontes ativas ({items.length} no total).
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
          {!apiReady && <Badge variant="warning">API não configurada</Badge>}
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as NewsFilter)}
          >
            <option value="all">Todas</option>
            <option value="pending_ai">Pendentes de preparação</option>
            <option value="prepared">Preparadas</option>
            <option value="published">Publicadas</option>
            <option value="error">Com erro</option>
          </select>
          {!viewOnly && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleProcessAi()}
                loading={processingAi}
                disabled={!isAiApiConfigured()}
              >
                <Sparkles className="size-4" />
                Preparar para revisão
              </Button>
              <Button
                type="button"
                onClick={() => void handleCollect()}
                loading={collecting}
                disabled={!isCollectApiConfigured()}
              >
                <RefreshCw className="size-4" />
                Coletar agora
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">{success}</p>
            {showReviewCta && onNavigate && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onNavigate('review')}
              >
                Ir para revisão
              </Button>
            )}
          </div>
        </Alert>
      )}

      {!apiReady && !viewOnly && (
        <Alert variant="info">
          <p className="text-sm">
            Defina <code className="text-xs">VITE_API_URL</code> (ex.:{' '}
            <code className="text-xs">http://localhost:8000</code>) e suba o
            backend com uvicorn para coletar e preparar notícias. OpenAI é
            opcional (sem chave = modo passthrough).
          </p>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-4 py-12 text-center">
          <Text variant="muted">
            {items.length === 0
              ? `Nenhuma notícia coletada ainda.${!viewOnly ? ' Cadastre fontes ativas e use “Coletar agora”.' : ''}`
              : 'Nenhuma notícia neste filtro.'}
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-4">Título</div>
            <div className="col-span-2">Fonte</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Coletada em</div>
            <div className="col-span-2">Status</div>
          </div>

          {filtered.map((news) => {
            const display = collectedNewsDisplayStatus(news)
            const canPrepare =
              !viewOnly &&
              news.status === 'collected' &&
              !news.processedByAi &&
              isAiApiConfigured()

            return (
              <div
                key={news.id}
                className="grid gap-2 border-b border-border px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-3"
              >
                <div className="md:col-span-4">
                  <p className="text-sm font-semibold text-foreground">
                    {news.title}
                  </p>
                  <Text variant="small" className="mt-1 line-clamp-2">
                    {news.summary}
                  </Text>
                  {news.originalUrl && (
                    <a
                      href={news.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs text-navy-600 hover:underline"
                    >
                      Ver original
                    </a>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Text variant="small" className="md:hidden">
                    Fonte
                  </Text>
                  <p className="text-sm text-foreground">{news.sourceName}</p>
                </div>
                <div className="md:col-span-2">
                  <Badge variant="outline">
                    {categoryLabel(news.categoryIds)}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-foreground">
                    {formatCollectedDate(news.collectedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  <StatusBadge status={display} />
                  {canPrepare && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      loading={actingId === news.id}
                      onClick={() => void handleProcessOne(news)}
                    >
                      Preparar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
