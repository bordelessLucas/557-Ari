import { useState } from 'react'
import { Clock, Globe, Newspaper } from 'lucide-react'
import AuthForm from '@/components/auth/AuthForm'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Heading, Logo, Text } from '@/components/ui'

type AuthView = 'landing' | 'login' | 'register'

const features = [
  {
    icon: Globe,
    title: 'Cobertura nacional',
    description: 'Notícias do Brasil e das principais regiões do país.',
  },
  {
    icon: Clock,
    title: 'Notícias em tempo real',
    description: 'Acompanhe os fatos conforme eles acontecem.',
  },
  {
    icon: Newspaper,
    title: 'Jornalismo confiável',
    description: 'Conteúdo produzido pela Agência da Notícia.',
  },
] as const

export default function Welcome() {
  const [view, setView] = useState<AuthView>('landing')

  function handleToggleMode() {
    setView((current) => (current === 'login' ? 'register' : 'login'))
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-navy-900 px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-12">
        {/* Diagonal da logo */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-navy-900 via-navy-800 to-red-700"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-red-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-navy-400/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />

        <div className="relative z-10 py-2">
          <Logo size="xl" className="drop-shadow-lg" />
        </div>

        <div className="relative z-10 my-10 lg:my-0">
          <Heading level={1} className="mb-5 text-white">
            Informação de credibilidade, na hora do fato
          </Heading>

          <Text
            variant="lead"
            className="max-w-md text-[15px] leading-relaxed text-navy-100 sm:text-base"
          >
            Política, economia, agronegócio, esporte e muito mais. Acompanhe
            os principais acontecimentos do Brasil com a Agência da Notícia.
          </Text>

          <ul className="mt-10 hidden space-y-5 lg:block">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Icon className="size-5 text-red-300" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-navy-200">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-navy-300">
          © {new Date().getFullYear()} Agência da Notícia. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel de acesso */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          {view === 'landing' ? (
            <Card className="overflow-hidden border-border/80 shadow-[var(--shadow-elevated)]">
              <div className="h-1 bg-linear-to-r from-navy-600 via-navy-500 to-red-600" />
              <CardHeader className="items-center space-y-3 pb-2 text-center lg:items-start lg:text-left">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  Bem-vindo
                </CardTitle>
                <CardDescription className="max-w-sm text-[15px] leading-relaxed">
                  Faça login na sua conta para ter acesso às notícias do portal.
                  Ainda não tem cadastro? Crie sua conta em poucos segundos.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 shadow-[var(--shadow-card)]"
                    onClick={() => setView('login')}
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setView('register')}
                  >
                    Cadastrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AuthForm
              mode={view}
              onToggleMode={handleToggleMode}
              onBack={() => setView('landing')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
