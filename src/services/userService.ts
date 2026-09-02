import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { defaultPortalState } from '@/constants/states'
import { auth, db } from '@/lib/firebase'
import type { PortalState, SignUpData, UserProfile, UserRole } from '@/types/user'

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

export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
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
