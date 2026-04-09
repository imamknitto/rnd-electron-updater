import { ipcMain, WebContents } from 'electron'

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function ipcHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (...args: unknown[]) => EventPayloadMapping[Key] | Promise<EventPayloadMapping[Key]>,
) {
  ipcMain.handle(key, (_event, ...args) => handler(...args))
}

export function webContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key],
) {
  webContents.send(key, payload)
}
