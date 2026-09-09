import { Link } from 'react-router-dom'
import { newsCategories } from '@/constants/navigation'
import { Container, Logo, Text } from '@/components/ui'

const year = new Date().getFullYear()
const footerCategories = newsCategories.flat().slice(0, 8)

export default function PortalFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-navy-900 text-white">
      <Container
        size="lg"
        className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="space-y-3">
          <Logo size="sm" />
          <Text variant="small" className="text-navy-200">
            Jornalismo digital com cobertura regional e nacional. Portal de
            acesso exclusivo para leitores cadastrados.
          </Text>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
            Categorias
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
            Sobre e privacidade
          </p>
          <ul className="mt-3 space-y-2 text-sm text-navy-100">
            <li>
              <Link
                to="/sobre"
                className="transition-colors hover:text-white"
              >
                Sobre a empresa
              </Link>
            </li>
            <li>
              <Link
                to="/privacidade"
                className="transition-colors hover:text-white"
              >
                Política de Privacidade (LGPD)
              </Link>
            </li>
            <li>
              <Link
                to="/termos"
                className="transition-colors hover:text-white"
              >
                Termos de uso
              </Link>
            </li>
            <li>
              <a
                href="mailto:privacidade@agenciadanoticia.com.br"
                className="transition-colors hover:text-white"
              >
                Canal de privacidade
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container
          size="lg"
          className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-navy-300">
            © {year} Agência da Notícia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-navy-400">
            Tratamos dados pessoais conforme a LGPD.
          </p>
        </Container>
      </div>
    </footer>
  )
}
