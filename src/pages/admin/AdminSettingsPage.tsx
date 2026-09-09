import { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Spinner,
  Text,
} from '@/components/ui'
import type { UserProfile } from '@/types/user'

interface Props {
  profile: UserProfile
}

interface ReadyPayload {
  status: string
  pipeline_ready?: boolean
  checks?: Record<string, string>
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
)

export default function AdminSettingsPage({ profile }: Props) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState<ReadyPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      if (!API_URL) {
        setError('VITE_API_URL não configurada no frontend (.env).')
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${API_URL}/ready`)
        const payload = (await response.json()) as ReadyPayload
        if (!cancelled) setReady(payload)
      } catch {
        if (!cancelled) {
          setError(
            'API offline. Suba o backend em localhost:8000 (uvicorn).',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const checks = ready?.checks ?? {}
  const pipelineOk = Boolean(ready?.pipeline_ready)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Heading level={2}>Configurações</Heading>
        <Text variant="muted" className="mt-1">
          Status da API e conta administrativa.
        </Text>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da API de coleta / IA</CardTitle>
          <CardDescription>
            Necessário para Coletar → Processar → Aprovar no portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <Spinner />
          ) : error ? (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={pipelineOk ? 'success' : 'warning'}>
                  {pipelineOk ? 'Pipeline pronto' : 'Pipeline incompleto'}
                </Badge>
                <Text variant="small">API: {API_URL}</Text>
              </div>
              <ul className="space-y-1 text-sm">
                <li>
                  Service account:{' '}
                  <strong>{checks.service_account ?? '—'}</strong>
                </li>
                <li>
                  Firestore: <strong>{checks.firestore ?? '—'}</strong>
                </li>
                <li>
                  Modo editorial: <strong>{checks.ai_mode ?? '—'}</strong>
                  {checks.ai_mode === 'passthrough'
                    ? ' (texto original na revisão — configure OPENAI_API_KEY para adaptação)'
                    : ''}
                </li>
                <li>
                  OpenAI key: <strong>{checks.openai_key ?? '—'}</strong>
                </li>
              </ul>
              {!pipelineOk && (
                <Alert variant="warning">
                  <p className="text-sm font-medium">Para liberar o fluxo:</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm">
                    <li>
                      Na tela que você abriu (SDK Admin do Firebase), clique em{' '}
                      <strong>Gerar nova chave privada</strong>
                    </li>
                    <li>
                      Salve o JSON baixado como{' '}
                      <code className="rounded bg-muted px-1">
                        backend/serviceAccount.json
                      </code>
                    </li>
                    <li>
                      Reinicie o backend:{' '}
                      <code className="rounded bg-muted px-1">
                        uvicorn app.main:app --reload --port 8000
                      </code>
                    </li>
                    <li>
                      Sem <code className="rounded bg-muted px-1">OPENAI_API_KEY</code>{' '}
                      o sistema usa modo passthrough (conteúdo original na
                      revisão). Com a chave, a adaptação editorial é automática.
                    </li>
                  </ol>
                </Alert>
              )}
              {pipelineOk && checks.openai_key === 'missing' && (
                <Alert variant="info">
                  <p className="text-sm">
                    Pipeline ok sem OpenAI. Quando a chave chegar, coloque em{' '}
                    <code className="rounded bg-muted px-1">
                      backend/.env
                    </code>{' '}
                    (`OPENAI_API_KEY=...`) e reinicie — o modo muda para openai
                    automaticamente.
                  </p>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta administrativa</CardTitle>
          <CardDescription>Dados da sessão atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Text variant="small">Nome</Text>
            <p className="text-sm font-medium">{profile.name || '—'}</p>
          </div>
          <div>
            <Text variant="small">E-mail</Text>
            <p className="text-sm font-medium">{profile.email}</p>
          </div>
          <div>
            <Text variant="small">Permissão</Text>
            <p className="text-sm font-medium">
              {profile.isPrincipal || profile.adminPermission === 'full'
                ? 'Edição total'
                : 'Somente visualização'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
