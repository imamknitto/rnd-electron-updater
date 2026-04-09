import clsx from 'clsx'
import { type RefObject, type ReactElement } from 'react'

import { DownloadProgressBar } from './DownloadProgressBar'
import { statusText } from './updateHelpers'

type UpdateSidebarProps = {
  sidebarRef: RefObject<HTMLDivElement | null>
  showSidebar: boolean
  lastEvent: UpdateEvent | null
  downloadActive: boolean
  smoothPercent: number
  offerVersion: string | null
  canInstall: boolean
  onCheckForUpdates: () => void
  onStartDownload: () => void
  onQuitAndInstall: () => void
}

export const UpdateSidebar = ({
  sidebarRef,
  showSidebar,
  lastEvent,
  downloadActive,
  smoothPercent,
  offerVersion,
  canInstall,
  onCheckForUpdates,
  onStartDownload,
  onQuitAndInstall,
}: UpdateSidebarProps): ReactElement => (
  <aside
    ref={sidebarRef}
    className={clsx(
      'z-20 fixed h-full bg-neutral-50 border border-neutral-200 right-0 inset-y-0 w-2/5 transition-transform duration-300 ease-in-out',
      showSidebar ? 'translate-x-0' : 'translate-x-full',
    )}
  >
    <div className="size-full p-2.5">
      <h5 className="mb-2.5">Updates Info</h5>

      <div className="space-y-2.5">
        <div className="min-h-13 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3">
          <p className="text-sm leading-relaxed text-neutral-600">
            {downloadActive && lastEvent?.type !== 'progress'
              ? 'Mempersiapkan unduhan…'
              : downloadActive && lastEvent?.type === 'progress'
              ? `Mengunduh ${Math.round(smoothPercent)}%`
              : statusText(lastEvent)}
          </p>
        </div>

        {downloadActive ? (
          <DownloadProgressBar
            indeterminate={lastEvent?.type !== 'progress'}
            percent={smoothPercent}
          />
        ) : null}

        {!offerVersion && (
          <button type="button" className="btn-primary w-full" onClick={onCheckForUpdates}>
            Cek pembaruan
          </button>
        )}

        {lastEvent?.type === 'available' && (
          <button
            type="button"
            className="btn-primary"
            disabled={downloadActive}
            onClick={onStartDownload}
          >
            Update
          </button>
        )}

        {offerVersion && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="btn-primary w-full"
              disabled={!canInstall}
              onClick={onQuitAndInstall}
            >
              Pasang & mulai ulang
            </button>
          </div>
        )}
      </div>
    </div>
  </aside>
)
