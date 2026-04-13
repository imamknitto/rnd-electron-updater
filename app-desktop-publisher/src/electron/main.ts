import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'
import {
  authErrorNotLoggedIn,
  getSession,
  isDeveloper,
  isLoggedIn,
  loginWithDummyAccounts,
  logoutSession,
} from './auth-session.js'
import { getSourceExeVersion } from './exe-source-version.js'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'
import { runCopyProcess } from './copy-process.js'
import { listPublishPresets, savePublishPreset, deletePublishPreset } from './publish-db.js'
import { derivePublishSourceMode } from './derive-source-mode.js'

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

  ipcHandle('login', (username: unknown, password: unknown) => {
    return loginWithDummyAccounts(String(username ?? ''), String(password ?? ''))
  })

  ipcHandle('logout', () => {
    logoutSession()
  })

  ipcHandle('getAuthState', () => {
    return getSession()
  })

  ipcHandle('selectSourceFolders', async () => {
    if (!isDeveloper()) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'multiSelections'],
    })
    return result.canceled ? null : result.filePaths
  })

  ipcHandle('selectSourceFiles', async () => {
    if (!isDeveloper()) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
    })
    return result.canceled ? null : result.filePaths
  })

  ipcHandle('selectDestinationFolder', async () => {
    if (!isDeveloper()) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcHandle('getAppVersion', () => {
    return app.getVersion()
  })

  ipcHandle('savePublishPreset', (name: unknown, sources: unknown, destination: unknown) => {
    if (!isLoggedIn()) {
      return { success: false as const, error: authErrorNotLoggedIn }
    }
    if (!isDeveloper()) {
      return { success: false as const, error: 'Hanya developer yang dapat menyimpan preset.' }
    }
    const nam = name as string
    const list = sources as string[]
    const dest = destination as string
    const mode = derivePublishSourceMode(list)
    return savePublishPreset(nam, mode, list, dest)
  })

  ipcHandle('deletePublishPreset', (id: unknown): DeletePublishPresetResult => {
    if (!isLoggedIn()) {
      return { success: false, error: authErrorNotLoggedIn }
    }
    if (!isDeveloper()) {
      return { success: false, error: 'Hanya developer yang dapat menghapus preset.' }
    }
    const idNumber = id as number
    const result = deletePublishPreset(idNumber)
    return result.success
      ? { success: true, id: idNumber }
      : { success: false, error: result.error ?? '' }
  })

  ipcHandle('listPublishPresets', async () => {
    if (!isLoggedIn()) {
      return []
    }
    const rows = listPublishPresets()
    return Promise.all(
      rows.map(async (r) => ({
        ...r,
        sourceExeVersion: await getSourceExeVersion(r.sources),
      })),
    )
  })

  ipcHandle('startCopyProcess', async (sources: unknown, destination: unknown) => {
    if (!isLoggedIn()) {
      return { success: false as const, error: authErrorNotLoggedIn }
    }
    if (getSession()?.role !== 'implementor') {
      return {
        success: false as const,
        error: 'Hanya implementor yang dapat melakukan publish.',
      }
    }
    const sourceList = sources as string[]
    const destRoot = destination as string
    return runCopyProcess(mainWindow, sourceList, destRoot)
  })
})
