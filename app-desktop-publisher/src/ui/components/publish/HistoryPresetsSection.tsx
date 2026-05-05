import { useMemo } from 'react'
import { KnittoTable, type IHeader } from '../ui/knitto-table'

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

type HistoryPresetsSectionProps = {
  records: PublishHistoryRecord[]
  emptyMessage: string
}

const HistoryPresetsSection = ({ records, emptyMessage }: HistoryPresetsSectionProps) => {
  const headers = useMemo((): IHeader<PublishHistoryRecord>[] => {
    return [
      {
        key: 'presetName',
        caption: 'Nama Preset',
        width: 180,
        renderCell: (item) => (
          <span className="font-medium text-neutral-800">{item.presetName}</span>
        ),
      },
      {
        key: 'sources',
        caption: 'Source',
        width: 300,
        renderCell: (item) => <PathLineList lines={item.sources} />,
      },
      {
        key: 'destination',
        caption: 'Destination',
        width: 240,
        renderCell: (item) => <PathLineList lines={[item.destination]} />,
      },
      {
        key: 'publishedBy',
        caption: 'Di-publish Oleh',
        width: 200,
        renderCell: (item) => (
          <span className="text-[11px] text-neutral-700">{item.publishedBy}</span>
        ),
      },
      {
        key: 'publishedAt',
        caption: 'Waktu Publish',
        width: 200,
        renderCell: (item) => (
          <span className="text-[11px] text-neutral-700">
            {new Date(item.publishedAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
    ]
  }, [])

  return (
    <section className="pt-4 h-full">
      {records.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div className="h-full border border-neutral-200">
          <KnittoTable<PublishHistoryRecord>
            rowKey="id"
            data={records}
            headers={headers}
            headerMode="single"
            headerHeight={32}
            rowHeight={40}
            useDynamicRowHeight={true}
            enableColumnVirtualization={false}
            useRegularTable={false}
            classNameOuterTable="border-0"
          />
        </div>
      )}
    </section>
  )
}

export default HistoryPresetsSection
