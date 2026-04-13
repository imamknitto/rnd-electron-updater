/* eslint-disable react-refresh/only-export-components -- context provider + useAuth hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  isDeveloper: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void window.electron.getAuthState().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const result = await window.electron.login(username, password)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }, [])

  const logout = useCallback(async () => {
    await window.electron.logout()
    setUser(null)
  }, [])

  const isDeveloper = user?.role === 'developer'

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      login,
      logout,
      isDeveloper: Boolean(isDeveloper),
    }),
    [user, loading, login, logout, isDeveloper],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
