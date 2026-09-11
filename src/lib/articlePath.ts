import type { Article } from '@/types/article'

/** Gera slug editorial a partir do título (front-only até o back persistir slug). */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'noticia'
}

/** URL pública: /noticias/titulo-da-materia--{firestoreId} */
export function articleHref(article: Pick<Article, 'id' | 'adaptedTitle'>): string {
  return `/noticias/${slugifyTitle(article.adaptedTitle)}--${article.id}`
}

export function parseArticleParam(param: string): {
  id: string | null
  slug: string | null
} {
  const separator = '--'
  const idx = param.lastIndexOf(separator)
  if (idx > 0) {
    return {
      slug: param.slice(0, idx),
      id: param.slice(idx + separator.length) || null,
    }
  }
  // Legacy: só ID Firestore
  if (/^[A-Za-z0-9]{8,}$/.test(param)) {
    return { id: param, slug: null }
  }
  return { id: null, slug: param }
}

export function categoryHref(slugOrId: string): string {
  return `/noticias/categoria/${slugOrId}`
}

export function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
