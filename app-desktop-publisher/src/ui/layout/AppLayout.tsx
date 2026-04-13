import type { ReactNode } from 'react'

import { useAuth } from '../features/auth/AuthContext.tsx'
import { Facehash } from 'facehash'

const roleLabel = (role: AppRole): string => {
  if (role === 'developer') return 'Developer'
  return 'Implementor'
}

type AppLayoutProps = {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm supports-backdrop-filter:bg-white/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-x-2">
            <Facehash
              enableBlink
              intensity3d="dramatic"
              variant="gradient"
              name={user.username.toUpperCase()}
              size={28}
              colors={['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']}
            />
            <div className="min-w-0 text-xs text-neutral-500">
              <span className="font-medium text-neutral-800">{user.username}</span>
              <span className="mx-1.5 text-neutral-300">·</span>
              <span>{roleLabel(user.role)}</span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
            onClick={() => void logout()}
          >
            Keluar
          </button>
        </div>
      </header>
      {children}
    </div>
  )
}

export default AppLayout
