import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui'
import { searchContent } from '@/services/searchService'
import type { SearchResult } from '@/types/search'
import { cn } from '@/lib/utils'

interface NavSearchProps {
  className?: string
  onOpenChange?: (open: boolean) => void
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: () => void
}) {
  return (
    <a
      href={result.href}
      onClick={onSelect}
      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
    >
      <p className="text-sm font-medium text-foreground">{result.title}</p>
      {result.excerpt && (
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {result.excerpt}
        </p>
      )}
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-red-700">
        {result.type === 'article' ? result.category ?? 'Notícia' : 'Categoria'}
      </p>
    </a>
  )
}

export default function NavSearch({ className, onOpenChange }: NavSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (!nextOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      setLoading(false)
    }
  }

  function clearQuery() {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setLoading(false)
    inputRef.current?.focus()
  }

  function cancelScheduledClose() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  function scheduleClose() {
    cancelScheduledClose()
    closeTimeoutRef.current = window.setTimeout(() => {
      updateOpen(false)
      closeTimeoutRef.current = null
    }, 220)
  }

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    return () => cancelScheduledClose()
  }, [])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        updateOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') updateOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setResults([])
      setHasSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    const timeoutId = window.setTimeout(async () => {
      const response = await searchContent(trimmedQuery)
      setResults(response.results)
      setHasSearched(true)
      setLoading(false)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [query, open])

  const showClear = open && query.length > 0

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center', className)}
      onMouseEnter={cancelScheduledClose}
      onMouseLeave={() => {
        if (open) scheduleClose()
      }}
    >
      <div
        className={cn(
          'flex h-11 items-stretch overflow-hidden rounded-lg transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open
            ? 'w-64 border border-white/30 bg-white/10 shadow-sm sm:w-80'
            : 'w-11 border border-transparent bg-transparent',
        )}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar notícias..."
          aria-label="Buscar notícias"
          tabIndex={open ? 0 : -1}
          readOnly={!open}
          className={cn(
            'min-w-0 border-0 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden',
            'transition-[flex-grow,opacity,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open
              ? 'flex-1 px-3 opacity-100'
              : 'pointer-events-none w-0 flex-none px-0 opacity-0',
          )}
        />

        <button
          type="button"
          aria-label={
            !open ? 'Buscar' : showClear ? 'Limpar busca' : 'Campo de busca'
          }
          aria-expanded={open}
          onClick={() => {
            if (!open) {
              updateOpen(true)
              return
            }
            if (showClear) clearQuery()
          }}
          className={cn(
            'relative flex shrink-0 items-center justify-center text-white transition-colors duration-200',
            open
              ? 'w-10 border-l border-white/20 hover:bg-white/10'
              : 'w-11 hover:bg-red-900/60',
          )}
        >
          <Search
            className={cn(
              'size-5 transition-all duration-200 ease-out',
              showClear
                ? 'absolute scale-75 opacity-0'
                : 'relative scale-100 opacity-100',
            )}
            strokeWidth={2}
          />
          <X
            className={cn(
              'size-4 transition-all duration-200 ease-out',
              showClear
                ? 'relative scale-100 opacity-100'
                : 'absolute scale-75 opacity-0',
            )}
            strokeWidth={2}
            aria-hidden={!showClear}
          />
        </button>
      </div>

      <div
        className={cn(
          'absolute right-0 top-full z-50 w-80 origin-top-right pt-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-96',
          open && (query.trim() || hasSearched)
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-[var(--shadow-elevated)]">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Spinner size="sm" />
              Buscando...
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum resultado encontrado
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tente outro termo. As notícias publicadas aparecerão aqui em breve.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={result.id}>
                  <SearchResultItem
                    result={result}
                    onSelect={() => updateOpen(false)}
                  />
                </li>
              ))}
            </ul>
          )}

          {!loading && !hasSearched && query.trim() && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Digite para buscar notícias e categorias
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
