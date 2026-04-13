export type AppRole = 'developer' | 'implementor'

export type AuthUser = {
  username: string
  role: AppRole
}

let currentUser: AuthUser | null = null

/**
 * Akun dummy untuk prototype. Nanti diganti validasi lewat API terpisah.
 * Username / password disimpan di sisi main saja.
 */
const DUMMY_ACCOUNTS: Record<string, { password: string; role: AppRole }> = {
  developer: { password: 'dev123', role: 'developer' },
  implementor: { password: 'imp123', role: 'implementor' },
}

export type LoginResult = { success: true; user: AuthUser } | { success: false; error: string }

export const loginWithDummyAccounts = (username: string, password: string): LoginResult => {
  const trimmed = username.trim()
  const entry = DUMMY_ACCOUNTS[trimmed]
  if (!entry || entry.password !== password) {
    return { success: false, error: 'Username atau password salah.' }
  }
  const user: AuthUser = { username: trimmed, role: entry.role }
  currentUser = user
  return { success: true, user }
}

export const logoutSession = (): void => {
  currentUser = null
}

export const getSession = (): AuthUser | null => currentUser

export const isDeveloper = (): boolean => currentUser?.role === 'developer'

export const isLoggedIn = (): boolean => currentUser !== null

export const authErrorNotLoggedIn = 'Silakan masuk terlebih dahulu.'
