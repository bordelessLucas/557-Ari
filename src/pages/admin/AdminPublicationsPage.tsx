import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
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
import { listCategories } from '@/services/categoryService'
import {
  formatPublicationDate,
  listPublications,
  type Publication,
} from '@/services/publicationService'

interface Props {
  viewOnly?: boolean
  onOpenPortal?: (path?: string) => void
}

export default function AdminPublicationsPage({
  viewOnly,
  onOpenPortal,
}: Props) {
  const [items, setItems] = useState<Publication[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  function categoryLabel(ids: string[]): string {
    if (!ids.length) return '—'
    return ids.map((id) => categoryNames[id] ?? id).join(', ')
  }

  function openInPortal(pub: Publication) {
    if (!pub.articleId || !onOpenPortal) return
    onOpenPortal(`/noticias/${pub.articleId}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Publicações</Heading>
          <Text variant="muted" className="mt-1">
            Matérias publicadas no portal ({items.length}).
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
            <Card key={pub.id}>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
