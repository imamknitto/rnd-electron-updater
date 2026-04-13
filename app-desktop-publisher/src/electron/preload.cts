import type { IpcRendererEvent } from 'electron'

const electron = require('electron') as typeof import('electron')

electron.contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcInvoke('getAppVersion'),
  checkForUpdates: () => ipcInvoke('checkForUpdates'),
  downloadUpdate: () => ipcInvoke('downloadUpdate'),
  quitAndInstall: () => ipcInvoke('quitAndInstall'),
  onUpdateEvent: (callback: (event: UpdateEvent) => void) => {
    const listener = (_event: IpcRendererEvent, payload: UpdateEvent) => {
      callback(payload)
    }
    electron.ipcRenderer.on('updateEvent', listener)
    return () => electron.ipcRenderer.removeListener('updateEvent', listener)
  },

  login: (username: string, password: string) => ipcInvoke('login', username, password),
  logout: () => ipcInvoke('logout'),
  getAuthState: () => ipcInvoke('getAuthState'),
  selectSourceFolders: () => ipcInvoke('selectSourceFolders'),
  selectSourceFiles: () => ipcInvoke('selectSourceFiles'),
  selectDestinationFolder: () => ipcInvoke('selectDestinationFolder'),
  savePublishPreset: (name: string, sources: string[], destination: string) =>
    ipcInvoke('savePublishPreset', name, sources, destination),
  listPublishPresets: () => ipcInvoke('listPublishPresets'),
  startCopyProcess: (sources: string[], destination: string) =>
    ipcInvoke('startCopyProcess', sources, destination),
  deletePublishPreset: (id: number) => ipcInvoke('deletePublishPreset', id),

  onCopyProgress: (callback: (payload: CopyProgressPayload) => void) => {
    const listener = (_event: IpcRendererEvent, payload: CopyProgressPayload) => {
      callback(payload)
    }
    electron.ipcRenderer.on('copyProgress', listener)
    return () => electron.ipcRenderer.removeListener('copyProgress', listener)
  },
  onCopyStart: (callback: (totalFiles: number) => void) => {
    const listener = (_event: IpcRendererEvent, totalFiles: number) => {
      callback(totalFiles)
    }
    electron.ipcRenderer.on('copyStart', listener)
    return () => electron.ipcRenderer.removeListener('copyStart', listener)
  },
  onCopyComplete: (callback: () => void) => {
    const listener = (_event: IpcRendererEvent) => {
      callback()
    }
    electron.ipcRenderer.on('copyComplete', listener)
    return () => electron.ipcRenderer.removeListener('copyComplete', listener)
  },
  onCopyError: (callback: (message: string) => void) => {
    const listener = (_event: IpcRendererEvent, message: string) => {
      callback(message)
    }
    electron.ipcRenderer.on('copyError', listener)
    return () => electron.ipcRenderer.removeListener('copyError', listener)
  },
} satisfies Window['electron'])

function ipcInvoke<K extends keyof EventPayloadMapping>(
  key: K,
  ...args: unknown[]
): Promise<EventPayloadMapping[K]> {
  return electron.ipcRenderer.invoke(key, ...args) as Promise<EventPayloadMapping[K]>
}
