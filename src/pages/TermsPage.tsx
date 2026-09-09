import { Link } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import { Container, Heading, Text } from '@/components/ui'

interface Props {
  user: User
}

export default function TermsPage({ user }: Props) {
  return (
    <AppLayout user={user} documentTitle="Termos de uso — Agência da Notícia">
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-2">
        <Text variant="small">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span className="text-muted-foreground"> / Termos</span>
        </Text>

        <Heading level={1}>Termos de uso</Heading>
        <Text variant="small">Última atualização: setembro de 2026.</Text>

        <div className="space-y-5 text-base leading-7 text-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Aceitação</h2>
            <p>
              Ao criar conta e utilizar o portal da Agência da Notícia, você
              concorda com estes termos e com a{' '}
              <Link
                to="/privacidade"
                className="font-medium text-navy-700 underline-offset-2 hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Conta e acesso</h2>
            <p>
              O conteúdo do portal destina-se a leitores autenticados. Você é
              responsável por manter a confidencialidade das credenciais e por
              atividades realizadas sob sua conta.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Conteúdo</h2>
            <p>
              As matérias e materiais publicados são protegidos por direitos
              autorais e demais normas aplicáveis. É vedada a reprodução
              comercial não autorizada. Citações e usos permitidos por lei
              devem indicar a fonte.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Conduta</h2>
            <p>
              É proibido tentar burlar autenticação, sobrecarregar o serviço,
              coletar dados de terceiros de forma ilícita ou utilizar o portal
              para fins ilegais.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. Disponibilidade</h2>
            <p>
              Empregamos esforços razoáveis para manter o portal disponível,
              sem garantia de funcionamento ininterrupto. Podemos alterar ou
              suspender funcionalidades mediante aviso quando possível.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">6. Contato</h2>
            <p>
              Dúvidas sobre estes termos:{' '}
              <a
                href="mailto:contato@agenciadanoticia.com.br"
                className="font-medium text-navy-700 underline-offset-2 hover:underline"
              >
                contato@agenciadanoticia.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </AppLayout>
  )
}
