import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mainNavItems } from '@/constants/navigation'
import NavSearch from '@/components/layout/NavSearch'
import { Container } from '@/components/ui'
import { cn } from '@/lib/utils'

function CategoryMegaMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const newsItem = mainNavItems.find((item) => item.categories)

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
      ref={menuRef}
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
                  <a
                    href={`/noticias/${category.slug}`}
                    className="block text-[15px] font-medium text-neutral-800 transition-colors hover:text-red-700"
                    onClick={onClose}
                  >
                    {category.label}
                  </a>
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
  const [mobileNewsOpen, setMobileNewsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

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
            {mainNavItems.map((item) => {
              const hasCategories = !!item.categories

              if (hasCategories) {
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
              }

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex h-11 items-center px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-900/60"
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="flex h-11 items-center gap-2 px-2 text-sm font-semibold text-white lg:hidden"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            Menu
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-300',
                mobileOpen && 'rotate-180',
              )}
            />
          </button>

          <NavSearch
            onOpenChange={(open) => {
              setSearchOpen(open)
              if (open) setNewsOpen(false)
            }}
          />
        </div>
      </Container>

      <CategoryMegaMenu open={newsOpen} onClose={() => setNewsOpen(false)} />

      <div
        className={cn(
          'overflow-hidden border-t border-red-900/30 bg-red-800 transition-all duration-300 ease-out lg:hidden',
          mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <Container size="lg" className="py-3">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                {item.categories ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setMobileNewsOpen((current) => !current)}
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
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-out',
                        mobileNewsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                      )}
                    >
                      <div className="mt-1 rounded-lg bg-[#e8e8e8] p-4">
                        <div className="grid gap-3">
                          {item.categories.flat().map((category) => (
                            <a
                              key={category.slug}
                              href={`/noticias/${category.slug}`}
                              className="block text-sm font-medium text-neutral-800 hover:text-red-700"
                              onClick={() => {
                                setMobileOpen(false)
                                setMobileNewsOpen(false)
                              }}
                            >
                              {category.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="block rounded-md px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-900/60"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </nav>
  )
}
