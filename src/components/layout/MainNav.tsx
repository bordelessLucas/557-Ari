import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavSearch from '@/components/layout/NavSearch'
import { newsCategories } from '@/constants/navigation'
import { categoryHref } from '@/lib/articlePath'
import { Container } from '@/components/ui'
import { cn } from '@/lib/utils'

const allCategories = newsCategories.flat()
/** Visíveis na barra; o restante abre em “Mais”. */
const PRIMARY_COUNT = 6

interface MainNavProps {
  activeSlug?: string
}

export default function MainNav({ activeSlug }: MainNavProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileEntered, setMobileEntered] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const primary = allCategories.slice(0, PRIMARY_COUNT)
  const more = allCategories.slice(PRIMARY_COUNT)

  useEffect(() => {
    if (mobileOpen) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMobileEntered(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setMobileEntered(false)
  }, [mobileOpen])

  useEffect(() => {
    if (!moreOpen) return
    function onDoc(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  function closeMobile() {
    setMobileOpen(false)
  }

  const linkClass = (active: boolean) =>
    cn(
      'shrink-0 rounded px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs',
      active
        ? 'bg-white text-red-800'
        : 'text-white/95 hover:bg-red-900/55 hover:text-white',
    )

  return (
    <nav className="relative bg-red-800">
      <Container size="lg">
        <div className="flex h-12 items-center gap-2 sm:gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1.5 text-sm font-semibold text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen((c) => !c)}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={2} />
            ) : (
              <Menu className="size-5" strokeWidth={2} />
            )}
            Menu
          </button>

          {/* Desktop categories inside red bar */}
          <div
            className={cn(
              'hidden min-w-0 flex-1 items-center gap-0.5 lg:flex',
              searchOpen && 'lg:invisible lg:pointer-events-none',
            )}
          >
            <Link to="/" className={linkClass(!activeSlug)}>
              Destaques
            </Link>
            {primary.map((cat) => (
              <Link
                key={cat.slug}
                to={categoryHref(cat.slug)}
                className={linkClass(activeSlug === cat.slug)}
              >
                {cat.label}
              </Link>
            ))}

            {more.length > 0 && (
              <div ref={moreRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((c) => !c)}
                  className={cn(
                    linkClass(
                      Boolean(
                        activeSlug && more.some((c) => c.slug === activeSlug),
                      ),
                    ),
                    'inline-flex items-center gap-1',
                  )}
                >
                  Mais
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform',
                      moreOpen && 'rotate-180',
                    )}
                  />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-background py-2 shadow-[var(--shadow-elevated)]">
                    {more.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={categoryHref(cat.slug)}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'block px-3 py-2 text-sm font-medium transition-colors',
                          activeSlug === cat.slug
                            ? 'bg-red-50 text-red-800'
                            : 'text-foreground hover:bg-muted',
                        )}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spacer on mobile when search closed */}
          <div
            className={cn(
              'min-w-0 flex-1 lg:hidden',
              searchOpen && 'hidden',
            )}
          />

          <div className="ml-auto shrink-0">
            <NavSearch
              onOpenChange={(open) => {
                setSearchOpen(open)
                if (open) {
                  setMoreOpen(false)
                  closeMobile()
                }
              }}
            />
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            className={cn(
              'fixed inset-0 z-40 bg-navy-950/50 transition-opacity',
              mobileEntered ? 'opacity-100' : 'opacity-0',
            )}
            aria-label="Fechar menu"
            onClick={closeMobile}
          />
          <div
            className={cn(
              'relative z-50 max-h-[min(70dvh,24rem)] overflow-y-auto border-t border-red-900/30 bg-red-800 transition-[opacity] duration-300',
              mobileEntered ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Container size="lg" className="space-y-1 py-3">
              <Link
                to="/"
                onClick={closeMobile}
                className={cn(
                  'block rounded-md px-3 py-2.5 text-sm font-semibold',
                  !activeSlug
                    ? 'bg-white/15 text-white'
                    : 'text-white hover:bg-red-900/60',
                )}
              >
                Destaques
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={categoryHref(cat.slug)}
                  onClick={closeMobile}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-semibold',
                    activeSlug === cat.slug
                      ? 'bg-white/15 text-white'
                      : 'text-white hover:bg-red-900/60',
                  )}
                >
                  {cat.label}
                </Link>
              ))}
            </Container>
          </div>
        </div>
      )}
    </nav>
  )
}
