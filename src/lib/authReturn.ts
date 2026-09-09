/** Paths de conteúdo do portal a restaurar após login. */
const AUTH_RETURN_KEY = 'ari-auth-return'

export function isPortalContentPath(path: string): boolean {
  if (!path || path === '/') return false
  return (
    path.startsWith('/noticias/') ||
    path === '/noticias' ||
    path === '/sobre' ||
    path === '/privacidade' ||
    path === '/termos'
  )
}

export function captureAuthReturnFromLocation(): void {
  try {
    const { pathname, search } = window.location
    if (!isPortalContentPath(pathname)) return
    sessionStorage.setItem(AUTH_RETURN_KEY, `${pathname}${search}`)
  } catch {
    // ignore
  }
}

export function consumeAuthReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem(AUTH_RETURN_KEY)
    if (path) sessionStorage.removeItem(AUTH_RETURN_KEY)
    return path && isPortalContentPath(path.split('?')[0] ?? '') ? path : null
  } catch {
    return null
  }
}
