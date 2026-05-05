import { useMemo, useState } from 'react'
import icRocket from '../../assets/ic-rocket.svg'
import { KnittoTable, type IHeader } from '../ui/knitto-table'
import clsx from 'clsx'

const PathLineList = ({ lines, className }: { lines: string[]; className?: string }) => (
  <ul className={`space-y-1 list-disc pl-4 marker:text-neutral-400 ${className ?? ''}`}>
    {lines.map((line, i) => (
      <li key={`${line}-${i}`} className="min-w-0">
        <span
          className="block max-w-full font-mono text-[11px] leading-snug text-neutral-800"
          title={line}
        >
          {line}
        </span>
      </li>
    ))}
  </ul>
)

type PresetRowData = PublishPreset & {
  isProgressRow?: boolean
}

type SavedPresetsSectionProps = {
  presets: PublishPreset[]
  copyingPresetId: number | null
  progress: number
  currentFile: string
  totalFiles: number
  copying: boolean
  canDelete: boolean
  canPublish: boolean
  canEdit: boolean
  emptyMessage: string
  onDelete: (preset: PublishPreset) => void
  onPublish: (preset: PublishPreset) => void
  onEdit: (preset: PublishPreset) => void
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
  canEdit,
  emptyMessage,
  onDelete,
  onPublish,
  onEdit,
}: SavedPresetsSectionProps) => {
  const [deleteConfirmPreset, setDeleteConfirmPreset] = useState<PublishPreset | null>(null)

  const tableData = useMemo(() => {
    const rows: PresetRowData[] = []

    presets.forEach((preset) => {
      rows.push(preset)

      if (copyingPresetId === preset.id) {
        rows.push({
          ...preset,
          isProgressRow: true,
        })
      }
    })

    return rows
  }, [presets, copyingPresetId])

  const headers = useMemo((): IHeader<PresetRowData>[] => {
    return [
      {
        key: 'sources',
        caption: 'Source',
        width: 300,
        hideFilter: { sort: true, filterSelection: true },
        renderCell: (item) => (!item.isProgressRow ? <PathLineList lines={item.sources} /> : null),
      },
      {
        key: 'destination',
        caption: 'Destination',
        width: 240,
        hideFilter: { sort: true, filterSelection: true },
        renderCell: (item) =>
          !item.isProgressRow ? <PathLineList lines={[item.destination]} /> : null,
      },
      {
        key: 'name',
        caption: 'Nama',
        width: 180,
        renderCell: (item) =>
          !item.isProgressRow ? (
            <span className="font-medium text-neutral-800">{item.name}</span>
          ) : null,
      },
      {
        key: 'sourceExeVersion',
        caption: 'Versi',
        width: 140,
        renderCell: (item) =>
          !item.isProgressRow ? (
            <span className="font-mono text-[11px] text-neutral-700">
              {item.sourceExeVersion ?? '—'}
            </span>
          ) : null,
      },
      {
        key: 'createdBy',
        caption: 'Creator',
        width: 160,
        renderCell: (item) =>
          !item.isProgressRow ? (
            <span className="text-[11px] text-neutral-700">{item.createdBy}</span>
          ) : null,
      },
      {
        key: 'createdAt',
        caption: 'Dibuat',
        width: 160,
        renderCell: (item) =>
          !item.isProgressRow ? (
            <span className="text-[11px] text-neutral-700">
              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })}
            </span>
          ) : null,
      },
      {
        key: 'isPublished',
        caption: 'Status',
        width: 160,
        renderCell: (item) =>
          !item.isProgressRow ? (
            <div
              className={clsx('text-[11px] font-medium w-max px-2 py-0.5 border rounded-md', {
                'text-green-600 bg-green-50 border-green-600': item.isPublished,
                'text-neutral-400 bg-neutral-100 border-neutral-400': !item.isPublished,
              })}
            >
              {item.isPublished ? 'Published' : 'Draft'}
            </div>
          ) : null,
      },
      {
        key: 'action',
        caption: 'Action',
        width: 100,
        freeze: 'right',
        hideFilter: { sort: true, search: true, filterSelection: true, filterAdvance: true },
        renderCell: (item) => {
          if (item.isProgressRow) return null

          return (
            <div className="flex flex-row gap-1">
              {canEdit ? (
                <button
                  type="button"
                  className="cursor-pointer border border-neutral-900 bg-white px-2 w-max py-1 text-[10px] font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={copying || item.isPublished}
                  onClick={() => void onEdit(item)}
                >
                  Edit
                </button>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="cursor-pointer border border-neutral-900 bg-white px-2 w-max py-1 text-[10px] font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={copying || item.isPublished}
                  onClick={() => setDeleteConfirmPreset(item)}
                >
                  Hapus
                </button>
              ) : null}
              {canPublish ? (
                <button
                  type="button"
                  title={item.isPublished ? 'Preset sudah di-publish' : 'Publish preset'}
                  className="inline-flex w-max cursor-pointer items-center gap-1 border border-neutral-900 bg-black px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={copying || item.isPublished}
                  onClick={() => void onPublish(item)}
                >
                  <img
                    src={icRocket}
                    alt=""
                    className="size-4 shrink-0 brightness-0 invert"
                    aria-hidden
                  />
                  Publish
                </button>
              ) : null}
              {!canDelete && !canPublish && !canEdit ? (
                <span className="text-[11px] text-neutral-400">—</span>
              ) : null}
            </div>
          )
        },
      },
    ]
  }, [canDelete, canPublish, canEdit, copying, onPublish, onEdit])

  const classNameCell = (item: PresetRowData) => {
    if (item.isProgressRow) {
      return 'bg-neutral-900/3 !px-3 !py-3'
    }
    return 'hover:bg-neutral-50/80'
  }

  return (
    <section className="pt-4 h-full">
      {deleteConfirmPreset ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onClick={() => setDeleteConfirmPreset(null)}
        >
          <div
            className="w-full max-w-md border border-neutral-200 bg-white p-5 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-preset-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-preset-confirm-title" className="text-sm font-semibold text-neutral-900">
              Hapus preset?
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Preset{' '}
              <span className="font-medium text-neutral-800">{deleteConfirmPreset.name}</span> akan
              dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="cursor-pointer border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                onClick={() => setDeleteConfirmPreset(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="cursor-pointer border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                onClick={() => {
                  const preset = deleteConfirmPreset
                  setDeleteConfirmPreset(null)
                  void onDelete(preset)
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {presets.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div className="h-full border border-neutral-200">
          <KnittoTable<PresetRowData>
            rowKey="id"
            data={tableData}
            headers={headers}
            headerMode="single"
            headerHeight={32}
            rowHeight={40}
            useDynamicRowHeight={true}
            enableColumnVirtualization={false}
            useRegularTable={false}
            classNameOuterTable="border-0"
            classNameCell={classNameCell}
            renderExpandedRow={(item) => {
              if (!item.isProgressRow) return null

              return (
                <div className="w-full px-3 py-3">
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
                </div>
              )
            }}
          />
        </div>
      )}
    </section>
  )
}

export default SavedPresetsSection
