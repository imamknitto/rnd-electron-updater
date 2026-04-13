import { useState, type FormEvent } from 'react'

import { useAuth } from './AuthContext.tsx'

const LoginScreen = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(username, password)
      if (!result.success) {
        setError(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex max-w-sm flex-col px-5 py-16">
        <h1 className="text-lg font-semibold tracking-tight">Publisher</h1>
        <p className="mt-1 text-sm text-neutral-500">Masuk untuk melanjutkan.</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full bg-neutral-900 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            disabled={submitting || !username.trim() || !password}
          >
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
          <p className="font-medium text-neutral-600">Akun dummy (prototype)</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Developer — <code className="font-mono text-neutral-700">developer</code> /{' '}
              <code className="font-mono text-neutral-700">dev123</code>
            </li>
            <li>
              Implementor — <code className="font-mono text-neutral-700">implementor</code> /{' '}
              <code className="font-mono text-neutral-700">imp123</code>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default LoginScreen
