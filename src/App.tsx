import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import AdminApp from '@/pages/admin/AdminApp'
import ArticlePage from '@/pages/ArticlePage'
import CategoryPage from '@/pages/CategoryPage'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Welcome from '@/pages/Welcome'
import { auth } from '@/lib/firebase'
import { getUserProfile } from '@/services/userService'
import type { UserProfile } from '@/types/user'

type AuthScreen = 'welcome' | 'login' | 'register'
type AdminView = 'admin' | 'portal'

const ADMIN_VIEW_KEY = 'ari-admin-view'

function readAdminView(): AdminView {
  try {
    return sessionStorage.getItem(ADMIN_VIEW_KEY) === 'portal'
      ? 'portal'
      : 'admin'
  } catch {
    return 'admin'
  }
}

function writeAdminView(view: AdminView) {
  try {
    sessionStorage.setItem(ADMIN_VIEW_KEY, view)
  } catch {
    // ignore
  }
}

function PortalRoutes({
  user,
  onBackToAdmin,
}: {
  user: User
  onBackToAdmin?: () => void
}) {
  return (
    <>
      {onBackToAdmin && (
        <div className="sticky top-0 z-[60] border-b border-navy-800 bg-navy-900 px-4 py-2 text-center">
          <button
            type="button"
            onClick={onBackToAdmin}
            className="text-sm font-medium text-white underline-offset-2 hover:underline"
          >
            ← Voltar ao painel admin
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/noticias/categoria/:categorySlug"
          element={<CategoryPage user={user} />}
        />
        <Route
          path="/noticias/:articleId"
          element={<ArticlePage user={user} />}
        />
        <Route path="/noticias" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<AuthScreen>('welcome')
  const [adminMode, setAdminMode] = useState<AdminView>(() => readAdminView())

  function openPortal() {
    writeAdminView('portal')
    setAdminMode('portal')
  }

  function openAdmin() {
    writeAdminView('admin')
    setAdminMode('admin')
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        writeAdminView('admin')
        setAdminMode('admin')
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
      const adminProfile = {
        ...profile,
        adminPermission: profile.adminPermission ?? 'full',
        isPrincipal: profile.isPrincipal ?? profile.email === 'admin@an.com',
      }

      if (adminMode === 'portal') {
        return (
          <BrowserRouter>
            <PortalRoutes user={user} onBackToAdmin={openAdmin} />
          </BrowserRouter>
        )
      }

      return (
        <AdminApp
          user={user}
          profile={adminProfile}
          onOpenPortal={openPortal}
        />
      )
    }
    return (
      <BrowserRouter>
        <PortalRoutes user={user} />
      </BrowserRouter>
    )
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
