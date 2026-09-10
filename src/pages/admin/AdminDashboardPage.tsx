import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  FileSearch,
  Newspaper,
  Radio,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Alert,
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
  setAdminFocusArticle,
  setAdminReviewFilter,
} from '@/lib/adminFocus'
import {
  formatActivityDate,
  getAdminDashboardMetrics,
  getAdminRecentActivities,
  type AdminDashboardActivity,
  type AdminDashboardMetrics,
} from '@/services/dashboardService'
import { cn } from '@/lib/utils'

interface AdminDashboardPageProps {
  onNavigate: (page: AdminPageId) => void
}

export default function AdminDashboardPage({
  onNavigate,
}: AdminDashboardPageProps) {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [activities, setActivities] = useState<AdminDashboardActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [m, a] = await Promise.all([
        getAdminDashboardMetrics(),
        getAdminRecentActivities(),
      ])
      setMetrics(m)
      setActivities(a)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const metricCards = metrics
    ? [
        {
          id: 'sources',
          label: 'Fontes ativas',
          value: metrics.activeSources,
          hint: `${metrics.totalSources} no total`,
          icon: Radio,
          page: 'sources' as AdminPageId,
          tone: {
            card: 'border-navy-200/80 bg-gradient-to-br from-navy-50/90 to-background hover:border-navy-300',
            icon: 'bg-navy-100 text-navy-700',
            value: 'text-navy-900',
          },
        },
        {
          id: 'collected',
          label: 'Notícias coletadas',
          value: metrics.collected,
          hint: 'Últimos itens capturados',
          icon: Newspaper,
          page: 'news' as AdminPageId,
          tone: {
            card: 'border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-background hover:border-sky-300',
            icon: 'bg-sky-100 text-sky-700',
            value: 'text-sky-950',
          },
        },
        {
          id: 'pendingAi',
          label: 'Pendentes de preparação',
          value: metrics.pendingAi,
          hint: 'Aguardando preparar para revisão',
          icon: Sparkles,
          page: 'news' as AdminPageId,
          tone: {
            card: 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-background hover:border-amber-300',
            icon: 'bg-amber-100 text-amber-800',
            value: 'text-amber-950',
          },
        },
        {
          id: 'review',
          label: 'Aguardando revisão',
          value: metrics.awaitingReview,
          hint: 'Fila editorial',
          icon: FileSearch,
          page: 'review' as AdminPageId,
          reviewFilter: 'review' as const,
          tone: {
            card: 'border-orange-200/80 bg-gradient-to-br from-orange-50/90 to-background hover:border-orange-300',
            icon: 'bg-orange-100 text-orange-700',
            value: 'text-orange-950',
          },
        },
        {
          id: 'rejected',
          label: 'Rejeitadas',
          value: metrics.rejected,
          hint: 'Podem ser reaprovadas',
          icon: XCircle,
          page: 'review' as AdminPageId,
          reviewFilter: 'rejected' as const,
          tone: {
            card: 'border-red-200/80 bg-gradient-to-br from-red-50/90 to-background hover:border-red-300',
            icon: 'bg-red-100 text-red-700',
            value: 'text-red-900',
          },
        },
        {
          id: 'published',
          label: 'Publicadas',
          value: metrics.published,
          hint: 'No portal do leitor',
          icon: CheckCircle2,
          page: 'publications' as AdminPageId,
          tone: {
            card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-background hover:border-emerald-300',
            icon: 'bg-emerald-100 text-emerald-700',
            value: 'text-emerald-950',
          },
        },
      ]
    : []

  function activityBadge(type: AdminDashboardActivity['type']): string {
    if (type === 'publish') return 'published'
    if (type === 'reject') return 'rejected'
    return 'review'
  }

  function openActivity(activity: AdminDashboardActivity) {
    if (activity.articleId) setAdminFocusArticle(activity.articleId)
    if (activity.reviewFilter) setAdminReviewFilter(activity.reviewFilter)
    onNavigate(activity.targetPage)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Heading level={2}>Painel administrativo</Heading>
          <span
            className="text-base font-semibold tracking-tight text-red-700 sm:text-lg"
            aria-label="Jornal"
          >
            Agência da Notícia
          </span>
        </div>
        <Text variant="muted" className="mt-1 max-w-2xl">
          Visão geral da operação editorial com dados reais do Firestore.
        </Text>
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
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricCards.map(
              ({
                id,
                label,
                value,
                hint,
                icon: Icon,
                page,
                reviewFilter,
                tone,
              }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (reviewFilter) setAdminReviewFilter(reviewFilter)
                    onNavigate(page)
                  }}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      'h-full shadow-[var(--shadow-card)] transition-[box-shadow,border-color] hover:shadow-[var(--shadow-elevated)]',
                      tone.card,
                    )}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                      <div>
                        <CardDescription>{label}</CardDescription>
                        <CardTitle
                          className={cn(
                            'mt-2 text-3xl font-semibold tracking-tight',
                            tone.value,
                          )}
                        >
                          {value}
                        </CardTitle>
                      </div>
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-lg',
                          tone.icon,
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Text variant="small">{hint}</Text>
                    </CardContent>
                  </Card>
                </button>
              ),
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividades recentes</CardTitle>
              <CardDescription>
                Clique em um item para abrir a revisão ou a publicação
                correspondente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                  <Text variant="muted">
                    Nenhuma atividade recente ainda. Colete e prepare notícias
                    para começar o fluxo.
                  </Text>
                </div>
              ) : (
                activities.map((activity) => (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => openActivity(activity)}
                    className={cn(
                      'flex w-full flex-col gap-2 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors',
                      'hover:border-navy-300 hover:bg-navy-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'sm:flex-row sm:items-center sm:justify-between sm:gap-4',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {activity.action}
                      </p>
                      <Text variant="small" className="line-clamp-2">
                        {activity.detail}
                      </Text>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                      <StatusBadge
                        status={activityBadge(activity.type)}
                        className="h-6 w-[6.75rem] shrink-0 justify-center px-0"
                      />
                      <Text
                        variant="small"
                        className="w-[9.25rem] shrink-0 text-right tabular-nums"
                      >
                        {formatActivityDate(activity.at)}
                      </Text>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
