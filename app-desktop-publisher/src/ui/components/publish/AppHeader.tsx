import clsx from 'clsx'

const AppHeader = ({ isDeveloper }: { isDeveloper: boolean }) => {
  const title = isDeveloper
    ? 'Buat preset, copy hasil build ke folder tujuan'
    : 'Publish app dari daftar preset'

  return (
    <header
      className={clsx(
        'mb-8 border-b border-neutral-200 pb-6',
        !isDeveloper && 'border-none pb-0 mb-0!',
      )}
    >
      <h1 className="text-lg font-bold uppercase leading-loose">App Electron Publisher.</h1>
      <p className="mt-1 text-sm text-neutral-500">{title}</p>
    </header>
  )
}
export default AppHeader
