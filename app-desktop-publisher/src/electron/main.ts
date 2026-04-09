import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'
import { runCopyProcess } from './copy-process.js'
import { listPublishPresets, savePublishPreset, deletePublishPreset } from './publish-db.js'

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:4007')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist-react/index.html'))
  }

  ipcHandle('selectSourceFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcHandle('selectSourceFiles', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
    })
    return result.canceled ? null : result.filePaths
  })

  ipcHandle('selectDestinationFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcHandle('getAppVersion', () => {
    return app.getVersion()
  })

  ipcHandle(
    'savePublishPreset',
    (name: unknown, sourceMode: unknown, sources: unknown, destination: unknown) => {
      const nam = name as string
      const mode = sourceMode as 'folder' | 'files'
      const list = sources as string[]
      const dest = destination as string
      if (mode !== 'folder' && mode !== 'files') {
        return { success: false as const, error: 'Mode sumber tidak valid.' }
      }
      return savePublishPreset(nam, mode, list, dest)
    },
  )

  ipcHandle('deletePublishPreset', (id: unknown): DeletePublishPresetResult => {
    const idNumber = id as number
    const result = deletePublishPreset(idNumber)
    return result.success
      ? { success: true, id: idNumber }
      : { success: false, error: result.error ?? '' }
  })

  ipcHandle('listPublishPresets', () => {
    return listPublishPresets()
  })

  ipcHandle('startCopyProcess', async (sources: unknown, destination: unknown) => {
    const sourceList = sources as string[]
    const destRoot = destination as string
    return runCopyProcess(mainWindow, sourceList, destRoot)
  })
})
