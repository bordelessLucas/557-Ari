export type UserRole = 'admin' | 'user'

export type PortalState = 'mato-grosso' | 'palmas' | 'sao-paulo'

/** Nível de permissão dentro do painel admin */
export type AdminPermission = 'full' | 'view'

export interface UserProfile {
  email: string
  role: UserRole
  name: string
  birthDate: string
  selectedState: PortalState
  createdAt: Date | null
  /** Somente para role=admin */
  adminPermission?: AdminPermission
  /** Admin principal do sistema (pode gerenciar outros admins) */
  isPrincipal?: boolean
}

export interface SignUpData {
  email: string
  password: string
  name: string
  birthDate: string
}

export interface CreateAdminData {
  name: string
  email: string
  password: string
  adminPermission: AdminPermission
}
