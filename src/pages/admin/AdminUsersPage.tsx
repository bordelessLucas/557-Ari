import { type FormEvent, useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
  Text,
} from '@/components/ui'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { mockAdmins } from '@/data/adminMock'
import {
  canManageAdmins,
  createAdminAccount,
  listAdminProfiles,
} from '@/services/userService'
import type { AdminPermission, UserProfile } from '@/types/user'

interface Props {
  profile: UserProfile
}

export default function AdminUsersPage({ profile }: Props) {
  const canManage = canManageAdmins(profile)
  const [admins, setAdmins] = useState(mockAdmins)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [permission, setPermission] = useState<AdminPermission>('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    listAdminProfiles()
      .then((remote) => {
        if (remote.length === 0) return
        setAdmins(
          remote.map((item, index) => ({
            id: item.email || `admin-${index}`,
            name: item.name || 'Administrador',
            email: item.email,
            adminPermission: item.adminPermission ?? 'view',
            isPrincipal: Boolean(item.isPrincipal),
            createdAt: item.createdAt?.toISOString() ?? new Date().toISOString(),
          })),
        )
      })
      .catch(() => {
        // Mantém mock local se a listagem falhar (ex.: índice/rules)
      })
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!canManage) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await createAdminAccount({
        name,
        email,
        password,
        adminPermission: permission,
      })

      setAdmins((current) => [
        {
          id: email,
          name,
          email,
          adminPermission: permission,
          isPrincipal: false,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])

      setName('')
      setEmail('')
      setPassword('')
      setPermission('view')
      setSuccess('Administrador cadastrado com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Administradores</Heading>
          <Text variant="muted" className="mt-1">
            Admin principal com edição total pode cadastrar novos acessos.
          </Text>
        </div>
        <Badge variant="muted">Demo + cadastro real</Badge>
      </div>

      {!canManage && (
        <Alert variant="info">
          Seu perfil não permite cadastrar ou alterar administradores.
        </Alert>
      )}

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar administrador</CardTitle>
            <CardDescription>
              Defina o nível de permissão: edição total ou somente visualização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Senha temporária"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <div className="space-y-2">
                <Label htmlFor="permission">Nível de permissão</Label>
                <select
                  id="permission"
                  value={permission}
                  onChange={(e) =>
                    setPermission(e.target.value as AdminPermission)
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="full">Edição total</option>
                  <option value="view">Somente visualização</option>
                </select>
              </div>

              {error && (
                <div className="md:col-span-2">
                  <Alert variant="destructive">{error}</Alert>
                </div>
              )}
              {success && (
                <div className="md:col-span-2">
                  <Alert variant="success">{success}</Alert>
                </div>
              )}

              <div className="md:col-span-2">
                <Button type="submit" variant="primary" loading={loading}>
                  Cadastrar admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Equipe administrativa</CardTitle>
          <CardDescription>
            Lista de administradores do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {admin.name}
                  {admin.isPrincipal ? ' · Principal' : ''}
                </p>
                <Text variant="small">{admin.email}</Text>
              </div>
              <StatusBadge status={admin.adminPermission} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
