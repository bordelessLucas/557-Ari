import { Link } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import { Container, Heading, Text } from '@/components/ui'

interface Props {
  user: User
}

export default function AboutPage({ user }: Props) {
  return (
    <AppLayout user={user} documentTitle="Sobre — Agência da Notícia">
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-2">
        <Text variant="small">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span className="text-muted-foreground"> / Sobre</span>
        </Text>

        <Heading level={1}>Sobre a Agência da Notícia</Heading>
        <Text variant="muted" className="text-base leading-relaxed">
          A Agência da Notícia é um veículo de jornalismo digital com foco em
          cobertura regional e nacional — política, economia, agronegócio,
          esporte, cidades e temas de interesse público.
        </Text>
        <div className="space-y-4 text-base leading-7 text-foreground">
          <p>
            Nosso portal reúne matérias produzidas e publicadas pela redação,
            com acesso destinado a leitores cadastrados, para oferecer uma
            experiência de leitura estável e alinhada às boas práticas de
            proteção de dados.
          </p>
          <p>
            Valorizamos informação clara, verificação de fontes e respeito à
            privacidade dos usuários. Para detalhes sobre o tratamento de dados
            pessoais, consulte a{' '}
            <Link
              to="/privacidade"
              className="font-medium text-navy-700 underline-offset-2 hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </Container>
    </AppLayout>
  )
}
