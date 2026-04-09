type Statistics = {
  cpuUsage: number
  ramUsage: number
  storageUsage: number
}

type StaticData = {
  storageTotal: number
  cpuModel: string
  totalMemoryGB: number
}

type UpdateEvent =
  | { type: 'checking' }
  | { type: 'not-available' }
  | { type: 'available'; version: string }
  | { type: 'progress'; percent: number }
  | { type: 'downloaded' }
  | { type: 'error'; message: string }

type EventPayloadMapping = {
  statistics: Statistics
  getStaticData: StaticData
  updateEvent: UpdateEvent
  checkForUpdates: void
  downloadUpdate: void
  quitAndInstall: void
  getAppVersion: string
}

interface Window {
  electron: {
    subscribeStatistics: (callback: (statistics: Statistics) => void) => void
    getStaticData: () => Promise<StaticData>
    checkForUpdates: () => Promise<void>
    downloadUpdate: () => Promise<void>
    quitAndInstall: () => Promise<void>
    onUpdateEvent: (callback: (event: UpdateEvent) => void) => void
    getAppVersion: () => Promise<string>
  }
}
