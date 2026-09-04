import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Article, ArticleStatus } from '@/types/article'

function toDate(value: unknown): Date | null {
  if (!value) return null
  return (value as Timestamp).toDate?.() ?? null
}

function mapArticle(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    collectedNewsId: (data.collectedNewsId as string) ?? '',
    sourceId: (data.sourceId as string) ?? '',
    sourceName: (data.sourceName as string) ?? '',
    originalUrl: (data.originalUrl as string) ?? '',
    originalTitle: (data.originalTitle as string) ?? '',
    originalSummary: (data.originalSummary as string) ?? '',
    imageUrl: (data.imageUrl as string | null) ?? null,
    categoryIds: Array.isArray(data.categoryIds)
      ? (data.categoryIds as string[])
      : [],
    adaptedTitle: (data.adaptedTitle as string) ?? '',
    adaptedSummary: (data.adaptedSummary as string) ?? '',
    adaptedBody: (data.adaptedBody as string) ?? '',
    insufficientInfo: Boolean(data.insufficientInfo),
    aiWarnings: Array.isArray(data.aiWarnings)
      ? (data.aiWarnings as string[])
      : [],
    status: (data.status as ArticleStatus) ?? 'review',
    aiJobId: (data.aiJobId as string) ?? '',
    model: (data.model as string) ?? '',
    promptVersion: (data.promptVersion as string) ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    reviewedAt: toDate(data.reviewedAt),
    reviewedBy: (data.reviewedBy as string | null) ?? null,
    rejectionReason: (data.rejectionReason as string | null) ?? null,
  }
}

export async function listArticlesByStatus(
  status: ArticleStatus | 'all' = 'review',
  maxItems = 50,
): Promise<Article[]> {
  const base = collection(db, 'articles')
  const q =
    status === 'all'
      ? query(base, orderBy('updatedAt', 'desc'), limit(maxItems))
      : query(
          base,
          where('status', '==', status),
          orderBy('updatedAt', 'desc'),
          limit(maxItems),
        )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((item) => mapArticle(item.id, item.data()))
}

export function formatArticleDate(value: Date | null): string {
  if (!value) return '—'
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
