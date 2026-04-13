import { useState } from 'react'
import { fieldBtnClass, pathBoxClass, primaryBtnClass } from '../../features/publish/publishUi.ts'
import clsx from 'clsx'

type PresetFormSectionProps = {
  name: string
  setName: (value: string) => void
  sourcePaths: string[]
  destPath: string | null
  saveError: string
  savingPreset: boolean
  sourcesReady: boolean
  copying: boolean
  appendSourceFolders: () => Promise<void>
  appendSourceFiles: () => Promise<void>
  clearSourcePaths: () => void
  selectDestination: () => Promise<void>
  savePreset: () => Promise<void>
}

const PresetFormSection = ({
  name,
  setName,
  sourcePaths,
  destPath,
  saveError,
  savingPreset,
  sourcesReady,
  copying,
  appendSourceFolders,
  appendSourceFiles,
  clearSourcePaths,
  selectDestination,
  savePreset,
}: PresetFormSectionProps) => {
  const [isHidden, setIsHidden] = useState(false)

  return (
    <div className="max-w-xl mx-auto">
      <div className={clsx('flex justify-end items-center', isHidden && 'justify-between!')}>
        {isHidden && <p className="uppercase font-bold font-mono">Form Preset</p>}
        <button className="uppercase font-bold font-mono" onClick={() => setIsHidden(!isHidden)}>
          {isHidden ? 'Show' : 'Hide'}
        </button>
      </div>

      <div
        className={clsx(
          'transition-all duration-300',
          isHidden ? 'h-0 opacity-0 hidden' : 'h-auto opacity-100 visible',
        )}
      >
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Nama Preset
          </h2>
          <input
            type="text"
            required
            className="w-full mb-3 border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            placeholder="App Name v0.1.1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Sumber
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            Pilih folder atau file (boleh beberapa). Setelah daftar muncul, gunakan tombol tambah di
            bawah untuk menambah sumber lagi.
          </p>

          {sourcePaths.length === 0 ? (
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={fieldBtnClass}
                disabled={copying}
                onClick={() => void appendSourceFolders()}
              >
                Pilih folder
              </button>
              <button
                type="button"
                className={fieldBtnClass}
                disabled={copying}
                onClick={() => void appendSourceFiles()}
              >
                Pilih file
              </button>
            </div>
          ) : (
            <div className="mt-1">
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                <span>{sourcePaths.length} sumber</span>
                <button
                  type="button"
                  className="underline decoration-neutral-400 underline-offset-2 disabled:opacity-40"
                  disabled={copying}
                  onClick={clearSourcePaths}
                >
                  Kosongkan
                </button>
              </div>
              <ul className={`${pathBoxClass} max-h-32 space-y-1 overflow-y-auto p-2`}>
                {sourcePaths.map((p) => (
                  <li key={p} className="truncate">
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={fieldBtnClass}
                  disabled={copying}
                  onClick={() => void appendSourceFolders()}
                >
                  Tambah folder
                </button>
                <button
                  type="button"
                  className={fieldBtnClass}
                  disabled={copying}
                  onClick={() => void appendSourceFiles()}
                >
                  Tambah file
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tujuan
          </h2>
          <button
            type="button"
            className={fieldBtnClass}
            disabled={copying}
            onClick={() => void selectDestination()}
          >
            Pilih folder tujuan
          </button>
          {destPath ? <p className={pathBoxClass}>{destPath}</p> : null}
        </section>

        {saveError ? (
          <div className="mb-6 border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
            {saveError}
          </div>
        ) : null}

        <button
          type="button"
          className={`${primaryBtnClass} mb-10`}
          disabled={!sourcesReady || !destPath || !name || copying || savingPreset}
          onClick={() => void savePreset()}
        >
          {savingPreset ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

export default PresetFormSection
