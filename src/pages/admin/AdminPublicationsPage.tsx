import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, PencilLine, Undo2 } from 'lucide-react'
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
} from '@/components/ui'
import type { AdminPageId } from '@/constants/adminNavigation'
import {
  consumeAdminFocusArticle,
  setAdminFocusArticle,
  setAdminReviewFilter,
} from '@/lib/adminFocus'
import { auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { isAiApiConfigured, unpublishArticle } from '@/services/aiApi'
import { listCategories } from '@/services/categoryService'
import {
  formatPublicationDate,
  listPublications,
  type Publication,
} from '@/services/publicationService'

interface Props {
  viewOnly?: boolean
  onOpenPortal?: (path?: string) => void
  onNavigate?: (page: AdminPageId) => void
}

export default function AdminPublicationsPage({
  viewOnly,
  onOpenPortal,
  onNavigate,
}: Props) {
  const [items, setItems] = useState<Publication[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [focusArticleId, setFocusArticleId] = useState<string | null>(() =>
    consumeAdminFocusArticle(),
  )
  const focusedRef = useRef<HTMLDivElement | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pubs, categories] = await Promise.all([
        listPublications(80),
        listCategories().catch(() => []),
      ])
      setItems(pubs)
      const map: Record<string, string> = {}
      categories.forEach((cat) => {
        map[cat.id] = cat.name
      })
      setCategoryNames(map)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as publicações.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!focusArticleId || loading) return
    const node = focusedRef.current
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timeout = window.setTimeout(() => setFocusArticleId(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [focusArticleId, loading, items])

  function categoryLabel(ids: string[]): string {
    if (!ids.length) return '—'
    return ids.map((id) => categoryNames[id] ?? id).join(', ')
  }

  function openInPortal(pub: Publication) {
    if (!pub.articleId || !onOpenPortal) return
    onOpenPortal(`/noticias/${pub.articleId}`)
  }

  function editInReview(pub: Publication) {
    if (!pub.articleId || !onNavigate) return
    setAdminFocusArticle(pub.articleId)
    setAdminReviewFilter('published')
    onNavigate('review')
  }

  async function handleUnpublish(pub: Publication) {
    if (viewOnly || !pub.articleId) return
    setActingId(pub.id)
    setError(null)
    setSuccess(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada.')
      const token = await user.getIdToken()
      await unpublishArticle(pub.articleId, token)
      setSuccess(`Publicação revogada: ${pub.title}`)
      if (onNavigate) {
        setAdminFocusArticle(pub.articleId)
        setAdminReviewFilter('review')
        onNavigate('review')
        return
      }
      await load()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao revogar publicação.',
      )
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Publicações</Heading>
          <Text variant="muted" className="mt-1">
            Matérias publicadas no portal ({items.length}). Clique para abrir,
            editar na revisão ou revogar.
          </Text>
        </div>
        <div className="flex gap-2">
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
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

      {!isAiApiConfigured() && !viewOnly && (
        <Alert variant="info">
          <p className="text-sm">
            Para revogar publicações, defina <code className="text-xs">VITE_API_URL</code>{' '}
            e rode o backend local.
          </p>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Text variant="muted">
              Nenhuma publicação ainda. Aprove e publique matérias na revisão.
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((pub) => (
            <div
              key={pub.id}
              ref={
                pub.articleId === focusArticleId ? focusedRef : undefined
              }
              className={cn(
                pub.articleId === focusArticleId &&
                  'rounded-xl ring-2 ring-navy-500 ring-offset-2',
              )}
            >
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{pub.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {categoryLabel(pub.categoryIds)} ·{' '}
                      {formatPublicationDate(pub.publishedAt)}
                      {pub.sourceName ? ` · ${pub.sourceName}` : ''}
                    </CardDescription>
                  </div>
                  <StatusBadge status={pub.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Text variant="small">{pub.summary}</Text>
                  <div className="flex flex-wrap gap-2">
                    {pub.articleId && onOpenPortal && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openInPortal(pub)}
                      >
                        <ExternalLink className="size-3.5" />
                        Abrir no portal
                      </Button>
                    )}
                    {pub.articleId && onNavigate && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => editInReview(pub)}
                      >
                        <PencilLine className="size-3.5" />
                        Editar na revisão
                      </Button>
                    )}
                    {!viewOnly && pub.articleId && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        loading={actingId === pub.id}
                        disabled={!isAiApiConfigured()}
                        onClick={() => void handleUnpublish(pub)}
                      >
                        <Undo2 className="size-3.5" />
                        Revogar publicação
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
