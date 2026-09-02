import { type FormEvent, useState } from 'react'
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
} from '@/components/ui'
import { getAuthErrorMessage, signIn, signUp } from '@/services/userService'

interface AuthFormProps {
  mode: 'login' | 'register'
  onToggleMode: () => void
  onBack: () => void
}

export default function AuthForm({ mode, onToggleMode, onBack }: AuthFormProps) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRegister = mode === 'register'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        await signUp({ email, password, name, birthDate })
      } else {
        await signIn(email, password)
      }
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

  return (
    <div className="w-full">
      <Card className="border-border/80 shadow-[var(--shadow-elevated)]">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
            {isRegister ? (
              <UserPlus className="size-5" strokeWidth={1.75} />
            ) : (
              <LogIn className="size-5" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              {isRegister ? 'Criar conta' : 'Entrar'}
            </CardTitle>
            <CardDescription className="mt-1.5 leading-relaxed">
              {isRegister
                ? 'Preencha seus dados para acessar o portal.'
                : 'Informe seu e-mail e senha para continuar.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    error={!!error}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    error={!!error}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                error={!!error}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={!!error}
              />
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              type="submit"
              variant={isRegister ? 'secondary' : 'primary'}
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" variant="light" />
                  Carregando...
                </>
              ) : isRegister ? (
                'Cadastrar'
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4 border-t border-border pt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {isRegister ? 'Já possui conta?' : 'Ainda não possui cadastro?'}{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="font-semibold text-navy-600 transition-colors hover:text-red-600"
              >
                {isRegister ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} />
              Voltar para a home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
