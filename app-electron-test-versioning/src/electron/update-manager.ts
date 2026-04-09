import { app, BrowserWindow, ipcMain } from 'electron'
import pkg from 'electron-updater'
import { isDev, webContentsSend } from './utils.js'

export const setupAutoUpdate = (win: BrowserWindow): void => {
  const enabled = !isDev() && app.isPackaged

  ipcMain.handle('checkForUpdates', async () => {
    if (!enabled) {
      webContentsSend('updateEvent', win.webContents, {
        type: 'error',
        message: 'Pembaruan hanya setelah instalasi (bukan mode dev).',
      })
      return
    }

    webContentsSend('updateEvent', win.webContents, { type: 'checking' })

    try {
      await pkg.autoUpdater.checkForUpdates()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal memeriksa pembaruan.'
      webContentsSend('updateEvent', win.webContents, { type: 'error', message })
    }
  })

  ipcMain.handle('quitAndInstall', () => {
    if (!enabled) return
    pkg.autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('downloadUpdate', async () => {
    if (!enabled) return

    try {
      await pkg.autoUpdater.downloadUpdate()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Gagal mengunduh pembaruan.'
      webContentsSend('updateEvent', win.webContents, { type: 'error', message })
    }
  })

  if (!enabled) return

  pkg.autoUpdater.autoDownload = false

  win.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      void pkg.autoUpdater.checkForUpdates()
    }, 600)
  })

  pkg.autoUpdater.on('checking-for-update', () => {
    webContentsSend('updateEvent', win.webContents, { type: 'checking' })
  })

  pkg.autoUpdater.on('update-not-available', () => {
    webContentsSend('updateEvent', win.webContents, { type: 'not-available' })
  })

  pkg.autoUpdater.on('update-available', (info) => {
    webContentsSend('updateEvent', win.webContents, { type: 'available', version: info.version })
  })

  pkg.autoUpdater.on('download-progress', (p) => {
    webContentsSend('updateEvent', win.webContents, { type: 'progress', percent: p.percent })
  })

  pkg.autoUpdater.on('update-downloaded', () => {
    webContentsSend('updateEvent', win.webContents, { type: 'downloaded' })
  })

  pkg.autoUpdater.on('error', (err) => {
    console.log({ err })
    webContentsSend('updateEvent', win.webContents, { type: 'error', message: 'Error occurred' })
  })
}
