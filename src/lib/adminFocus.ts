/** Foco cruzado entre Dashboard → Revisão / Publicações */

const FOCUS_ARTICLE_KEY = 'ari-admin-focus-article'
const REVIEW_FILTER_KEY = 'ari-admin-review-filter'
/** v2: ignore old sticky collapsed preference that felt like a broken default */
const SIDEBAR_COLLAPSED_KEY = 'ari-admin-sidebar-collapsed-v2'

export function setAdminFocusArticle(articleId: string | null) {
  try {
    if (articleId) sessionStorage.setItem(FOCUS_ARTICLE_KEY, articleId)
    else sessionStorage.removeItem(FOCUS_ARTICLE_KEY)
  } catch {
    // ignore
  }
}

export function consumeAdminFocusArticle(): string | null {
  try {
    const id = sessionStorage.getItem(FOCUS_ARTICLE_KEY)
    if (id) sessionStorage.removeItem(FOCUS_ARTICLE_KEY)
    return id
  } catch {
    return null
  }
}

export function setAdminReviewFilter(
  filter: 'review' | 'published' | 'rejected' | 'all' | null,
) {
  try {
    if (filter) sessionStorage.setItem(REVIEW_FILTER_KEY, filter)
    else sessionStorage.removeItem(REVIEW_FILTER_KEY)
  } catch {
    // ignore
  }
}

export function consumeAdminReviewFilter():
  | 'review'
  | 'published'
  | 'rejected'
  | 'all'
  | null {
  try {
    const value = sessionStorage.getItem(REVIEW_FILTER_KEY)
    sessionStorage.removeItem(REVIEW_FILTER_KEY)
    if (
      value === 'review' ||
      value === 'published' ||
      value === 'rejected' ||
      value === 'all'
    ) {
      return value
    }
    return null
  } catch {
    return null
  }
}

export function readSidebarCollapsed(): boolean {
  try {
    // Explicit opt-in only — default is always expanded
    return sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export function writeSidebarCollapsed(collapsed: boolean) {
  try {
    if (collapsed) sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, '1')
    else sessionStorage.removeItem(SIDEBAR_COLLAPSED_KEY)
  } catch {
    // ignore
  }
}
