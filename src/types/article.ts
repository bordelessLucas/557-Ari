export type ArticleStatus = 'review' | 'approved' | 'rejected'

export interface Article {
  id: string
  collectedNewsId: string
  sourceId: string
  sourceName: string
  originalUrl: string
  originalTitle: string
  originalSummary: string
  imageUrl: string | null
  categoryIds: string[]
  adaptedTitle: string
  adaptedSummary: string
  adaptedBody: string
  insufficientInfo: boolean
  aiWarnings: string[]
  status: ArticleStatus
  aiJobId: string
  model: string
  promptVersion: string
  createdAt: Date | null
  updatedAt: Date | null
  reviewedAt: Date | null
  reviewedBy: string | null
  rejectionReason: string | null
}

export interface AiProcessResponse {
  processed: number
  succeeded: number
  failed: number
  items: Array<{
    collected_news_id: string
    success: boolean
    article_id: string | null
    ai_job_id: string | null
    error: string | null
  }>
}

export interface ReviewActionResponse {
  articleId: string
  status: ArticleStatus
  reviewId: string
  reason?: string | null
}
