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

type CopyProcessResult = { success: true } | { success: false; error: string }

type AppRole = 'developer' | 'implementor'

type AuthUser = {
  username: string
  role: AppRole
}

type LoginResult = { success: true; user: AuthUser } | { success: false; error: string }

type PublishSourceMode = 'folder' | 'files'

type PublishPreset = {
  id: number
  name: string
  sourceMode: PublishSourceMode
  sources: string[]
  destination: string
  createdAt: number
  /** Versi file .exe pertama yang ditemukan di sumber (Windows); diisi saat list preset. */
  sourceExeVersion: string | null
}

type SavePublishPresetResult = { success: true; id: number } | { success: false; error: string }

type DeletePublishPresetResult = { success: true; id: number } | { success: false; error: string }

type EventPayloadMapping = {
  statistics: Statistics
  getStaticData: StaticData
  updateEvent: UpdateEvent
  checkForUpdates: void
  downloadUpdate: void
  quitAndInstall: void
  getAppVersion: string
  login: LoginResult
  logout: void
  getAuthState: AuthUser | null
  selectSourceFolders: string[] | null
  selectSourceFiles: string[] | null
  selectDestinationFolder: string | null
  startCopyProcess: CopyProcessResult
  savePublishPreset: SavePublishPresetResult
  deletePublishPreset: DeletePublishPresetResult
  listPublishPresets: PublishPreset[]
}

type CopyProgressPayload = { percent: number; fileName: string }

interface Window {
  electron: {
    checkForUpdates: () => Promise<void>
    downloadUpdate: () => Promise<void>
    quitAndInstall: () => Promise<void>
    onUpdateEvent: (callback: (event: UpdateEvent) => void) => () => void
    getAppVersion: () => Promise<string>
    login: (username: string, password: string) => Promise<LoginResult>
    logout: () => Promise<void>
    getAuthState: () => Promise<AuthUser | null>
    selectSourceFolders: () => Promise<string[] | null>
    selectSourceFiles: () => Promise<string[] | null>
    selectDestinationFolder: () => Promise<string | null>
    startCopyProcess: (sources: string[], destination: string) => Promise<CopyProcessResult>
    savePublishPreset: (
      name: string,
      sources: string[],
      destination: string,
    ) => Promise<SavePublishPresetResult>
    deletePublishPreset: (id: number) => Promise<DeletePublishPresetResult>
    listPublishPresets: () => Promise<PublishPreset[]>
    onCopyProgress: (callback: (payload: CopyProgressPayload) => void) => () => void
    onCopyStart: (callback: (totalFiles: number) => void) => () => void
    onCopyComplete: (callback: () => void) => () => void
    onCopyError: (callback: (message: string) => void) => () => void
  }
}
