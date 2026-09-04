import { useCallback, useEffect, useState } from 'react'
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
import { isAiApiConfigured, processCollectedWithAi } from '@/services/aiApi'
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

interface Props {
  viewOnly?: boolean
}

export default function AdminNewsPage({ viewOnly }: Props) {
  const [items, setItems] = useState<CollectedNews[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [processingAi, setProcessingAi] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  async function handleCollect() {
    if (viewOnly) return
    setCollecting(true)
    setError(null)
    setSuccess(null)

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
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada. Faça login novamente.')
      const token = await user.getIdToken()
      const result = await processCollectedWithAi(token)
      if (result.processed === 0) {
        setSuccess('Nenhuma notícia pendente de processamento por IA.')
      } else {
        setSuccess(
          `IA: ${result.succeeded} ok · ${result.failed} falha(s) · ${result.processed} processada(s). Veja em Aguardando revisão.`,
        )
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
                Processar com IA
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
          <p className="text-sm">{success}</p>
        </Alert>
      )}

      {!apiReady && !viewOnly && (
        <Alert variant="info">
          <p className="text-sm">
            Defina <code className="text-xs">VITE_API_URL</code>, suba o backend
            e configure <code className="text-xs">OPENAI_API_KEY</code> para
            coleta e IA.
          </p>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-4 py-12 text-center">
          <Text variant="muted">
            Nenhuma notícia coletada ainda.
            {!viewOnly &&
              ' Cadastre fontes ativas e use “Coletar agora”.'}
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-5">Título</div>
            <div className="col-span-2">Fonte</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Coletada em</div>
            <div className="col-span-1">Status</div>
          </div>

          {items.map((news) => (
            <div
              key={news.id}
              className="grid gap-2 border-b border-border px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-3"
            >
              <div className="md:col-span-5">
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
              <div className="md:col-span-1">
                <StatusBadge status={news.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
