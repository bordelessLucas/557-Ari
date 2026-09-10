import { listArticlesByStatus } from '@/services/articleService'
import { listCollectedNews } from '@/services/collectedNewsService'
import {
  formatPublicationDate,
  listPublications,
} from '@/services/publicationService'
import { listSources } from '@/services/sourceService'
import type { AdminPageId } from '@/constants/adminNavigation'

export interface AdminDashboardMetrics {
  activeSources: number
  totalSources: number
  collected: number
  pendingAi: number
  awaitingReview: number
  rejected: number
  published: number
}

export interface AdminDashboardActivity {
  id: string
  action: string
  detail: string
  at: Date | null
  type: 'publish' | 'review' | 'reject'
  articleId?: string
  targetPage: AdminPageId
  reviewFilter?: 'review' | 'published' | 'rejected' | 'all'
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [sources, collected, articles, publications] = await Promise.all([
    listSources(),
    listCollectedNews(200),
    listArticlesByStatus('all', 200),
    listPublications(100),
  ])

  return {
    activeSources: sources.filter((s) => s.status === 'active').length,
    totalSources: sources.length,
    collected: collected.length,
    pendingAi: collected.filter(
      (n) => n.status === 'collected' && !n.processedByAi,
    ).length,
    awaitingReview: articles.filter((a) => a.status === 'review').length,
    rejected: articles.filter((a) => a.status === 'rejected').length,
    published: publications.filter((p) => p.status === 'published').length,
  }
}

export async function getAdminRecentActivities(
  maxItems = 12,
): Promise<AdminDashboardActivity[]> {
  const [publications, articles] = await Promise.all([
    listPublications(20),
    listArticlesByStatus('all', 40),
  ])

  const activities: AdminDashboardActivity[] = []

  for (const pub of publications) {
    if (pub.status === 'unpublished') continue
    activities.push({
      id: `pub-${pub.id}`,
      action: 'Publicação no portal',
      detail: pub.title,
      at: pub.publishedAt,
      type: 'publish',
      articleId: pub.articleId || undefined,
      targetPage: 'publications',
      reviewFilter: 'published',
    })
  }

  for (const article of articles) {
    if (article.status === 'rejected' && article.reviewedAt) {
      activities.push({
        id: `rej-${article.id}`,
        action: 'Matéria rejeitada',
        detail: article.adaptedTitle || article.originalTitle,
        at: article.reviewedAt,
        type: 'reject',
        articleId: article.id,
        targetPage: 'review',
        reviewFilter: 'rejected',
      })
    } else if (article.status === 'review' && article.createdAt) {
      activities.push({
        id: `rev-${article.id}`,
        action: 'Enviada para revisão',
        detail: article.adaptedTitle || article.originalTitle,
        at: article.createdAt,
        type: 'review',
        articleId: article.id,
        targetPage: 'review',
        reviewFilter: 'review',
      })
    }
  }

  activities.sort((a, b) => {
    const ta = a.at?.getTime() ?? 0
    const tb = b.at?.getTime() ?? 0
    return tb - ta
  })

  return activities.slice(0, maxItems)
}

export function formatActivityDate(value: Date | null): string {
  if (!value) return '—'
  return formatPublicationDate(value)
}
