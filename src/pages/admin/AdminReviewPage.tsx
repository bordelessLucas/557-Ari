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
  Text,
} from '@/components/ui'
import { formatDemoDate, mockReviews } from '@/data/adminMock'

interface Props {
  viewOnly?: boolean
}

export default function AdminReviewPage({ viewOnly }: Props) {
  const pending = mockReviews.filter((item) => item.status === 'review')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Aguardando revisão</Heading>
          <Text variant="muted" className="mt-1">
            Compare o original com a versão adaptada pela IA antes de publicar.
          </Text>
        </div>
        <div className="flex gap-2">
          <Badge variant="muted">Demo / mock</Badge>
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
        </div>
      </div>

      {viewOnly && (
        <Alert variant="info">
          Seu perfil é de visualização. Aprovar ou rejeitar exige permissão de
          edição total.
        </Alert>
      )}

      <Text variant="muted">{pending.length} matéria(s) na fila de revisão.</Text>

      <div className="space-y-4">
        {mockReviews.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  {item.adaptedTitle}
                </CardTitle>
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
                  <p className="text-sm font-medium">{item.category}</p>
                </div>
                <div>
                  <Text variant="small">Gerado em</Text>
                  <p className="text-sm font-medium">
                    {formatDemoDate(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <Text variant="small">Resumo da IA</Text>
                <p className="mt-1 text-sm text-foreground">{item.aiSummary}</p>
              </div>

              {item.status === 'review' && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" disabled={viewOnly}>
                    Aprovar
                  </Button>
                  <Button variant="destructive" disabled={viewOnly}>
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
