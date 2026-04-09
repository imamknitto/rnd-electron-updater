import { app, BrowserWindow } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'
import { getStaticData, pollResources } from './resource-manager.js'
import { setupAutoUpdate } from './update-manager.js'

let mainWindow: BrowserWindow | null = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:4006')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'))
  }

  setupAutoUpdate(mainWindow)
  pollResources(mainWindow)

  ipcHandle('getStaticData', () => {
    return getStaticData()
  })

  ipcHandle('getAppVersion', () => {
    return app.getVersion()
  })

  ipcHandle('focusWindow', () => {
    const win = mainWindow
    if (!win || win.isDestroyed()) {
      return
    }
    if (win.isMinimized()) {
      win.restore()
    }
    win.show()
    win.focus()
  })
})
