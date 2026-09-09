import { Link } from 'react-router-dom'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import { Container, Heading, Text } from '@/components/ui'

interface Props {
  user: User
}

export default function PrivacyPage({ user }: Props) {
  return (
    <AppLayout
      user={user}
      documentTitle="Política de Privacidade — Agência da Notícia"
    >
      <Container size="lg" className="mx-auto max-w-3xl space-y-6 py-2">
        <Text variant="small">
          <Link to="/" className="text-navy-600 hover:underline">
            Início
          </Link>
          <span className="text-muted-foreground"> / Privacidade</span>
        </Text>

        <Heading level={1}>Política de Privacidade</Heading>
        <Text variant="small">
          Última atualização: setembro de 2026. Documento informativo alinhado à
          Lei nº 13.709/2018 (LGPD).
        </Text>

        <div className="space-y-5 text-base leading-7 text-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Quem somos</h2>
            <p>
              A Agência da Notícia (“nós”) opera este portal de notícias e trata
              dados pessoais necessários para cadastro, autenticação e
              personalização básica da experiência do leitor.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Dados que coletamos</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Dados de conta: nome, e-mail, senha (armazenada de forma segura pelo provedor de autenticação) e, quando informado, data de nascimento.</li>
              <li>Preferências: região/estado selecionado no perfil.</li>
              <li>Dados técnicos: registros de acesso necessários à segurança e ao funcionamento do serviço (ex.: autenticação Firebase).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Finalidades e bases legais</h2>
            <p>
              Utilizamos os dados para criar e manter sua conta, permitir o
              acesso ao conteúdo, melhorar a experiência de leitura, cumprir
              obrigações legais e proteger o serviço contra uso indevido —
              com base na execução de contrato com o titular, legítimo interesse
              (quando aplicável) e cumprimento de obrigação legal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Compartilhamento</h2>
            <p>
              Podemos utilizar provedores de infraestrutura e autenticação
              (como Google Firebase) que processam dados em nosso nome, sob
              obrigações contratuais de segurança e confidencialidade. Não
              vendemos seus dados pessoais.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. Retenção e segurança</h2>
            <p>
              Mantemos os dados pelo tempo necessário às finalidades acima ou
              conforme exigido por lei. Adotamos medidas técnicas e
              organizacionais razoáveis para proteger contas e informações.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">6. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar confirmação de tratamento, acesso, correção,
              anonimização, portabilidade, eliminação de dados desnecessários,
              informação sobre compartilhamentos e revogação de consentimento,
              quando esta for a base legal utilizada — observados os limites
              legais.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">7. Contato do encarregado</h2>
            <p>
              Para exercer direitos ou esclarecer dúvidas sobre privacidade,
              entre em contato pelo e-mail{' '}
              <a
                href="mailto:privacidade@agenciadanoticia.com.br"
                className="font-medium text-navy-700 underline-offset-2 hover:underline"
              >
                privacidade@agenciadanoticia.com.br
              </a>
              . Você também pode registrar reclamação junto à Autoridade
              Nacional de Proteção de Dados (ANPD).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">8. Atualizações</h2>
            <p>
              Esta política pode ser atualizada para refletir mudanças no
              serviço ou na legislação. A versão vigente estará sempre
              disponível nesta página.
            </p>
          </section>
        </div>

        <Text variant="small">
          Veja também:{' '}
          <Link to="/sobre" className="text-navy-600 hover:underline">
            Sobre a empresa
          </Link>
          {' · '}
          <Link to="/termos" className="text-navy-600 hover:underline">
            Termos de uso
          </Link>
        </Text>
      </Container>
    </AppLayout>
  )
}
