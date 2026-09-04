import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { NewsSource, SourceFormData, SourceKind, SourceStatus } from '@/types/source'

function toDate(value: unknown): Date | null {
  if (!value) return null
  return (value as Timestamp).toDate?.() ?? null
}

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function resolveKind(data: SourceFormData): SourceKind {
  if (data.kind === 'api') return 'api'
  if (data.kind === 'rss' || data.rssUrl.trim()) return 'rss'
  return 'website'
}

function mapSource(id: string, data: Record<string, unknown>): NewsSource {
  return {
    id,
    name: (data.name as string) ?? '',
    siteUrl: (data.siteUrl as string) ?? '',
    rssUrl: (data.rssUrl as string | null) ?? null,
    apiUrl: (data.apiUrl as string | null) ?? null,
    kind: (data.kind as SourceKind) ?? 'website',
    categoryIds: Array.isArray(data.categoryIds)
      ? (data.categoryIds as string[])
      : [],
    status: (data.status as SourceStatus) ?? 'inactive',
    newsCount: typeof data.newsCount === 'number' ? data.newsCount : 0,
    lastCheckedAt: toDate(data.lastCheckedAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    createdBy: (data.createdBy as string | null) ?? null,
  }
}

function buildPayload(data: SourceFormData) {
  const kind = resolveKind(data)
  return {
    name: data.name.trim(),
    siteUrl: data.siteUrl.trim(),
    rssUrl: kind === 'api' ? null : normalizeUrl(data.rssUrl),
    apiUrl: kind === 'api' ? normalizeUrl(data.apiUrl) : null,
    kind,
    categoryIds: data.categoryIds,
    status: data.status,
    updatedAt: serverTimestamp(),
  }
}

export async function listSources(status?: SourceStatus): Promise<NewsSource[]> {
  const base = collection(db, 'sources')
  const q = status
    ? query(base, where('status', '==', status), orderBy('updatedAt', 'desc'))
    : query(base, orderBy('updatedAt', 'desc'))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((item) => mapSource(item.id, item.data()))
}

export async function createSource(
  data: SourceFormData,
  createdBy: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'sources'), {
    ...buildPayload(data),
    newsCount: 0,
    lastCheckedAt: null,
    createdBy,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSource(
  sourceId: string,
  data: SourceFormData,
): Promise<void> {
  // Não sobrescreve newsCount / lastCheckedAt (usados na Sprint 3)
  await updateDoc(doc(db, 'sources', sourceId), buildPayload(data))
}

export async function setSourceStatus(
  sourceId: string,
  status: SourceStatus,
): Promise<void> {
  await updateDoc(doc(db, 'sources', sourceId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSource(sourceId: string): Promise<void> {
  await deleteDoc(doc(db, 'sources', sourceId))
}

export function emptySourceForm(): SourceFormData {
  return {
    name: '',
    siteUrl: '',
    rssUrl: '',
    apiUrl: '',
    kind: 'website',
    categoryIds: [],
    status: 'active',
  }
}

export function sourceToForm(source: NewsSource): SourceFormData {
  return {
    name: source.name,
    siteUrl: source.siteUrl,
    rssUrl: source.rssUrl ?? '',
    apiUrl: source.apiUrl ?? '',
    kind: source.kind,
    categoryIds: [...source.categoryIds],
    status: source.status,
  }
}

export function formatSourceDate(value: Date | null): string {
  if (!value) return '—'
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const sourceKindLabel: Record<SourceKind, string> = {
  rss: 'RSS',
  website: 'Site público',
  api: 'API',
}
