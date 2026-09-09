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
  formatActivityDate,
  getAdminDashboardMetrics,
  getAdminRecentActivities,
  type AdminDashboardActivity,
  type AdminDashboardMetrics,
} from '@/services/dashboardService'

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
        },
        {
          id: 'collected',
          label: 'Notícias coletadas',
          value: metrics.collected,
          hint: 'Últimos itens capturados',
          icon: Newspaper,
          page: 'news' as AdminPageId,
        },
        {
          id: 'pendingAi',
          label: 'Pendentes de preparação',
          value: metrics.pendingAi,
          hint: 'Aguardando preparar para revisão',
          icon: Sparkles,
          page: 'news' as AdminPageId,
        },
        {
          id: 'review',
          label: 'Aguardando revisão',
          value: metrics.awaitingReview,
          hint: 'Fila editorial',
          icon: FileSearch,
          page: 'review' as AdminPageId,
        },
        {
          id: 'rejected',
          label: 'Rejeitadas',
          value: metrics.rejected,
          hint: 'Podem ser reaprovadas',
          icon: XCircle,
          page: 'review' as AdminPageId,
        },
        {
          id: 'published',
          label: 'Publicadas',
          value: metrics.published,
          hint: 'No portal do leitor',
          icon: CheckCircle2,
          page: 'publications' as AdminPageId,
        },
      ]
    : []

  function activityBadge(type: AdminDashboardActivity['type']): string {
    if (type === 'publish') return 'published'
    if (type === 'reject') return 'rejected'
    return 'review'
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Heading level={2}>Painel administrativo</Heading>
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
            {metricCards.map(({ id, label, value, hint, icon: Icon, page }) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(page)}
                className="text-left"
              >
                <Card className="h-full border-border/80 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                    <div>
                      <CardDescription>{label}</CardDescription>
                      <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
                        {value}
                      </CardTitle>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Text variant="small">{hint}</Text>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividades recentes</CardTitle>
              <CardDescription>
                Publicações, envios à revisão e rejeições recentes.
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
                  <div
                    key={activity.id}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {activity.action}
                      </p>
                      <Text variant="small">{activity.detail}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={activityBadge(activity.type)} />
                      <Text variant="small">
                        {formatActivityDate(activity.at)}
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
