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
    slug: (data.slug as string) ?? id,
    active: data.active !== false,
    createdAt: createdAt?.toDate?.() ?? null,
  }
}

/** Categorias do menu do portal — sempre disponíveis na UI. */
export function portalCategoriesFallback(): Category[] {
  return newsCategories.flat().map((item) => ({
    id: item.slug,
    name: item.label,
    slug: item.slug,
    active: true,
    createdAt: null,
  }))
}

export async function listCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'categories'), orderBy('name', 'asc')),
    )
    return snapshot.docs.map((item) => mapCategory(item.id, item.data()))
  } catch {
    const snapshot = await getDocs(collection(db, 'categories'))
    return snapshot.docs
      .map((item) => mapCategory(item.id, item.data()))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }
}

/**
 * Garante categorias no Firestore; se falhar a escrita, devolve fallback do portal
 * para o formulário de fontes nunca ficar sem opções.
 */
export async function ensureDefaultCategories(): Promise<Category[]> {
  try {
    const existing = await listCategories()
    if (existing.length > 0) {
      return existing.filter((item) => item.active)
    }

    const flat = newsCategories.flat()
    for (const item of flat) {
      await setDoc(
        doc(db, 'categories', item.slug),
        {
          name: item.label,
          slug: item.slug,
          active: true,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    const seeded = await listCategories()
    if (seeded.length > 0) return seeded.filter((item) => item.active)
  } catch {
    // Fallback abaixo
  }

  return portalCategoriesFallback()
}
