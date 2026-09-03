import { type FormEvent, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { Calendar, Lock, Mail, UserRound } from 'lucide-react'
import {
  Alert,
  AuthShell,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Logo,
  Text,
} from '@/components/ui'
import { getAuthErrorMessage, signUp } from '@/services/userService'

export interface RegisterScreenProps {
  onNavigateLogin?: () => void
  onNavigateWelcome?: () => void
}

export default function Register({
  onNavigateLogin,
  onNavigateWelcome,
}: RegisterScreenProps) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUp({ name, birthDate, email, password })
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getAuthErrorMessage(err.code))
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" className="mb-5" />
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Portal de Notícias
          </p>
          <Heading level={2} className="mt-3">
            Criar conta
          </Heading>
          <Text variant="muted" className="mt-2 max-w-sm">
            Cadastre-se para ler as notícias do portal. Novas contas iniciam como
            leitor.
          </Text>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-[var(--shadow-elevated)]">
          <div className="h-1 bg-linear-to-r from-navy-600 via-navy-500 to-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Cadastro
            </CardTitle>
            <CardDescription>
              Preencha seus dados para criar o acesso.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nome completo"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserRound className="size-4" strokeWidth={1.75} />}
                error={!!error}
                required
              />

              <Input
                label="Data de nascimento"
                type="date"
                name="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                leftIcon={<Calendar className="size-4" strokeWidth={1.75} />}
                error={!!error}
                required
              />

              <Input
                label="E-mail"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="size-4" strokeWidth={1.75} />}
                error={!!error}
                required
              />

              <Input
                label="Senha"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="size-4" strokeWidth={1.75} />}
                hint="Use no mínimo 6 caracteres."
                error={!!error}
                required
                minLength={6}
              />

              {error && <Alert variant="destructive">{error}</Alert>}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Cadastrar
              </Button>
            </form>

            <div className="mt-6 space-y-4 border-t border-border pt-6 text-center">
              <Text variant="muted">
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="font-semibold text-navy-600 transition-colors hover:text-red-600"
                >
                  Entrar
                </button>
              </Text>

              {onNavigateWelcome && (
                <button
                  type="button"
                  onClick={onNavigateWelcome}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Voltar para a home
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  )
}
