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
import { formatDemoDate, mockSources } from '@/data/adminMock'

interface Props {
  viewOnly?: boolean
}

export default function AdminSourcesPage({ viewOnly }: Props) {
  const active = mockSources.filter((s) => s.status === 'active').length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Fontes ativas</Heading>
          <Text variant="muted" className="mt-1">
            Fontes monitoradas pelo sistema. {active} ativas no momento.
          </Text>
        </div>
        <div className="flex gap-2">
          <Badge variant="muted">Demo / mock</Badge>
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
        </div>
      </div>

      <div className="grid gap-4">
        {mockSources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{source.name}</CardTitle>
                <CardDescription className="mt-1">
                  {source.siteUrl}
                  {source.rssUrl ? ` · RSS disponível` : ' · Sem RSS'}
                </CardDescription>
              </div>
              <StatusBadge status={source.status} />
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div>
                <Text variant="small">Categoria</Text>
                <p className="text-sm font-medium text-foreground">{source.category}</p>
              </div>
              <div>
                <Text variant="small">Notícias capturadas</Text>
                <p className="text-sm font-medium text-foreground">{source.newsCount}</p>
              </div>
              <div>
                <Text variant="small">Última verificação</Text>
                <p className="text-sm font-medium text-foreground">
                  {formatDemoDate(source.lastCheckedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
