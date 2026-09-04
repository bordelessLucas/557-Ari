import type { CollectRunResponse } from '@/types/collectedNews'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)

export function isCollectApiConfigured(): boolean {
  return Boolean(API_URL)
}

async function collectRequest(
  path: string,
  idToken: string,
): Promise<CollectRunResponse> {
  if (!API_URL) {
    throw new Error(
      'API de coleta não configurada. Defina VITE_API_URL no .env (ex.: http://localhost:8000).',
    )
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  })

  const payload = (await response.json().catch(() => ({}))) as {
    detail?: string | { msg?: string }[]
    runId?: string
    totalFound?: number
    totalCreated?: number
    totalDuplicated?: number
    sources?: CollectRunResponse['sources']
  }

  if (!response.ok) {
    const detail = payload.detail
    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg).filter(Boolean).join('; ')
          : 'Falha ao executar a coleta.'
    throw new Error(message || `Erro HTTP ${response.status}`)
  }

  return {
    runId: payload.runId ?? '',
    totalFound: payload.totalFound ?? 0,
    totalCreated: payload.totalCreated ?? 0,
    totalDuplicated: payload.totalDuplicated ?? 0,
    sources: payload.sources ?? [],
  }
}

export async function collectAllSources(
  idToken: string,
): Promise<CollectRunResponse> {
  return collectRequest('/collect', idToken)
}

export async function collectOneSource(
  sourceId: string,
  idToken: string,
): Promise<CollectRunResponse> {
  return collectRequest(`/collect/${encodeURIComponent(sourceId)}`, idToken)
}
