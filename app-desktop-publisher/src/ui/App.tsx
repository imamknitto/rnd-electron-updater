import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type SourceMode = 'folder' | 'files'

const App = () => {
  const [name, setName] = useState('')
  const [sourceMode, setSourceMode] = useState<SourceMode>('folder')
  const [sourceFolder, setSourceFolder] = useState<string | null>(null)
  const [sourceFiles, setSourceFiles] = useState<string[]>([])
  const [destPath, setDestPath] = useState<string | null>(null)
  const [presets, setPresets] = useState<PublishPreset[]>([])
  const [saveError, setSaveError] = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState('')
  const [totalFiles, setTotalFiles] = useState(0)
  const [copyingPresetId, setCopyingPresetId] = useState<number | null>(null)

  const copying = copyingPresetId !== null
  const sourcesReady = sourceMode === 'folder' ? Boolean(sourceFolder) : sourceFiles.length > 0

  const refreshPresets = useCallback(async () => {
    const rows = await window.electron.listPublishPresets()
    setPresets(rows)
  }, [])

  useEffect(() => {
    void refreshPresets()
  }, [refreshPresets])

  useEffect(() => {
    const removeProgress = window.electron.onCopyProgress((payload) => {
      setProgress(payload.percent)
      setCurrentFile(payload.fileName)
    })
    const removeStart = window.electron.onCopyStart((total) => {
      setTotalFiles(total)
    })
    return () => {
      removeProgress()
      removeStart()
    }
  }, [])

  const selectSourceFolder = async () => {
    const p = await window.electron.selectSourceFolder()
    if (p) setSourceFolder(p)
  }

  const selectSourceFiles = async () => {
    const paths = await window.electron.selectSourceFiles()
    if (paths?.length) setSourceFiles(paths)
  }

  const selectDestination = async () => {
    const p = await window.electron.selectDestinationFolder()
    if (p) setDestPath(p)
  }

  const switchSourceMode = (mode: SourceMode) => {
    setSourceMode(mode)
    setSourceFolder(null)
    setSourceFiles([])
  }

  const getCurrentSources = (): string[] => {
    return sourceMode === 'folder' ? (sourceFolder ? [sourceFolder] : []) : sourceFiles
  }

  const savePreset = async () => {
    const sources = getCurrentSources()

    if (sources.length === 0 || !destPath) return

    setSaveError('')
    setSavingPreset(true)
    console.log({ name, sourceMode, sources, destPath })

    try {
      const result = await window.electron.savePublishPreset(name, sourceMode, sources, destPath)
      if (!result.success) return setSaveError(result.error)
      // reset form
      setName('')
      setSourceMode('folder')
      setSourceFolder(null)
      setSourceFiles([])
      setDestPath(null)

      await refreshPresets()
      toast.success('Preset berhasil disimpan.')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Gagal menyimpan.')
    } finally {
      setSavingPreset(false)
    }
  }

  const publishPreset = async (preset: PublishPreset) => {
    if (preset.sources.length === 0) return

    setCopyingPresetId(preset.id)
    setProgress(0)
    setCurrentFile('')
    setTotalFiles(0)

    try {
      const result = await window.electron.startCopyProcess(preset.sources, preset.destination)
      if (!result.success) {
        alert(result.error)
      } else {
        toast.success('Selesai. Data sudah di folder tujuan.')
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyalin.')
    } finally {
      setCopyingPresetId(null)
      setProgress(0)
      setCurrentFile('')
      setTotalFiles(0)
    }
  }

  const deletePreset = async (preset: PublishPreset) => {
    const result = await window.electron.deletePublishPreset(preset.id)
    if (!result.success) return setSaveError(result.error)
    await refreshPresets()
  }

  const modeBtn = (active: boolean, edge: 'left' | 'right') =>
    [
      'flex-1 px-3 py-2 text-sm font-medium transition-colors',
      edge === 'left' ? 'border-r border-neutral-300' : '',
      'disabled:cursor-not-allowed disabled:opacity-40',
      active ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-100',
    ]
      .filter(Boolean)
      .join(' ')

  const fieldBtn =
    'w-full border border-neutral-900 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

  const pathBox =
    'mt-3 border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs leading-relaxed text-neutral-800 break-all'

  const primaryBtn =
    'w-full bg-neutral-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500'

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto max-w-lg px-5 py-10">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <h1 className="text-lg font-semibold tracking-tight">Publisher</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Simpan pasangan sumber–tujuan, lalu publish dari daftar.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Nama
          </h2>
          <input
            type="text"
            required
            className="w-full mb-3 border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Sumber
          </h2>
          <div className="mb-3 flex overflow-hidden border border-neutral-300">
            <button
              type="button"
              className={modeBtn(sourceMode === 'folder', 'left')}
              disabled={copying}
              onClick={() => switchSourceMode('folder')}
            >
              Folder
            </button>
            <button
              type="button"
              className={modeBtn(sourceMode === 'files', 'right')}
              disabled={copying}
              onClick={() => switchSourceMode('files')}
            >
              File
            </button>
          </div>

          {sourceMode === 'folder' ? (
            <>
              <button
                type="button"
                className={fieldBtn}
                disabled={copying}
                onClick={selectSourceFolder}
              >
                Pilih folder
              </button>
              {sourceFolder ? <p className={pathBox}>{sourceFolder}</p> : null}
            </>
          ) : (
            <>
              <button
                type="button"
                className={fieldBtn}
                disabled={copying}
                onClick={selectSourceFiles}
              >
                Pilih file
              </button>
              {sourceFiles.length > 0 ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
                    <span>{sourceFiles.length} file</span>
                    <button
                      type="button"
                      className="underline decoration-neutral-400 underline-offset-2 disabled:opacity-40"
                      disabled={copying}
                      onClick={() => setSourceFiles([])}
                    >
                      Kosongkan
                    </button>
                  </div>
                  <ul className={`${pathBox} max-h-32 space-y-1 overflow-y-auto p-2`}>
                    {sourceFiles.map((p) => (
                      <li key={p} className="truncate">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tujuan
          </h2>
          <button type="button" className={fieldBtn} disabled={copying} onClick={selectDestination}>
            Pilih folder tujuan
          </button>
          {destPath ? <p className={pathBox}>{destPath}</p> : null}
        </section>

        {saveError ? (
          <div className="mb-6 border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
            {saveError}
          </div>
        ) : null}

        <button
          type="button"
          className={`${primaryBtn} mb-10`}
          disabled={!sourcesReady || !destPath || !name || copying || savingPreset}
          onClick={() => void savePreset()}
        >
          {savingPreset ? 'Menyimpan...' : 'Simpan'}
        </button>

        <section className="border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tersimpan
          </h2>

          {presets.length === 0 ? (
            <p className="text-sm text-neutral-500">Belum ada preset. Isi form lalu klik Simpan.</p>
          ) : (
            <ul className="space-y-4">
              {presets.map((preset) => (
                <li
                  key={preset.id}
                  className="border border-neutral-200 bg-neutral-50/50 p-4 relative"
                >
                  <div className="mb-2 flex justify-between gap-2 border-b border-neutral-200 pb-2 gap-x-2.5">
                    <span className="text-xs font-bold tracking-wide text-neutral-500 uppercase">
                      {preset.name}
                    </span>
                    <span className="text-xs text-neutral-400 shrink-0">
                      {new Date(preset.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-wide text-neutral-500">
                      Source {''}
                      {preset.sourceMode === 'folder' ? 'Folder' : `${preset.sources.length} File`}:
                    </span>
                  </div>
                  <div className="pb-2 flex flex-col gap-y-1.5 pl-3.5">
                    {preset.sourceMode === 'folder' ? (
                      <i
                        title={preset.sources[0]}
                        className="font-mono text-xs text-neutral-600 break-all line-clamp-1"
                      >
                        {preset.sources[0]}
                      </i>
                    ) : (
                      preset.sources.map((source) => (
                        <i
                          key={source}
                          title={source}
                          className="font-mono text-xs text-neutral-600 break-all line-clamp-1"
                        >
                          {source}
                        </i>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col pb-3 gap-y-1.5">
                    <p className="font-mono font-bold text-xs text-neutral-600 break-all">
                      Destination:
                    </p>
                    <i
                      title={preset.destination}
                      className="font-mono text-xs text-neutral-600 break-all line-clamp-1 ml-3.5"
                    >
                      {preset.destination}
                    </i>
                  </div>
                  <div className="flex gap-x-2.5">
                    <button
                      type="button"
                      className="w-full cursor-pointer border border-neutral-900 bg-white py-2.5 text-sm font-medium text-neutral-900 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={copying}
                      onClick={() => void deletePreset(preset)}
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      className="w-full cursor-pointer border border-neutral-900 bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={copying}
                      onClick={() => void publishPreset(preset)}
                    >
                      Publish App
                    </button>
                  </div>

                  {copyingPresetId === preset.id ? (
                    <div className="absolute inset-0 z-10 flex flex-col justify-center gap-3 bg-black/60 px-4 py-6">
                      <p className="text-center text-sm font-medium text-white">Menyalin</p>
                      <div className="h-1 w-full bg-white/20">
                        <div
                          className="h-1 bg-white transition-[width] duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-center text-xs text-white/80">
                        {progress}%{totalFiles > 0 ? ` · ${totalFiles} file` : ''}
                      </p>
                      {currentFile ? (
                        <p className="truncate text-center font-mono text-xs text-white/90">
                          {currentFile}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
