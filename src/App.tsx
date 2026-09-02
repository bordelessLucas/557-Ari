import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui'
import Dashboard from '@/pages/Dashboard'
import Welcome from '@/pages/Welcome'
import { auth } from '@/lib/firebase'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
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

  return user ? <Dashboard user={user} /> : <Welcome />
}

export default App
