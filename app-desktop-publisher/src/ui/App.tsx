import LoginScreen from './features/auth/LoginScreen.tsx'
import { AuthProvider, useAuth } from './features/auth/AuthContext.tsx'
import PublishApp from './features/publish/PublishApp.tsx'
import AppLayout from './layout/AppLayout.tsx'

const AppGate = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
        Memuat…
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <AppLayout>
      <PublishApp />
    </AppLayout>
  )
}

const App = () => (
  <AuthProvider>
    <AppGate />
  </AuthProvider>
)

export default App
