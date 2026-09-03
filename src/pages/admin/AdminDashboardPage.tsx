import {
  CheckCircle2,
  Clock3,
  FileSearch,
  Newspaper,
  Radio,
  XCircle,
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@/components/ui'
import type { AdminPageId } from '@/constants/adminNavigation'
import {
  formatDemoDate,
  getDashboardMetrics,
  mockActivities,
} from '@/data/adminMock'

interface AdminDashboardPageProps {
  onNavigate: (page: AdminPageId) => void
}

export default function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const metrics = getDashboardMetrics()

  const metricCards = [
    {
      id: 'sources' as const,
      label: 'Fontes ativas',
      value: metrics.activeSources,
      icon: Radio,
      page: 'sources' as AdminPageId,
    },
    {
      id: 'collected' as const,
      label: 'Notícias coletadas',
      value: metrics.collected,
      icon: Newspaper,
      page: 'news' as AdminPageId,
    },
    {
      id: 'review' as const,
      label: 'Aguardando revisão',
      value: metrics.awaitingReview,
      icon: FileSearch,
      page: 'review' as AdminPageId,
    },
    {
      id: 'approved' as const,
      label: 'Aprovadas',
      value: metrics.approved,
      icon: CheckCircle2,
      page: 'review' as AdminPageId,
    },
    {
      id: 'rejected' as const,
      label: 'Rejeitadas',
      value: metrics.rejected,
      icon: XCircle,
      page: 'review' as AdminPageId,
    },
    {
      id: 'published' as const,
      label: 'Publicadas',
      value: metrics.published,
      icon: Clock3,
      page: 'publications' as AdminPageId,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Painel administrativo</Heading>
          <Text variant="muted" className="mt-1 max-w-2xl">
            Visão geral da operação editorial. Dados de demonstração para
            apresentação ao cliente.
          </Text>
        </div>
        <Badge variant="muted">Demo / mock</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map(({ id, label, value, icon: Icon, page }) => (
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
                <Text variant="small">Clique para abrir o módulo</Text>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades recentes</CardTitle>
          <CardDescription>
            Últimas ações do fluxo coleta → revisão → publicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockActivities.map((activity) => (
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
                <StatusBadge status={activity.type === 'review' ? 'review' : 'collected'} />
                <Text variant="small">{formatDemoDate(activity.at)}</Text>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
