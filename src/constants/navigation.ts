export interface NavCategory {
  label: string
  slug: string
}

export interface NavItem {
  label: string
  href: string
  categories?: NavCategory[][]
}

export const newsCategories: NavCategory[][] = [
  [
    { label: 'Agronegócio', slug: 'agronegocio' },
    { label: 'Artigos e Opinião', slug: 'artigos-e-opiniao' },
    { label: 'Cidades', slug: 'cidades' },
    { label: 'Economia', slug: 'economia' },
    { label: 'Educação', slug: 'educacao' },
    { label: 'Entrevista', slug: 'entrevista' },
  ],
  [
    { label: 'Esporte', slug: 'esporte' },
    { label: 'Geral', slug: 'geral' },
    { label: 'Internauta AN', slug: 'internauta-an' },
    { label: 'Judiciário', slug: 'judiciario' },
    { label: 'Nos Bastidores', slug: 'nos-bastidores' },
    { label: 'Operação Lava Jato', slug: 'operacao-lava-jato' },
  ],
  [
    { label: 'Polícia', slug: 'policia' },
    { label: 'Política', slug: 'politica' },
    { label: 'Saúde', slug: 'saude' },
    { label: 'Eleições 2026', slug: 'eleicoes-2026' },
  ],
]

export const mainNavItems: NavItem[] = [
  { label: 'Notícias', href: '/noticias', categories: newsCategories },
  { label: 'Artigos', href: '/artigos' },
  { label: 'Vídeos', href: '/videos' },
  { label: 'Galeria de Imagens', href: '/galeria' },
  { label: 'Cotações', href: '/cotacoes' },
  { label: 'Enquetes', href: '/enquetes' },
]
