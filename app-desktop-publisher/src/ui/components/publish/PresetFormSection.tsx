import { fieldBtnClass, pathBoxClass, primaryBtnClass } from '../../features/publish/publishUi.ts'

type PresetFormSectionProps = {
  name: string
  setName: (value: string) => void
  sourcePaths: string[]
  destPath: string | null
  saveError: string
  savingPreset: boolean
  sourcesReady: boolean
  copying: boolean
  isEditing: boolean
  appendSourceFolders: () => Promise<void>
  appendSourceFiles: () => Promise<void>
  clearSourcePaths: () => void
  selectDestination: () => Promise<void>
  resetForm: () => void
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
  isEditing,
  appendSourceFolders,
  appendSourceFiles,
  clearSourcePaths,
  selectDestination,
  resetForm,
  savePreset,
}: PresetFormSectionProps) => {
  return (
    <div className="max-w-xl mx-auto border border-neutral-200 px-2.5 py-6 h-full overflow-auto scrollbar-thin">
      {isEditing ? (
        <p className="mb-4 border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
          Mengedit preset tersimpan. Ubah field di bawah lalu klik Simpan perubahan, atau Reset untuk
          mengosongkan form.
        </p>
      ) : null}
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
            <ul className={`${pathBoxClass} max-h-32 space-y-1 overflow-y-auto p-2 scrollbar-thin`}>
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button
          type="button"
          className="w-full cursor-pointer border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-1"
          disabled={copying || savingPreset}
          onClick={resetForm}
        >
          Reset
        </button>
        <div className="w-full sm:flex-1">
          <button
            type="button"
            className={primaryBtnClass}
            disabled={!sourcesReady || !destPath || !name || copying || savingPreset}
            onClick={() => void savePreset()}
          >
            {savingPreset ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PresetFormSection
