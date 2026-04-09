import { type ReactElement } from 'react'

import { DownloadProgressBar } from './DownloadProgressBar'

type UpdateNotificationCardProps = {
  offerVersion: string | null
  lastEvent: UpdateEvent | null
  downloadActive: boolean
  smoothPercent: number
  onDismiss: () => void
  onStartDownload: () => void
  onQuitAndInstall: () => void
}

export const UpdateNotificationCard = ({
  offerVersion,
  lastEvent,
  downloadActive,
  smoothPercent,
  onDismiss,
  onStartDownload,
  onQuitAndInstall,
}: UpdateNotificationCardProps): ReactElement => (
  <aside
    className="fixed bottom-6 right-6 z-50 w-[min(calc(100vw-3rem),20.5rem)] rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl shadow-neutral-900/10 ring-1 ring-black/4"
    role="dialog"
    aria-live="polite"
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Notifikasi
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight text-neutral-900">
          Pembaruan tersedia
        </p>
        {offerVersion ? (
          <span className="shrink-0 rounded-md border border-neutral-900/10 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-800">
            v{offerVersion}
          </span>
        ) : null}
      </div>
      <button type="button" className="btn-ghost" onClick={onDismiss}>
        Tutup
      </button>
    </div>

    {lastEvent?.type === 'available' ? (
      <p className="mb-5 text-sm leading-relaxed text-neutral-600">
        Unduh dan pasang pembaruan sekarang?
      </p>
    ) : null}

    {downloadActive ? (
      <>
        <p className="mb-3 text-sm text-neutral-600">
          {lastEvent?.type === 'progress' ? (
            <>
              Mengunduh…{' '}
              <span className="font-medium tabular-nums text-neutral-900">
                {Math.round(smoothPercent)}%
              </span>
            </>
          ) : (
            'Mempersiapkan unduhan…'
          )}
        </p>
        <DownloadProgressBar
          indeterminate={lastEvent?.type !== 'progress'}
          percent={smoothPercent}
        />
      </>
    ) : null}

    {lastEvent?.type === 'downloaded' ? (
      <p className="mb-5 text-sm leading-relaxed text-neutral-600">
        Unduhan selesai. Mulai ulang untuk memasang.
      </p>
    ) : null}

    <div className="flex flex-wrap gap-2">
      {lastEvent?.type === 'available' ? (
        <button
          type="button"
          className="btn-primary"
          disabled={downloadActive}
          onClick={onStartDownload}
        >
          Update
        </button>
      ) : null}

      {lastEvent?.type === 'downloaded' ? (
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={onQuitAndInstall}>
          Pasang &amp; mulai ulang
        </button>
      ) : null}
    </div>
  </aside>
)
