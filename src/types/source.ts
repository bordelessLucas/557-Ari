/** Tipos de origem preparados para a coleta (Sprint 3). */
export type SourceKind = 'rss' | 'website' | 'api'

export type SourceStatus = 'active' | 'inactive'

export interface NewsSource {
  id: string
  name: string
  /** URL principal do site/portal */
  siteUrl: string
  /** Feed RSS quando disponível */
  rssUrl: string | null
  /** Endpoint de API quando a fonte for integração específica */
  apiUrl: string | null
  kind: SourceKind
  /** IDs da coleção `categories` */
  categoryIds: string[]
  status: SourceStatus
  newsCount: number
  lastCheckedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
  createdBy: string | null
}

export interface SourceFormData {
  name: string
  siteUrl: string
  rssUrl: string
  apiUrl: string
  kind: SourceKind
  categoryIds: string[]
  status: SourceStatus
}
