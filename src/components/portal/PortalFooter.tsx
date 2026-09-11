import { Link } from 'react-router-dom'
import { newsCategories } from '@/constants/navigation'
import { Container, Logo, Text } from '@/components/ui'

const year = new Date().getFullYear()
/** Poucas categorias em grade — o strip do topo é a navegação completa. */
const footerCategories = newsCategories.flat().slice(0, 8)

export default function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-navy-900 text-white">
      <Container
        size="lg"
        className="grid gap-6 py-6 sm:grid-cols-3 sm:gap-8 sm:py-7"
      >
        <div className="space-y-2">
          <Logo size="sm" />
          <Text variant="small" className="text-navy-200">
            Jornalismo digital · cobertura regional e nacional.
          </Text>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-300">
            Categorias
          </p>
          <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {footerCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/noticias/categoria/${cat.slug}`}
                  className="text-sm text-navy-100 transition-colors hover:text-white"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-300">
              Institucional
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-navy-100">
              <li>
                <Link to="/sobre" className="hover:text-white">
                  Sobre
                </Link>
              </li>
              <li className="text-navy-600">·</li>
              <li>
                <Link to="/privacidade" className="hover:text-white">
                  Privacidade
                </Link>
              </li>
              <li className="text-navy-600">·</li>
              <li>
                <Link to="/termos" className="hover:text-white">
                  Termos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-300">
              Contato
            </p>
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-navy-100">
              <a
                href="mailto:redacao@agenciadanoticia.com.br"
                className="hover:text-white"
              >
                Redação
              </a>
              <span className="text-navy-600">·</span>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Instagram
              </a>
              <span className="text-navy-600">·</span>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container
          size="lg"
          className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-navy-300">
            © {year} Agência da Notícia
          </p>
          <p className="text-xs text-navy-400">LGPD · dados pessoais protegidos</p>
        </Container>
      </div>
    </footer>
  )
}
