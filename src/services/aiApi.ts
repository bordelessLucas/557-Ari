import type { AiProcessResponse, ReviewActionResponse } from '@/types/article'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)

export function isAiApiConfigured(): boolean {
  return Boolean(API_URL)
}

async function parseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => ({}))) as {
    detail?: string | { msg?: string }[]
  }
  const detail = payload.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join('; ')
  }
  return `Erro HTTP ${response.status}`
}

export async function processCollectedWithAi(
  idToken: string,
  ids?: string[],
): Promise<AiProcessResponse> {
  if (!API_URL) {
    throw new Error(
      'API não configurada. Defina VITE_API_URL (ex.: http://localhost:8000).',
    )
  }

  const response = await fetch(`${API_URL}/ai/process`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids?.length ? { ids } : {}),
  })

  if (!response.ok) throw new Error(await parseError(response))
  return (await response.json()) as AiProcessResponse
}

export async function processOneCollectedWithAi(
  collectedNewsId: string,
  idToken: string,
): Promise<AiProcessResponse> {
  if (!API_URL) {
    throw new Error(
      'API não configurada. Defina VITE_API_URL (ex.: http://localhost:8000).',
    )
  }

  const response = await fetch(
    `${API_URL}/ai/process/${encodeURIComponent(collectedNewsId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  )

  if (!response.ok) throw new Error(await parseError(response))
  return (await response.json()) as AiProcessResponse
}

export async function approveArticle(
  articleId: string,
  idToken: string,
): Promise<ReviewActionResponse> {
  if (!API_URL) {
    throw new Error('API não configurada. Defina VITE_API_URL.')
  }

  const response = await fetch(
    `${API_URL}/review/${encodeURIComponent(articleId)}/approve`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    },
  )

  if (!response.ok) throw new Error(await parseError(response))
  return (await response.json()) as ReviewActionResponse
}

export async function rejectArticle(
  articleId: string,
  idToken: string,
  reason?: string,
): Promise<ReviewActionResponse> {
  if (!API_URL) {
    throw new Error('API não configurada. Defina VITE_API_URL.')
  }

  const response = await fetch(
    `${API_URL}/review/${encodeURIComponent(articleId)}/reject`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: reason || null }),
    },
  )

  if (!response.ok) throw new Error(await parseError(response))
  return (await response.json()) as ReviewActionResponse
}
