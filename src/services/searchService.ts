import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { newsCategories } from '@/constants/navigation'
import { db } from '@/lib/firebase'
import type { PortalState } from '@/types/user'
import type { SearchResponse, SearchResult } from '@/types/search'

interface SearchOptions {
  state?: PortalState
  maxResults?: number
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function searchCategories(term: string): SearchResult[] {
  const normalizedTerm = normalizeText(term)
  if (!normalizedTerm) return []

  return newsCategories
    .flat()
    .filter((category) => normalizeText(category.label).includes(normalizedTerm))
    .map((category) => ({
      id: `category-${category.slug}`,
      type: 'category' as const,
      title: category.label,
      excerpt: 'Categoria de notícias',
      href: `/noticias/${category.slug}`,
    }))
}

async function searchPublishedArticles(
  term: string,
  maxResults: number,
): Promise<SearchResult[]> {
  const normalizedTerm = normalizeText(term)
  if (!normalizedTerm) return []

  try {
    const articlesRef = collection(db, 'articles')
    const articlesQuery = query(
      articlesRef,
      where('status', '==', 'published'),
      limit(50),
    )

    const snapshot = await getDocs(articlesQuery)

    const matches: SearchResult[] = []

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const title = (data.title as string) ?? ''
      const summary = (data.summary as string) ?? ''
      const slug = (data.slug as string) ?? docSnap.id
      const category = data.category as string | undefined
      const publishedAt = data.publishedAt
        ? (data.publishedAt as { toDate: () => Date }).toDate()
        : null

      const searchable = normalizeText(`${title} ${summary} ${category ?? ''}`)
      if (!searchable.includes(normalizedTerm)) continue

      matches.push({
        id: docSnap.id,
        type: 'article',
        title,
        excerpt: summary,
        href: `/noticias/${slug}`,
        category,
        publishedAt,
      })

      if (matches.length >= maxResults) break
    }

    return matches
  } catch {
    return []
  }
}

export async function searchContent(
  rawQuery: string,
  options: SearchOptions = {},
): Promise<SearchResponse> {
  const queryText = rawQuery.trim()
  const maxResults = options.maxResults ?? 8

  if (!queryText) {
    return { query: queryText, results: [], total: 0 }
  }

  const [categories, articles] = await Promise.all([
    Promise.resolve(searchCategories(queryText)),
    searchPublishedArticles(queryText, maxResults),
  ])

  const results = [...articles, ...categories].slice(0, maxResults)

  return {
    query: queryText,
    results,
    total: results.length,
  }
}
