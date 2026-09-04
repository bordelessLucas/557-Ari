import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Power, RefreshCw, Trash2 } from 'lucide-react'
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
  Input,
  Label,
  Spinner,
  Text,
} from '@/components/ui'
import { auth } from '@/lib/firebase'
import { ensureDefaultCategories, listCategories } from '@/services/categoryService'
import {
  collectOneSource,
  isCollectApiConfigured,
} from '@/services/collectApi'
import {
  createSource,
  deleteSource,
  emptySourceForm,
  formatSourceDate,
  listSources,
  setSourceStatus,
  sourceKindLabel,
  sourceToForm,
  updateSource,
} from '@/services/sourceService'
import type { Category } from '@/types/category'
import type { NewsSource, SourceFormData, SourceKind, SourceStatus } from '@/types/source'

interface Props {
  viewOnly?: boolean
}

type StatusFilter = 'all' | SourceStatus

export default function AdminSourcesPage({ viewOnly }: Props) {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [collectingId, setCollectingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SourceFormData>(emptySourceForm())

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      let cats: Category[] = []
      try {
        cats = await ensureDefaultCategories()
      } catch {
        cats = await listCategories().catch(() => [])
      }
      const list = await listSources()
      setCategories(cats.filter((item) => item.active))
      setSources(list)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as fontes.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach((item) => map.set(item.id, item.name))
    return map
  }, [categories])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sources.filter((source) => {
      if (filter !== 'all' && source.status !== filter) return false
      if (!term) return true
      return (
        source.name.toLowerCase().includes(term) ||
        source.siteUrl.toLowerCase().includes(term)
      )
    })
  }, [sources, filter, search])

  const activeCount = sources.filter((s) => s.status === 'active').length

  function openCreate() {
    setEditingId(null)
    setForm(emptySourceForm())
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  function openEdit(source: NewsSource) {
    setEditingId(source.id)
    setForm(sourceToForm(source))
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptySourceForm())
  }

  function toggleCategory(categoryId: string) {
    setForm((current) => {
      const exists = current.categoryIds.includes(categoryId)
      return {
        ...current,
        categoryIds: exists
          ? current.categoryIds.filter((id) => id !== categoryId)
          : [...current.categoryIds, categoryId],
      }
    })
  }

  function validateForm(data: SourceFormData): string | null {
    if (!data.name.trim()) return 'Informe o nome da fonte.'
    if (!data.siteUrl.trim()) return 'Informe a URL do site/portal.'
    if (data.kind === 'rss' && !data.rssUrl.trim()) {
      return 'Fontes RSS precisam do endereço do feed.'
    }
    if (data.kind === 'api' && !data.apiUrl.trim()) {
      return 'Fontes de API precisam do endpoint.'
    }
    if (data.categoryIds.length === 0) {
      return 'Selecione ao menos uma categoria.'
    }
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (viewOnly) return

    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (editingId) {
        await updateSource(editingId, form)
        setSuccess('Fonte atualizada com sucesso.')
      } else {
        const uid = auth.currentUser?.uid
        if (!uid) throw new Error('Sessão expirada. Faça login novamente.')
        await createSource(form, uid)
        setSuccess('Fonte cadastrada com sucesso.')
      }
      closeForm()
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao salvar a fonte.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(source: NewsSource) {
    if (viewOnly) return
    const next: SourceStatus =
      source.status === 'active' ? 'inactive' : 'active'
    setError(null)
    try {
      await setSourceStatus(source.id, next)
      setSources((current) =>
        current.map((item) =>
          item.id === source.id ? { ...item, status: next } : item,
        ),
      )
      setSuccess(
        next === 'active'
          ? `"${source.name}" ativada.`
          : `"${source.name}" desativada.`,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar o status.',
      )
    }
  }

  async function handleDelete(source: NewsSource) {
    if (viewOnly) return
    const confirmed = window.confirm(
      `Excluir a fonte "${source.name}"? Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setError(null)
    try {
      await deleteSource(source.id)
      setSources((current) => current.filter((item) => item.id !== source.id))
      if (editingId === source.id) closeForm()
      setSuccess(`Fonte "${source.name}" excluída.`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível excluir.',
      )
    }
  }

  async function handleCollectSource(source: NewsSource) {
    if (viewOnly || source.status !== 'active') return
    setCollectingId(source.id)
    setError(null)
    setSuccess(null)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Sessão expirada. Faça login novamente.')
      const token = await user.getIdToken()
      const result = await collectOneSource(source.id, token)
      const sourceResult = result.sources[0]
      if (sourceResult?.error) {
        setError(`${source.name}: ${sourceResult.error}`)
      }
      setSuccess(
        `Coleta de "${source.name}": ${result.totalCreated} novas, ${result.totalDuplicated} duplicadas.`,
      )
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na coleta.')
    } finally {
      setCollectingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Fontes de conteúdo</Heading>
          <Text variant="muted" className="mt-1">
            Cadastro e monitoramento das fontes. {activeCount} ativas de{' '}
            {sources.length} no total.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
          {!viewOnly && (
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              Nova fonte
            </Button>
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

      {formOpen && !viewOnly && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar fonte' : 'Cadastrar fonte'}
            </CardTitle>
            <CardDescription>
              Suporta RSS, site público ou API — a coleta usará o tipo adequado
              na Sprint 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nome da fonte"
                  value={form.name}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, name: e.target.value }))
                  }
                  placeholder="Ex.: Portal Regional"
                  required
                />
                <Input
                  label="URL do site/portal"
                  type="url"
                  value={form.siteUrl}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, siteUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="source-kind">Tipo de fonte</Label>
                  <select
                    id="source-kind"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.kind}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        kind: e.target.value as SourceKind,
                      }))
                    }
                  >
                    <option value="website">Site público</option>
                    <option value="rss">RSS / Feed</option>
                    <option value="api">API</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source-status">Status</Label>
                  <select
                    id="source-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        status: e.target.value as SourceStatus,
                      }))
                    }
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>
              </div>

              {form.kind !== 'api' && (
                <Input
                  label="URL do feed RSS (opcional)"
                  type="url"
                  value={form.rssUrl}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, rssUrl: e.target.value }))
                  }
                  placeholder="https://.../feed"
                  hint={
                    form.kind === 'rss'
                      ? 'Obrigatório para fontes do tipo RSS.'
                      : 'Preencha se o portal oferecer feed.'
                  }
                />
              )}

              {form.kind === 'api' && (
                <Input
                  label="Endpoint da API"
                  type="url"
                  value={form.apiUrl}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, apiUrl: e.target.value }))
                  }
                  placeholder="https://api.exemplo.com/noticias"
                  required
                />
              )}

              <div className="space-y-2">
                <Label>Categorias</Label>
                <div className="flex flex-wrap gap-2 rounded-md border border-border bg-muted/30 p-3">
                  {categories.map((category) => {
                    const selected = form.categoryIds.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={
                          selected
                            ? 'rounded-md bg-navy-700 px-2.5 py-1 text-xs font-medium text-white'
                            : 'rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted'
                        }
                      >
                        {category.name}
                      </button>
                    )
                  })}
                </div>
                <Text variant="small">
                  Categorias iniciais baseadas no portal atual; podem ser
                  ajustadas depois.
                </Text>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={saving}>
                  {editingId ? 'Salvar alterações' : 'Cadastrar fonte'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Input
            label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <select
            id="status-filter"
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Text variant="muted">
              Nenhuma fonte encontrada. {!viewOnly && 'Cadastre a primeira fonte para começar o monitoramento.'}
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((source) => (
            <Card key={source.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{source.name}</CardTitle>
                    <Badge variant="outline">
                      {sourceKindLabel[source.kind]}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1 break-all">
                    {source.siteUrl}
                    {source.rssUrl ? ' · RSS configurado' : ''}
                    {source.apiUrl ? ' · API configurada' : ''}
                  </CardDescription>
                </div>
                <StatusBadge status={source.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Text variant="small">Categorias</Text>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {source.categoryIds.length === 0
                        ? '—'
                        : source.categoryIds
                            .map((id) => categoryNameById.get(id) ?? id)
                            .join(', ')}
                    </p>
                  </div>
                  <div>
                    <Text variant="small">Notícias capturadas</Text>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {source.newsCount}
                    </p>
                  </div>
                  <div>
                    <Text variant="small">Última verificação</Text>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatSourceDate(source.lastCheckedAt)}
                    </p>
                  </div>
                </div>

                {!viewOnly && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(source)}
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleToggleStatus(source)}
                    >
                      <Power className="size-3.5" />
                      {source.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                    {source.status === 'active' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={collectingId === source.id}
                        disabled={!isCollectApiConfigured()}
                        onClick={() => void handleCollectSource(source)}
                      >
                        <RefreshCw className="size-3.5" />
                        Coletar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDelete(source)}
                    >
                      <Trash2 className="size-3.5" />
                      Excluir
                    </Button>
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
