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
import { formatDemoDate, mockPublications } from '@/data/adminMock'

interface Props {
  viewOnly?: boolean
}

export default function AdminPublicationsPage({ viewOnly }: Props) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Publicações</Heading>
          <Text variant="muted" className="mt-1">
            Matérias enviadas ao portal após aprovação editorial.
          </Text>
        </div>
        <div className="flex gap-2">
          <Badge variant="muted">Demo / mock</Badge>
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
        </div>
      </div>

      <div className="grid gap-4">
        {mockPublications.map((pub) => (
          <Card key={pub.id}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{pub.title}</CardTitle>
                <CardDescription className="mt-1">
                  {pub.category} · {formatDemoDate(pub.publishedAt)}
                </CardDescription>
              </div>
              <StatusBadge status={pub.status} />
            </CardHeader>
            <CardContent>
              {pub.portalUrl ? (
                <Text variant="small">Publicada no portal (link demonstrativo).</Text>
              ) : (
                <Text variant="small">
                  Falha no envio — será reprocessada na Sprint de publicação.
                </Text>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
