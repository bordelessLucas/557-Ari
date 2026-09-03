import { type FormEvent, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { Lock, Mail } from 'lucide-react'
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
import {
  getAuthErrorMessage,
  resetPassword,
  signIn,
} from '@/services/userService'

export interface LoginScreenProps {
  onNavigateRegister?: () => void
  onNavigateWelcome?: () => void
}

export default function Login({
  onNavigateRegister,
  onNavigateWelcome,
}: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      await signIn(email, password)
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getAuthErrorMessage(err.code))
      } else {
        setError('Erro ao autenticar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)

    if (!email.trim()) {
      setError('Informe seu e-mail acima para recuperar a senha.')
      return
    }

    setResetLoading(true)
    try {
      await resetPassword(email)
      setInfo('Enviamos um link de recuperação para o seu e-mail.')
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getAuthErrorMessage(err.code))
      } else {
        setError('Não foi possível enviar o e-mail de recuperação.')
      }
    } finally {
      setResetLoading(false)
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
            Entrar na conta
          </Heading>
          <Text variant="muted" className="mt-2 max-w-sm">
            Acesse o portal para acompanhar as notícias da Agência da Notícia.
          </Text>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-[var(--shadow-elevated)]">
          <div className="h-1 bg-linear-to-r from-navy-600 via-navy-500 to-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Login
            </CardTitle>
            <CardDescription>
              Informe seu e-mail e senha para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="size-4" strokeWidth={1.75} />}
                error={!!error}
                required
                minLength={6}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-sm font-medium text-navy-600 transition-colors hover:text-red-600 disabled:opacity-60"
                >
                  {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
                </button>
              </div>

              {error && <Alert variant="destructive">{error}</Alert>}
              {info && <Alert variant="success">{info}</Alert>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 space-y-4 border-t border-border pt-6 text-center">
              <Text variant="muted">
                Ainda não possui cadastro?{' '}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-semibold text-navy-600 transition-colors hover:text-red-600"
                >
                  Criar conta
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
