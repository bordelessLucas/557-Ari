import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Publication {
  id: string
  articleId: string
  title: string
  summary: string
  body: string
  imageUrl: string | null
  categoryIds: string[]
  sourceId: string | null
  sourceName: string | null
  originalUrl: string | null
  publishedBy: string | null
  publishedAt: Date | null
  createdAt: Date | null
  status: string
  portalPath: string | null
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  return (value as Timestamp).toDate?.() ?? null
}

function mapPublication(
  id: string,
  data: Record<string, unknown>,
): Publication {
  return {
    id,
    articleId: (data.articleId as string) ?? '',
    title: (data.title as string) ?? '',
    summary: (data.summary as string) ?? '',
    body: (data.body as string) ?? '',
    imageUrl: (data.imageUrl as string | null) ?? null,
    categoryIds: Array.isArray(data.categoryIds)
      ? (data.categoryIds as string[])
      : [],
    sourceId: (data.sourceId as string | null) ?? null,
    sourceName: (data.sourceName as string | null) ?? null,
    originalUrl: (data.originalUrl as string | null) ?? null,
    publishedBy: (data.publishedBy as string | null) ?? null,
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt),
    status: (data.status as string) ?? 'published',
    portalPath:
      (data.portalPath as string | null) ??
      (data.articleId ? `/noticias/${data.articleId}` : null),
  }
}

export async function listPublications(maxItems = 50): Promise<Publication[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'publications'),
      orderBy('publishedAt', 'desc'),
      limit(maxItems),
    ),
  )
  return snapshot.docs
    .map((item) => mapPublication(item.id, item.data()))
    .filter((item) => item.status !== 'unpublished')
}

export function formatPublicationDate(value: Date | null): string {
  if (!value) return '—'
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
