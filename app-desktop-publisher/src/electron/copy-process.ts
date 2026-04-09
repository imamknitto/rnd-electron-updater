import type { BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs/promises'

export type CopyProcessResult = { success: true } | { success: false; error: string }

export const runCopyProcess = async (
  mainWindow: BrowserWindow,
  sourceList: string[],
  destRoot: string,
): Promise<CopyProcessResult> => {
  const countFilesInTree = async (dir: string): Promise<number> => {
    let count = 0
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        count += await countFilesInTree(fullPath)
      } else {
        count++
      }
    }
    return count
  }

  const countItemsAtPath = async (p: string): Promise<number> => {
    const st = await fs.stat(p)
    if (st.isDirectory()) {
      return countFilesInTree(p)
    }
    return 1
  }

  const copyDirectory = async (
    src: string,
    dest: string,
    totalFiles: number,
    currentCount: { value: number },
  ) => {
    await fs.mkdir(dest, { recursive: true })
    const entries = await fs.readdir(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPathJoined = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPathJoined, totalFiles, currentCount)
      } else {
        await fs.copyFile(srcPath, destPathJoined)
        currentCount.value++
        const percent = Math.round((currentCount.value / totalFiles) * 100)
        mainWindow.webContents.send('copyProgress', {
          percent,
          fileName: entry.name,
        })
      }
    }
  }

  const emitProgressForFile = (
    totalFiles: number,
    currentCount: { value: number },
    fileName: string,
  ) => {
    currentCount.value++
    const percent = Math.round((currentCount.value / totalFiles) * 100)
    mainWindow.webContents.send('copyProgress', { percent, fileName })
  }

  try {
    if (!Array.isArray(sourceList) || sourceList.length === 0) {
      const message = 'Pilih minimal satu folder atau file sumber.'
      mainWindow.webContents.send('copyError', message)
      return { success: false, error: message }
    }

    if (typeof destRoot !== 'string' || !destRoot.trim()) {
      const message = 'Folder tujuan tidak valid.'
      mainWindow.webContents.send('copyError', message)
      return { success: false, error: message }
    }

    const resolvedDest = path.resolve(destRoot)
    let totalFiles = 0
    for (const s of sourceList) {
      totalFiles += await countItemsAtPath(s)
    }

    if (totalFiles === 0) {
      const message = 'Tidak ada file untuk disalin.'
      mainWindow.webContents.send('copyError', message)
      return { success: false, error: message }
    }

    const currentCount = { value: 0 }
    await fs.mkdir(resolvedDest, { recursive: true })

    mainWindow.webContents.send('copyStart', totalFiles)

    for (const src of sourceList) {
      const resolvedSrc = path.resolve(src)
      const st = await fs.stat(resolvedSrc)

      if (st.isDirectory()) {
        if (resolvedDest === resolvedSrc || resolvedDest.startsWith(resolvedSrc + path.sep)) {
          const message = 'Folder tujuan tidak boleh berada di dalam folder sumber.'
          mainWindow.webContents.send('copyError', message)
          return { success: false, error: message }
        }
        await copyDirectory(resolvedSrc, resolvedDest, totalFiles, currentCount)
      } else {
        const destPathJoined = path.join(resolvedDest, path.basename(resolvedSrc))
        await fs.copyFile(resolvedSrc, destPathJoined)
        emitProgressForFile(totalFiles, currentCount, path.basename(resolvedSrc))
      }
    }

    mainWindow.webContents.send('copyComplete')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyalin.'
    mainWindow.webContents.send('copyError', message)
    return { success: false, error: message }
  }
}
