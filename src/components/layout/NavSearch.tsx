import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input, Spinner } from '@/components/ui'
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

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (!nextOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
    }
  }

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

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

  return (
    <div ref={containerRef} className={cn('relative flex items-center', className)}>
      <div
        className={cn(
          'flex items-center overflow-hidden transition-all duration-300 ease-out',
          open ? 'w-56 sm:w-72' : 'w-11',
        )}
      >
        {open && (
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar notícias..."
            className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/30"
            aria-label="Buscar notícias"
          />
        )}

        <button
          type="button"
          aria-label={open ? 'Fechar busca' : 'Buscar'}
          aria-expanded={open}
          onClick={() => updateOpen(!open)}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center text-white transition-colors duration-200 hover:bg-red-900/60',
            open && 'rounded-r-lg',
          )}
        >
          {open ? <X className="size-5" strokeWidth={2} /> : <Search className="size-5" strokeWidth={2} />}
        </button>
      </div>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-xl border border-border bg-background shadow-[var(--shadow-elevated)] transition-all duration-200 ease-out sm:w-96',
          open && (query.trim() || hasSearched)
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        )}
      >
        <div className="max-h-80 overflow-y-auto p-2">
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
