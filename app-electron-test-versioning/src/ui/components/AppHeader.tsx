import { type ReactElement } from 'react'

type AppHeaderProps = {
  appVersion: string
  showSidebar: boolean
  onToggleSidebar: () => void
}

export const AppHeader = ({
  appVersion,
  showSidebar,
  onToggleSidebar,
}: AppHeaderProps): ReactElement => (
  <div className="mb-10 border-b border-neutral-200 pb-8">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Auto Update App [TEST]
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Electron.</h1>
      </div>

      <div>
        <button
          className="bg-neutral-100 py-0.5 px-1.5 rounded-md border border-neutral-200 text-sm cursor-pointer"
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={showSidebar}
        >
          Updates Info
        </button>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        Versi terpasang
      </span>
      <span className="rounded-md bg-orange-200 px-1.5 py-0.5 font-mono text-sm text-neutral-800">
        {appVersion}
      </span>
    </div>
  </div>
)
