import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { mainNavItems } from '@/constants/navigation'
import NavSearch from '@/components/layout/NavSearch'
import { Container } from '@/components/ui'
import { cn } from '@/lib/utils'

/** Só seções com destino real (sem “Em breve”). */
const liveNavItems = mainNavItems.filter((item) => Boolean(item.categories))

function categoryPath(slug: string) {
  return `/noticias/categoria/${slug}`
}

function CategoryMegaMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const newsItem = liveNavItems.find((item) => item.categories)

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!newsItem?.categories) return null

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-red-900/30 bg-[#e8e8e8] shadow-[var(--shadow-elevated)] transition-all duration-300 ease-out',
        open
          ? 'pointer-events-auto max-h-96 opacity-100'
          : 'pointer-events-none max-h-0 opacity-0',
      )}
    >
      <Container size="lg" className="py-6">
        <div
          className={cn(
            'grid grid-cols-1 gap-6 transition-all duration-300 ease-out sm:grid-cols-3 sm:gap-0',
            open ? 'translate-y-0' : '-translate-y-2',
          )}
        >
          {newsItem.categories.map((column, columnIndex) => (
            <ul
              key={columnIndex}
              className={cn(
                'space-y-2.5',
                columnIndex > 0 && 'sm:border-l sm:border-neutral-300 sm:pl-8',
              )}
            >
              {column.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={categoryPath(category.slug)}
                    className="block text-[15px] font-medium text-neutral-800 transition-colors hover:text-red-700"
                    onClick={onClose}
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default function MainNav() {
  const [newsOpen, setNewsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileEntered, setMobileEntered] = useState(false)
  const [mobileNewsOpen, setMobileNewsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mobileOpen) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMobileEntered(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setMobileEntered(false)
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
    setMobileNewsOpen(false)
  }

  return (
    <nav
      ref={navRef}
      className="relative bg-red-800"
      onMouseLeave={() => {
        if (!searchOpen) setNewsOpen(false)
      }}
    >
      <Container size="lg">
        <div className="flex items-center justify-between">
          <ul className="hidden items-stretch lg:flex">
            {liveNavItems.map((item) => {
              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => {
                    if (!searchOpen) setNewsOpen(true)
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={newsOpen}
                    aria-haspopup="true"
                    onClick={() => setNewsOpen((current) => !current)}
                    className={cn(
                      'flex h-11 items-center gap-1 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-900/60',
                      newsOpen && 'bg-red-900/60',
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-300',
                        newsOpen && 'rotate-180',
                      )}
                      strokeWidth={2}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="flex h-11 items-center gap-2 px-2 text-sm font-semibold text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={2} />
            ) : (
              <Menu className="size-5" strokeWidth={2} />
            )}
            Menu
          </button>

          <NavSearch
            onOpenChange={(open) => {
              setSearchOpen(open)
              if (open) {
                setNewsOpen(false)
                closeMobile()
              }
            }}
          />
        </div>
      </Container>

      <CategoryMegaMenu open={newsOpen} onClose={() => setNewsOpen(false)} />

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
              'relative z-50 border-t border-red-900/30 bg-red-800 shadow-[var(--shadow-elevated)] transition-[max-height,opacity] duration-300 ease-out',
              mobileEntered
                ? 'max-h-[min(85dvh,calc(100dvh-6.5rem))] opacity-100'
                : 'max-h-0 overflow-hidden opacity-0',
            )}
          >
            <div
              className={cn(
                'overscroll-contain py-3',
                mobileEntered && 'max-h-[min(85dvh,calc(100dvh-6.5rem))] overflow-y-auto',
              )}
            >
              <Container size="lg">
                <ul className="space-y-1">
                  {liveNavItems.map((item) => (
                    <li key={item.href}>
                      {item.categories && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setMobileNewsOpen((current) => !current)
                            }
                            className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-900/60"
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                'size-4 transition-transform duration-300',
                                mobileNewsOpen && 'rotate-180',
                              )}
                            />
                          </button>
                          {mobileNewsOpen && (
                            <div className="mt-1 rounded-lg bg-[#e8e8e8] p-4">
                              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                                {item.categories.flat().map((category) => (
                                  <Link
                                    key={category.slug}
                                    to={categoryPath(category.slug)}
                                    className="block text-sm font-medium text-neutral-800 hover:text-red-700"
                                    onClick={closeMobile}
                                  >
                                    {category.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/"
                      className="block rounded-md px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-900/60"
                      onClick={closeMobile}
                    >
                      Início
                    </Link>
                  </li>
                </ul>
              </Container>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
