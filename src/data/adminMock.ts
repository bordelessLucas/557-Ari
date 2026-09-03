export type ContentStatus =
  | 'collected'
  | 'processing'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'error'

export interface MockSource {
  id: string
  name: string
  siteUrl: string
  rssUrl?: string
  category: string
  status: 'active' | 'inactive'
  lastCheckedAt: string
  newsCount: number
}

export interface MockCollectedNews {
  id: string
  title: string
  summary: string
  sourceName: string
  category: string
  status: ContentStatus
  publishedAt: string
  collectedAt: string
  imageUrl?: string
  originalUrl: string
}

export interface MockReviewItem {
  id: string
  originalTitle: string
  adaptedTitle: string
  sourceName: string
  category: string
  status: 'review' | 'approved' | 'rejected'
  createdAt: string
  aiSummary: string
}

export interface MockPublication {
  id: string
  title: string
  category: string
  publishedAt: string
  status: 'published' | 'failed'
  portalUrl?: string
}

export interface MockActivity {
  id: string
  action: string
  detail: string
  at: string
  type: 'collect' | 'review' | 'publish' | 'admin'
}

export interface MockAdminUser {
  id: string
  name: string
  email: string
  adminPermission: 'full' | 'view'
  isPrincipal: boolean
  createdAt: string
}

export const mockSources: MockSource[] = [
  {
    id: 'src-1',
    name: 'Portal Política MT',
    siteUrl: 'https://exemplo-politica.com.br',
    rssUrl: 'https://exemplo-politica.com.br/feed',
    category: 'Política',
    status: 'active',
    lastCheckedAt: '2026-09-03T12:40:00',
    newsCount: 128,
  },
  {
    id: 'src-2',
    name: 'Agro News Brasil',
    siteUrl: 'https://exemplo-agro.com.br',
    rssUrl: 'https://exemplo-agro.com.br/rss',
    category: 'Agronegócio',
    status: 'active',
    lastCheckedAt: '2026-09-03T12:35:00',
    newsCount: 86,
  },
  {
    id: 'src-3',
    name: 'Esporte Centro-Oeste',
    siteUrl: 'https://exemplo-esporte.com.br',
    category: 'Esporte',
    status: 'active',
    lastCheckedAt: '2026-09-03T11:50:00',
    newsCount: 54,
  },
  {
    id: 'src-4',
    name: 'Economia Diária',
    siteUrl: 'https://exemplo-economia.com.br',
    rssUrl: 'https://exemplo-economia.com.br/feed',
    category: 'Economia',
    status: 'inactive',
    lastCheckedAt: '2026-09-01T09:00:00',
    newsCount: 41,
  },
]

export const mockCollectedNews: MockCollectedNews[] = [
  {
    id: 'news-1',
    title: 'Assembleia discute pacote de obras para o interior',
    summary: 'Projeto prevê investimentos em infraestrutura e mobilidade.',
    sourceName: 'Portal Política MT',
    category: 'Política',
    status: 'review',
    publishedAt: '2026-09-03T10:20:00',
    collectedAt: '2026-09-03T10:25:00',
    originalUrl: 'https://exemplo-politica.com.br/obras-interior',
  },
  {
    id: 'news-2',
    title: 'Safra de soja deve bater recorde na região',
    summary: 'Estimativa aponta crescimento de produtividade no ciclo atual.',
    sourceName: 'Agro News Brasil',
    category: 'Agronegócio',
    status: 'collected',
    publishedAt: '2026-09-03T09:10:00',
    collectedAt: '2026-09-03T09:18:00',
    originalUrl: 'https://exemplo-agro.com.br/safra-soja',
  },
  {
    id: 'news-3',
    title: 'Clássico estadual termina empatado em 1 a 1',
    summary: 'Partida movimentada manteve a briga pela liderança aberta.',
    sourceName: 'Esporte Centro-Oeste',
    category: 'Esporte',
    status: 'approved',
    publishedAt: '2026-09-02T21:40:00',
    collectedAt: '2026-09-02T21:50:00',
    originalUrl: 'https://exemplo-esporte.com.br/classico',
  },
  {
    id: 'news-4',
    title: 'Inflação de alimentos desacelera em agosto',
    summary: 'Índice veio abaixo das expectativas do mercado.',
    sourceName: 'Economia Diária',
    category: 'Economia',
    status: 'published',
    publishedAt: '2026-09-02T08:00:00',
    collectedAt: '2026-09-02T08:12:00',
    originalUrl: 'https://exemplo-economia.com.br/inflacao',
  },
  {
    id: 'news-5',
    title: 'Operação prende suspeitos de fraude em licitações',
    summary: 'Investigação aponta irregularidades em contratos públicos.',
    sourceName: 'Portal Política MT',
    category: 'Polícia',
    status: 'processing',
    publishedAt: '2026-09-03T11:05:00',
    collectedAt: '2026-09-03T11:10:00',
    originalUrl: 'https://exemplo-politica.com.br/operacao',
  },
  {
    id: 'news-6',
    title: 'Prefeitura anuncia mutirão de saúde neste fim de semana',
    summary: 'Atendimentos gratuitos em especialidades básicas.',
    sourceName: 'Portal Política MT',
    category: 'Saúde',
    status: 'rejected',
    publishedAt: '2026-09-01T15:30:00',
    collectedAt: '2026-09-01T15:40:00',
    originalUrl: 'https://exemplo-politica.com.br/mutirao',
  },
]

