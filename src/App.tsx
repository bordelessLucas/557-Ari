import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui'
import AdminApp from '@/pages/admin/AdminApp'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Welcome from '@/pages/Welcome'
import { auth } from '@/lib/firebase'
import { getUserProfile } from '@/services/userService'
import type { UserProfile } from '@/types/user'

type AuthScreen = 'welcome' | 'login' | 'register'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<AuthScreen>('welcome')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const userProfile = await getUserProfile(currentUser.uid)
        setProfile(userProfile)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) {
    if (profile?.role === 'admin') {
      return (
        <AdminApp
          user={user}
          profile={{
            ...profile,
            adminPermission: profile.adminPermission ?? 'full',
            isPrincipal: profile.isPrincipal ?? profile.email === 'admin@an.com',
          }}
        />
      )
    }
    return <Home user={user} />
  }

  if (screen === 'login') {
    return (
      <Login
        onNavigateRegister={() => setScreen('register')}
        onNavigateWelcome={() => setScreen('welcome')}
      />
    )
  }

  if (screen === 'register') {
    return (
      <Register
        onNavigateLogin={() => setScreen('login')}
        onNavigateWelcome={() => setScreen('welcome')}
      />
    )
  }

  return (
    <Welcome
      onNavigateLogin={() => setScreen('login')}
      onNavigateRegister={() => setScreen('register')}
    />
  )
}

export default App
