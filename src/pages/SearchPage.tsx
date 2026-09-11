import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import {
  categoryLabel,
  ImagePlaceholder,
} from '@/components/portal/portalMedia'
import {
  Alert,
  Container,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import { listCategories } from '@/services/categoryService'
import {
  SearchUnavailableError,
  searchContent,
} from '@/services/searchService'
import type { SearchResult } from '@/types/search'

interface SearchPageProps {
  user: User
}

export default function SearchPage({ user }: SearchPageProps) {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const [results, setResults] = useState<SearchResult[]>([])
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCategories()
      .then((cats) => {
        const map: Record<string, string> = {}
        cats.forEach((cat) => {
          map[cat.id] = cat.name
          if (cat.slug) map[cat.slug] = cat.name
        })
        setCategoryNames(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!q) {
        setResults([])
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await searchContent(q)
        if (!cancelled) setResults(response.results)
      } catch (err) {
        if (!cancelled) {
          setResults([])
          setError(
            err instanceof SearchUnavailableError
              ? err.message
              : 'Busca indisponível no momento.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [q])

  const articles = useMemo(
    () => results.filter((r) => r.type === 'article'),
    [results],
  )
  const categories = useMemo(
    () => results.filter((r) => r.type === 'category'),
    [results],
  )

  return (
    <AppLayout user={user} documentTitle={`Busca${q ? `: ${q}` : ''} — Agência da Notícia`}>
      <Container size="lg" className="space-y-6 py-6 sm:py-8">
        <header className="space-y-2 border-b border-border pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
            Busca
          </p>
          <Heading
            level={1}
            className="font-display text-3xl font-bold tracking-tight"
          >
            {q ? `Resultados para “${q}”` : 'Buscar no portal'}
          </Heading>
          <Text variant="muted">
            Use a lupa na navegação para pesquisar notícias e categorias.
          </Text>
        </header>

        {!q && (
          <Text variant="muted">
            Digite um termo na busca do topo para começar.
          </Text>
        )}

        {error && (
          <Alert variant="destructive">
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          q && (
            <div className="space-y-8">
              {categories.length > 0 && (
                <section className="space-y-3">
                  <h2 className="font-display text-lg font-bold">Categorias</h2>
                  <ul className="flex flex-wrap gap-2">
                    {categories.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.href}
                          className="rounded-md bg-muted px-3 py-1.5 text-sm font-semibold text-navy-800 hover:bg-navy-100"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="space-y-3">
                <h2 className="font-display text-lg font-bold">
                  Notícias ({articles.length})
                </h2>
                {articles.length === 0 ? (
                  <Text variant="muted">Nenhuma matéria encontrada.</Text>
                ) : (
                  <ul className="divide-y divide-border">
                    {articles.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.href}
                          className="group flex gap-4 py-4"
                        >
                          <ImagePlaceholder className="hidden h-16 w-24 shrink-0 sm:block" />
                          <div className="min-w-0 space-y-1">
                            <p className="font-display text-base font-bold transition-colors group-hover:text-navy-700">
                              {item.title}
                            </p>
                            {item.excerpt && (
                              <Text variant="small" className="line-clamp-2">
                                {item.excerpt}
                              </Text>
                            )}
                            {item.category && (
                              <Text variant="small">
                                {categoryLabel([item.category], categoryNames)}
                              </Text>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )
        )}
      </Container>
    </AppLayout>
  )
}