export const mockReviews: MockReviewItem[] = [
  {
    id: 'rev-1',
    originalTitle: 'Assembleia discute pacote de obras para o interior',
    adaptedTitle: 'Assembleia analisa pacote de obras voltado ao interior',
    sourceName: 'Portal Política MT',
    category: 'Política',
    status: 'review',
    createdAt: '2026-09-03T10:40:00',
    aiSummary:
      'Matéria reescrita com foco local, mantendo valores e declarações originais.',
  },
  {
    id: 'rev-2',
    originalTitle: 'Clássico estadual termina empatado em 1 a 1',
    adaptedTitle: 'Clássico estadual fica empatado e mantém briga pelo topo',
    sourceName: 'Esporte Centro-Oeste',
    category: 'Esporte',
    status: 'approved',
    createdAt: '2026-09-02T22:10:00',
    aiSummary: 'Texto adaptado ao tom editorial do portal, com título mais direto.',
  },
  {
    id: 'rev-3',
    originalTitle: 'Prefeitura anuncia mutirão de saúde neste fim de semana',
    adaptedTitle: 'Mutirão de saúde gratuito acontece neste fim de semana',
    sourceName: 'Portal Política MT',
    category: 'Saúde',
    status: 'rejected',
    createdAt: '2026-09-01T16:00:00',
    aiSummary: 'Rejeitado por falta de confirmação de horários e locais.',
  },
]

export const mockPublications: MockPublication[] = [
  {
    id: 'pub-1',
    title: 'Inflação de alimentos desacelera em agosto',
    category: 'Economia',
    publishedAt: '2026-09-02T09:00:00',
    status: 'published',
    portalUrl: '#',
  },
  {
    id: 'pub-2',
    title: 'Clássico estadual fica empatado e mantém briga pelo topo',
    category: 'Esporte',
    publishedAt: '2026-09-03T07:30:00',
    status: 'published',
    portalUrl: '#',
  },
  {
    id: 'pub-3',
    title: 'Tentativa de envio — falha na API do portal',
    category: 'Geral',
    publishedAt: '2026-09-01T18:00:00',
    status: 'failed',
  },
]

export const mockActivities: MockActivity[] = [
  {
    id: 'act-1',
    action: 'Coleta finalizada',
    detail: 'Portal Política MT — 4 novas matérias',
    at: '2026-09-03T12:40:00',
    type: 'collect',
  },
  {
    id: 'act-2',
    action: 'Enviado para revisão',
    detail: 'Assembleia analisa pacote de obras voltado ao interior',
    at: '2026-09-03T10:40:00',
    type: 'review',
  },
  {
    id: 'act-3',
    action: 'Publicação concluída',
    detail: 'Clássico estadual fica empatado e mantém briga pelo topo',
    at: '2026-09-03T07:30:00',
    type: 'publish',
  },
  {
    id: 'act-4',
    action: 'Admin criado',
    detail: 'Perfil de visualização convidado (demonstração)',
    at: '2026-09-02T16:20:00',
    type: 'admin',
  },
]

export const mockAdmins: MockAdminUser[] = [
  {
    id: 'admin-principal',
    name: 'Administrador AN',
    email: 'admin@an.com',
    adminPermission: 'full',
    isPrincipal: true,
    createdAt: '2026-09-03T00:00:00',
  },
  {
    id: 'admin-view-1',
    name: 'Editor Visualização',
    email: 'viewer@an.com',
    adminPermission: 'view',
    isPrincipal: false,
    createdAt: '2026-09-02T16:20:00',
  },
]

export function getDashboardMetrics() {
  const activeSources = mockSources.filter((s) => s.status === 'active').length
  const collected = mockCollectedNews.length
  const awaitingReview = mockCollectedNews.filter((n) => n.status === 'review').length
  const approved = mockCollectedNews.filter((n) => n.status === 'approved').length
  const rejected = mockCollectedNews.filter((n) => n.status === 'rejected').length
  const published = mockCollectedNews.filter((n) => n.status === 'published').length

  return {
    activeSources,
    collected,
    awaitingReview,
    approved,
    rejected,
    published,
  }
}

export function formatDemoDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativa',
    inactive: 'Inativa',
    collected: 'Coletada',
    processing: 'Processando',
    review: 'Em revisão',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    published: 'Publicada',
    failed: 'Falhou',
    error: 'Erro',
    full: 'Edição total',
    view: 'Somente visualização',
  }
  return map[status] ?? status
}
