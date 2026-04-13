import { Fragment } from 'react'

const PathLineList = ({ lines, className }: { lines: string[]; className?: string }) => (
  <ul className={`space-y-0.5 ${className ?? ''}`}>
    {lines.map((line, i) => (
      <li key={`${line}-${i}`} className="min-w-0">
        <span
          className="block max-w-full truncate font-mono text-[11px] leading-snug text-neutral-800"
          title={line}
        >
          {line}
        </span>
      </li>
    ))}
  </ul>
)

const tableCell = 'border-b border-neutral-200 px-3 py-2.5 text-left text-xs align-top'
const thCell =
  'border-b border-neutral-300 bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600'

type SavedPresetsSectionProps = {
  presets: PublishPreset[]
  copyingPresetId: number | null
  progress: number
  currentFile: string
  totalFiles: number
  copying: boolean
  canDelete: boolean
  canPublish: boolean
  emptyMessage: string
  onDelete: (preset: PublishPreset) => void
  onPublish: (preset: PublishPreset) => void
}

const SavedPresetsSection = ({
  presets,
  copyingPresetId,
  progress,
  currentFile,
  totalFiles,
  copying,
  canDelete,
  canPublish,
  emptyMessage,
  onDelete,
  onPublish,
}: SavedPresetsSectionProps) => (
  <section className="border-t border-neutral-200 pt-8">
    <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-neutral-500">
      Daftar Preset
    </h2>

    {presets.length === 0 ? (
      <p className="text-sm text-neutral-500">{emptyMessage}</p>
    ) : (
      <div className="overflow-x-auto rounded border border-neutral-200">
        <table className="w-full min-w-[720px] border-collapse text-neutral-900">
          <thead>
            <tr>
              <th className={thCell}>Source</th>
              <th className={thCell}>Dest</th>
              <th className={thCell}>Nama</th>
              <th className={thCell}>Versi</th>
              <th className={`${thCell} w-[140px]`}>Action</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((preset) => {
              const versionText = preset.sourceExeVersion ?? '—'
              return (
                <Fragment key={preset.id}>
                  <tr className="bg-white hover:bg-neutral-50/80">
                    <td className={`${tableCell} max-w-[220px] overflow-hidden`}>
                      <PathLineList lines={preset.sources} />
                    </td>
                    <td className={`${tableCell} max-w-[200px] overflow-hidden`}>
                      <PathLineList lines={[preset.destination]} />
                    </td>
                    <td className={`${tableCell} font-medium text-neutral-800`}>{preset.name}</td>
                    <td className={`${tableCell} font-mono text-[11px] text-neutral-700`}>
                      {versionText}
                    </td>
                    <td className={`${tableCell}`}>
                      <div className="flex flex-col gap-1.5">
                        {canDelete ? (
                          <button
                            type="button"
                            className="rounded border border-neutral-900 bg-white px-3! w-max py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={copying}
                            onClick={() => void onDelete(preset)}
                          >
                            Hapus
                          </button>
                        ) : null}
                        {canPublish ? (
                          <button
                            type="button"
                            className="rounded border border-neutral-900 bg-black px-3! w-max py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={copying}
                            onClick={() => void onPublish(preset)}
                          >
                            Publish
                          </button>
                        ) : null}
                        {!canDelete && !canPublish ? (
                          <span className="text-[11px] text-neutral-400">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {copyingPresetId === preset.id ? (
                    <tr className="bg-neutral-900/3">
                      <td className="border-b border-neutral-200 px-3 py-3" colSpan={5}>
                        <p className="text-center text-xs font-medium text-neutral-800">Menyalin</p>
                        <div className="mx-auto mt-2 h-1 max-w-md bg-neutral-200">
                          <div
                            className="h-1 bg-neutral-900 transition-[width] duration-200"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-[11px] text-neutral-500">
                          {progress}%{totalFiles > 0 ? ` · ${totalFiles} file` : ''}
                        </p>
                        {currentFile ? (
                          <p className="mt-1 truncate text-center font-mono text-[11px] text-neutral-600">
                            {currentFile}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
)

export default SavedPresetsSection
