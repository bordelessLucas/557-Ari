import { StatusBadge } from '@/components/admin/StatusBadge'
import { Badge, Heading, Text } from '@/components/ui'
import { formatDemoDate, mockCollectedNews } from '@/data/adminMock'

interface Props {
  viewOnly?: boolean
}

export default function AdminNewsPage({ viewOnly }: Props) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Notícias coletadas</Heading>
          <Text variant="muted" className="mt-1">
            Conteúdo capturado das fontes, com status do fluxo editorial.
          </Text>
        </div>
        <div className="flex gap-2">
          <Badge variant="muted">Demo / mock</Badge>
          {viewOnly && <Badge variant="warning">Somente leitura</Badge>}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-5">Título</div>
          <div className="col-span-2">Fonte</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Coletada em</div>
          <div className="col-span-1">Status</div>
        </div>

        {mockCollectedNews.map((news) => (
          <div
            key={news.id}
            className="grid gap-2 border-b border-border px-4 py-4 last:border-0 md:grid-cols-12 md:items-center md:gap-3"
          >
            <div className="md:col-span-5">
              <p className="text-sm font-semibold text-foreground">{news.title}</p>
              <Text variant="small" className="mt-1 line-clamp-2">
                {news.summary}
              </Text>
            </div>
            <div className="md:col-span-2">
              <Text variant="small" className="md:hidden">
                Fonte
              </Text>
              <p className="text-sm text-foreground">{news.sourceName}</p>
            </div>
            <div className="md:col-span-2">
              <Badge variant="outline">{news.category}</Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-foreground">
                {formatDemoDate(news.collectedAt)}
              </p>
            </div>
            <div className="md:col-span-1">
              <StatusBadge status={news.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
