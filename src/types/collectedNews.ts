export type CollectedNewsStatus =
  | 'collected'
  | 'processing'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'error'

export interface CollectedNews {
  id: string
  title: string
  summary: string
  originalUrl: string
  imageUrl: string | null
  publishedAt: Date | null
  collectedAt: Date | null
  sourceId: string
  sourceName: string
  categoryIds: string[]
  externalId: string | null
  contentHash: string
  status: CollectedNewsStatus
  rawExcerpt: string
}

export interface SourceCollectResult {
  source_id: string
  source_name: string
  found: number
  created: number
  duplicated: number
  error: string | null
}

export interface CollectRunResponse {
  runId: string
  totalFound: number
  totalCreated: number
  totalDuplicated: number
  sources: SourceCollectResult[]
}
