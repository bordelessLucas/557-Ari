import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { newsCategories } from '@/constants/navigation'
import { articleHref } from '@/lib/articlePath'
import { db } from '@/lib/firebase'
import type { PortalState } from '@/types/user'
import type { SearchResponse, SearchResult } from '@/types/search'

interface SearchOptions {
  state?: PortalState
  maxResults?: number
}

export class SearchUnavailableError extends Error {
  constructor(message = 'Busca indisponível no momento.') {
    super(message)
    this.name = 'SearchUnavailableError'
  }
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
      href: `/noticias/categoria/${category.slug}`,
    }))
}

function resolveCategoryLabel(categoryIds: string[]): string {
  if (!categoryIds.length) return 'Notícia'
  const idOrSlug = categoryIds[0]
  const fromNav = newsCategories
    .flat()
    .find((item) => item.slug === idOrSlug || item.label === idOrSlug)
  return fromNav?.label ?? idOrSlug
}

async function searchPublishedArticles(
  term: string,
  maxResults: number,
): Promise<SearchResult[]> {
  const normalizedTerm = normalizeText(term)
  if (!normalizedTerm) return []

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
    const title = (data.adaptedTitle as string) ?? ''
    const summary = (data.adaptedSummary as string) ?? ''
    const categoryIds = Array.isArray(data.categoryIds)
      ? (data.categoryIds as string[])
      : []
    const publishedAt = data.publishedAt
      ? (data.publishedAt as { toDate: () => Date }).toDate()
      : null

    const searchable = normalizeText(
      `${title} ${summary} ${categoryIds.join(' ')}`,
    )
    if (!searchable.includes(normalizedTerm)) continue

    matches.push({
      id: docSnap.id,
      type: 'article',
      title,
      excerpt: summary,
      href: articleHref({ id: docSnap.id, adaptedTitle: title }),
      category: resolveCategoryLabel(categoryIds),
      publishedAt,
    })

    if (matches.length >= maxResults) break
  }

  return matches
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

  try {
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
  } catch (err) {
    throw new SearchUnavailableError(
      err instanceof Error ? err.message : 'Busca indisponível no momento.',
    )
  }
}
