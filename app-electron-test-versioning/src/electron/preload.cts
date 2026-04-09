const electron = require('electron')

electron.contextBridge.exposeInMainWorld('electron', {
  subscribeStatistics: (callback) => {
    // @ts-ignore
    ipcOn('statistics', (stats) => {
      callback(stats)
    })
  },
  getStaticData: () => ipcInvoke('getStaticData'),
  getAppVersion: () => ipcInvoke('getAppVersion'),
  checkForUpdates: () => ipcInvoke('checkForUpdates'),
  downloadUpdate: () => ipcInvoke('downloadUpdate'),
  quitAndInstall: () => ipcInvoke('quitAndInstall'),
  focusWindow: () => ipcInvoke('focusWindow'),
  onUpdateEvent: (callback) => {
    // @ts-ignore
    ipcOn('updateEvent', (payload) => {
      callback(payload)
    })
  },
} satisfies Window['electron'])

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key)
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
) {
  // @ts-ignore
  electron.ipcRenderer.on(key, (_, payload) => callback(payload))
}
