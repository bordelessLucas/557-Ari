import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CollectedNews, CollectedNewsStatus } from '@/types/collectedNews'

function toDate(value: unknown): Date | null {
  if (!value) return null
  return (value as Timestamp).toDate?.() ?? null
}

function mapCollectedNews(
  id: string,
  data: Record<string, unknown>,
): CollectedNews {
  return {
    id,
    title: (data.title as string) ?? '',
    summary: (data.summary as string) ?? '',
    originalUrl: (data.originalUrl as string) ?? '',
    imageUrl: (data.imageUrl as string | null) ?? null,
    publishedAt: toDate(data.publishedAt),
    collectedAt: toDate(data.collectedAt),
    sourceId: (data.sourceId as string) ?? '',
    sourceName: (data.sourceName as string) ?? '',
    categoryIds: Array.isArray(data.categoryIds)
      ? (data.categoryIds as string[])
      : [],
    externalId: (data.externalId as string | null) ?? null,
    contentHash: (data.contentHash as string) ?? '',
    status: (data.status as CollectedNewsStatus) ?? 'collected',
    rawExcerpt: (data.rawExcerpt as string) ?? '',
  }
}

export async function listCollectedNews(
  maxItems = 100,
): Promise<CollectedNews[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'collectedNews'),
      orderBy('collectedAt', 'desc'),
      limit(maxItems),
    ),
  )
  return snapshot.docs.map((item) => mapCollectedNews(item.id, item.data()))
}

export function formatCollectedDate(value: Date | null): string {
  if (!value) return '—'
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
