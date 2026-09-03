import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@/components/ui'
import type { UserProfile } from '@/types/user'

interface Props {
  profile: UserProfile
}

export default function AdminSettingsPage({ profile }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Configurações</Heading>
          <Text variant="muted" className="mt-1">
            Preferências gerais do painel. Integrações avançadas virão nas
            próximas sprints.
          </Text>
        </div>
        <Badge variant="muted">Demo</Badge>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Próximas configurações</CardTitle>
          <CardDescription>
            Itens planejados para sprints futuras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Text variant="muted">• Frequência de coleta automática</Text>
          <Text variant="muted">• Integração de publicação no portal</Text>
          <Text variant="muted">• Perfil editorial da IA</Text>
        </CardContent>
      </Card>
    </div>
  )
}
