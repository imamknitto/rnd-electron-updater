import { type ReactElement } from 'react'

type DownloadProgressBarProps = {
  indeterminate: boolean
  percent: number
}

export const DownloadProgressBar = ({
  indeterminate,
  percent,
}: DownloadProgressBarProps): ReactElement => (
  <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full border border-neutral-900/15 bg-neutral-100">
    {indeterminate ? (
      <div className="update-dl-indeterminate h-full w-2/5 rounded-full bg-neutral-900/75" />
    ) : (
      <div className="h-full rounded-full bg-neutral-900" style={{ width: `${percent}%` }} />
    )}
  </div>
)
