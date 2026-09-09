/** Labels de status usados no painel admin (fora de mocks). */

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativa',
    inactive: 'Inativa',
    collected: 'Coletada',
    prepared: 'Preparada',
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

/** Status de exibição para notícia coletada (considera processedByAi). */
export function collectedNewsDisplayStatus(news: {
  status: string
  processedByAi?: boolean
}): string {
  if (news.status === 'error') return 'error'
  if (news.status === 'published') return 'published'
  if (news.status === 'processing') return 'processing'
  if (news.status === 'collected' && news.processedByAi) return 'prepared'
  return news.status
}
