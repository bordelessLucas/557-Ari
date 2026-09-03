import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { defaultPortalState } from '@/constants/states'
import { auth, db } from '@/lib/firebase'
import type {
  AdminPermission,
  CreateAdminData,
  PortalState,
  SignUpData,
  UserProfile,
  UserRole,
} from '@/types/user'

const FIREBASE_API_KEY = 'AIzaSyBGrRhD76syviAy2MV8Z6bSkbLfMjobH0Y'

function mapUserProfile(data: Record<string, unknown>): UserProfile {
  return {
    email: (data.email as string) ?? '',
    role: (data.role as UserRole) ?? 'user',
    name: (data.name as string) ?? '',
    birthDate: (data.birthDate as string) ?? '',
    selectedState: (data.selectedState as PortalState) ?? defaultPortalState,
    createdAt: data.createdAt
      ? (data.createdAt as { toDate: () => Date }).toDate()
      : null,
    adminPermission: data.adminPermission as AdminPermission | undefined,
    isPrincipal: Boolean(data.isPrincipal),
  }
}

export async function createUserProfile(
  user: User,
  profileData?: Partial<Pick<UserProfile, 'name' | 'birthDate' | 'selectedState'>>,
): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  const existing = await getDoc(userRef)

  if (existing.exists()) return

  await setDoc(userRef, {
    email: user.email ?? '',
    role: 'user',
    name: profileData?.name ?? '',
    birthDate: profileData?.birthDate ?? '',
    selectedState: profileData?.selectedState ?? defaultPortalState,
    createdAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (!snapshot.exists()) return null
  return mapUserProfile(snapshot.data())
}

export async function listAdminProfiles(): Promise<UserProfile[]> {
  const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'))
  const snapshot = await getDocs(adminsQuery)
  return snapshot.docs.map((item) => mapUserProfile(item.data()))
}

export async function updateUserState(
  uid: string,
  selectedState: PortalState,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { selectedState })
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await createUserProfile(credential.user)
  return credential.user
}

export async function signUp(data: SignUpData): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  )

  await updateProfile(credential.user, { displayName: data.name })
  await createUserProfile(credential.user, {
    name: data.name.trim(),
    birthDate: data.birthDate,
  })

  return credential.user
}

/**
 * Cria outro admin sem trocar a sessão atual (via Identity Toolkit REST).
 */
export async function createAdminAccount(data: CreateAdminData): Promise<string> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email.trim(),
        password: data.password,
        displayName: data.name.trim(),
        returnSecureToken: true,
      }),
    },
  )

  const payload = (await response.json()) as {
    localId?: string
    error?: { message?: string }
  }

  if (!response.ok || !payload.localId) {
    const message = payload.error?.message ?? 'UNKNOWN'
    if (message.includes('EMAIL_EXISTS')) {
      throw new Error('Este e-mail já está cadastrado.')
    }
    if (message.includes('WEAK_PASSWORD')) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.')
    }
    throw new Error('Não foi possível criar o administrador.')
  }

  await setDoc(doc(db, 'users', payload.localId), {
    email: data.email.trim(),
    role: 'admin',
    name: data.name.trim(),
    birthDate: '',
    selectedState: defaultPortalState,
    adminPermission: data.adminPermission,
    isPrincipal: false,
    createdAt: serverTimestamp(),
  })

  return payload.localId
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim())
}

export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/missing-email': 'Informe o e-mail para recuperar a senha.',
  }

  return messages[code] ?? 'Erro ao autenticar. Tente novamente.'
}

export function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '—'

  const [year, month, day] = birthDate.split('-')
  if (!year || !month || !day) return birthDate

  return `${day}/${month}/${year}`
}

export function getFirstName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'Usuário'
  return trimmed.split(/\s+/)[0] ?? trimmed
}

export function canManageAdmins(profile: UserProfile | null): boolean {
  if (!profile || profile.role !== 'admin') return false
  return Boolean(profile.isPrincipal || profile.adminPermission === 'full')
}

export function isViewOnlyAdmin(profile: UserProfile | null): boolean {
  if (!profile || profile.role !== 'admin') return false
  if (profile.isPrincipal) return false
  return profile.adminPermission === 'view'
}
