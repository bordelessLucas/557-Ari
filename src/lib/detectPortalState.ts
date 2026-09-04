import { defaultPortalState, type PortalState } from '@/constants/states'

interface GeoBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/** Ordem: regiões menores/mais específicas primeiro (Palmas/TO). */
const REGION_BOUNDS: Array<{ id: PortalState; bounds: GeoBounds }> = [
  {
    id: 'palmas',
    bounds: { minLat: -13.5, maxLat: -5.0, minLng: -50.8, maxLng: -45.5 },
  },
  {
    id: 'mato-grosso',
    bounds: { minLat: -18.2, maxLat: -7.3, minLng: -61.6, maxLng: -50.2 },
  },
  {
    id: 'sao-paulo',
    bounds: { minLat: -25.4, maxLat: -19.7, minLng: -53.2, maxLng: -44.0 },
  },
]

const REGION_BY_UF: Record<string, PortalState> = {
  MT: 'mato-grosso',
  SP: 'sao-paulo',
  TO: 'palmas',
}

function matchBounds(lat: number, lng: number): PortalState | null {
  for (const region of REGION_BOUNDS) {
    const { minLat, maxLat, minLng, maxLng } = region.bounds
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return region.id
    }
  }
  return null
}

function detectFromTimezone(): PortalState | null {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

  if (tz === 'America/Cuiaba' || tz === 'America/Campo_Grande') {
    return 'mato-grosso'
  }
  if (tz === 'America/Araguaina') {
    return 'palmas'
  }
  // America/Sao_Paulo cobre vários estados — só usa se não houver outro sinal
  return null
}

function getCurrentPosition(
  timeoutMs = 4000,
): Promise<GeolocationPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300_000 },
    )
  })
}

async function detectFromIp(): Promise<PortalState | null> {
  try {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 3500)
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    window.clearTimeout(timer)

    if (!response.ok) return null
    const data = (await response.json()) as {
      region_code?: string
      region?: string
      city?: string
      country_code?: string
    }

    if (data.country_code && data.country_code !== 'BR') {
      return null
    }

    const uf = (data.region_code || '').toUpperCase()
    if (uf && REGION_BY_UF[uf]) return REGION_BY_UF[uf]

    const region = (data.region || '').toLowerCase()
    const city = (data.city || '').toLowerCase()

    if (city.includes('palmas') || region.includes('tocantins')) {
      return 'palmas'
    }
    if (region.includes('mato grosso') && !region.includes('sul')) {
      return 'mato-grosso'
    }
    if (region.includes('são paulo') || region.includes('sao paulo')) {
      return 'sao-paulo'
    }

    return null
  } catch {
    return null
  }
}

/**
 * Tenta identificar a região do portal (MT / Palmas / SP).
 * Ordem: GPS → IP → fuso horário conhecido.
 * Retorna null se não houver match confiável.
 */
export async function detectPortalState(): Promise<PortalState | null> {
  const position = await getCurrentPosition()
  if (position) {
    const matched = matchBounds(
      position.coords.latitude,
      position.coords.longitude,
    )
    if (matched) return matched
  }

  const fromIp = await detectFromIp()
  if (fromIp) return fromIp

  return detectFromTimezone()
}

/** Detecta região ou cai no padrão do portal. */
export async function detectPortalStateOrDefault(): Promise<PortalState> {
  return (await detectPortalState()) ?? defaultPortalState
}
