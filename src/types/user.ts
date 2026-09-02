export type UserRole = 'admin' | 'user'

export type PortalState = 'mato-grosso' | 'palmas' | 'sao-paulo'

export interface UserProfile {
  email: string
  role: UserRole
  name: string
  birthDate: string
  selectedState: PortalState
  createdAt: Date | null
}

export interface SignUpData {
  email: string
  password: string
  name: string
  birthDate: string
}
