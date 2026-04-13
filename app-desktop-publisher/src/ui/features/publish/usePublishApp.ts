import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { mergeUniquePaths } from './mergeUniquePaths.ts'

export const usePublishApp = () => {
  const [name, setName] = useState('')
  const [sourcePaths, setSourcePaths] = useState<string[]>([])
  const [destPath, setDestPath] = useState<string | null>(null)
  const [presets, setPresets] = useState<PublishPreset[]>([])
  const [saveError, setSaveError] = useState('')
  const [savingPreset, setSavingPreset] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState('')
  const [totalFiles, setTotalFiles] = useState(0)
  const [copyingPresetId, setCopyingPresetId] = useState<number | null>(null)

  const copying = copyingPresetId !== null
  const sourcesReady = sourcePaths.length > 0

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

  const appendSourceFolders = async () => {
    const paths = await window.electron.selectSourceFolders()
    if (paths?.length) setSourcePaths((prev) => mergeUniquePaths(prev, paths))
  }

  const appendSourceFiles = async () => {
    const paths = await window.electron.selectSourceFiles()
    if (paths?.length) setSourcePaths((prev) => mergeUniquePaths(prev, paths))
  }

  const selectDestination = async () => {
    const p = await window.electron.selectDestinationFolder()
    if (p) setDestPath(p)
  }

  const savePreset = async () => {
    if (sourcePaths.length === 0 || !destPath) return

    setSaveError('')
    setSavingPreset(true)
    console.log({ name, sources: sourcePaths, destPath })

    try {
      const result = await window.electron.savePublishPreset(name, sourcePaths, destPath)
      if (!result.success) return setSaveError(result.error)
      setName('')
      setSourcePaths([])
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

  const clearSourcePaths = () => {
    setSourcePaths([])
  }

  return {
    name,
    setName,
    sourcePaths,
    destPath,
    saveError,
    savingPreset,
    progress,
    currentFile,
    totalFiles,
    copyingPresetId,
    copying,
    sourcesReady,
    presets,
    appendSourceFolders,
    appendSourceFiles,
    selectDestination,
    clearSourcePaths,
    savePreset,
    publishPreset,
    deletePreset,
  }
}
