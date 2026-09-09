import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Label,
  Spinner,
  Text,
} from '@/components/ui'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  canManageAdmins,
  createAdminAccount,
  listAdminProfiles,
} from '@/services/userService'
import type { AdminPermission, UserProfile } from '@/types/user'

interface AdminListItem {
  id: string
  name: string
  email: string
  adminPermission: AdminPermission
  isPrincipal: boolean
}

interface Props {
  profile: UserProfile
}

export default function AdminUsersPage({ profile }: Props) {
  const canManage = canManageAdmins(profile)
  const [admins, setAdmins] = useState<AdminListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [permission, setPermission] = useState<AdminPermission>('view')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadAdmins = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const remote = await listAdminProfiles()
      setAdmins(
        remote.map((item, index) => ({
          id: item.email || `admin-${index}`,
          name: item.name || 'Administrador',
          email: item.email,
          adminPermission: item.adminPermission ?? 'view',
          isPrincipal: Boolean(item.isPrincipal),
        })),
      )
    } catch (err) {
      setAdmins([])
      setListError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os administradores.',
      )
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAdmins()
  }, [loadAdmins])

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

      setName('')
      setEmail('')
      setPassword('')
      setPermission('view')
      setSuccess('Administrador cadastrado com sucesso.')
      await loadAdmins()
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
            Somente o administrador principal pode cadastrar novos acessos.
          </Text>
        </div>
      </div>

      {!canManage && (
        <Alert variant="info">
          Seu perfil não permite cadastrar ou alterar administradores. Peça ao
          admin principal se precisar de um novo acesso.
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
            Lista de administradores do sistema (Firestore).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {listLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : listError ? (
            <Alert variant="destructive">
              <p className="text-sm">{listError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void loadAdmins()}
              >
                Tentar novamente
              </Button>
            </Alert>
          ) : admins.length === 0 ? (
            <Text variant="muted">Nenhum administrador encontrado.</Text>
          ) : (
            admins.map((admin) => (
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
                <StatusBadge
                  status={admin.isPrincipal ? 'full' : admin.adminPermission}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
