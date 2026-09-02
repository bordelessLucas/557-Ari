export type SearchResultType = 'article' | 'category'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  excerpt?: string
  href: string
  category?: string
  publishedAt?: Date | null
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}
