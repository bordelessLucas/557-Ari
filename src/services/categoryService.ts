import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { newsCategories } from '@/constants/navigation'
import { db } from '@/lib/firebase'
import type { Category } from '@/types/category'

function mapCategory(id: string, data: Record<string, unknown>): Category {
  const createdAt = data.createdAt as Timestamp | undefined
  return {
    id,
    name: (data.name as string) ?? '',
    slug: (data.slug as string) ?? '',
    active: data.active !== false,
    createdAt: createdAt?.toDate?.() ?? null,
  }
}

export async function listCategories(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(collection(db, 'categories'), orderBy('name', 'asc')),
  )
  return snapshot.docs.map((item) => mapCategory(item.id, item.data()))
}

/**
 * Se a coleção estiver vazia, popula com as categorias do portal atual do cliente.
 * Categorias oficiais definitivas ainda podem ser ajustadas depois.
 */
export async function ensureDefaultCategories(): Promise<Category[]> {
  const existing = await listCategories()
  if (existing.length > 0) return existing

  const flat = newsCategories.flat()
  await Promise.all(
    flat.map((item) =>
      setDoc(doc(db, 'categories', item.slug), {
        name: item.label,
        slug: item.slug,
        active: true,
        createdAt: serverTimestamp(),
      }),
    ),
  )

  return listCategories()
}
