import { app } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'

export type PublishHistoryRow = {
  id: number
  preset_id: number
  preset_name: string
  published_by: string
  published_at: number
  sources_json: string
  destination: string
}

let db: Database.Database | null = null

type TableInfoRow = { name: string }

const ensurePublishHistorySchema = (database: Database.Database): void => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS publish_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      preset_id INTEGER NOT NULL,
      preset_name TEXT NOT NULL,
      published_by TEXT NOT NULL,
      published_at INTEGER NOT NULL,
      sources_json TEXT NOT NULL,
      destination TEXT NOT NULL
    )
  `)
}

const getDb = (): Database.Database => {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'publisher.db')
    db = new Database(dbPath)
    ensurePublishHistorySchema(db)
  }
  return db
}

export const recordPublishHistory = (
  presetId: number,
  presetName: string,
  sources: string[],
  destination: string,
  publishedByUsername: string,
): { success: boolean; error?: string } => {
  if (!presetId) return { success: false, error: 'Preset ID tidak boleh kosong.' }
  if (!presetName.trim()) return { success: false, error: 'Nama preset tidak boleh kosong.' }
  if (sources.length === 0) return { success: false, error: 'Sumber tidak boleh kosong.' }
  if (!destination.trim()) return { success: false, error: 'Tujuan tidak boleh kosong.' }

  try {
    const stmt = getDb().prepare(
      `INSERT INTO publish_history (preset_id, preset_name, published_by, published_at, sources_json, destination)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    stmt.run(
      presetId,
      presetName,
      publishedByUsername,
      Date.now(),
      JSON.stringify(sources),
      destination,
    )
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal merekam history publikasi.'
    return { success: false, error: message }
  }
}

export const getPublishHistory = (
  limit: number = 100,
  offset: number = 0,
): PublishHistoryRow[] => {
  const rows = getDb()
    .prepare(
      `SELECT id, preset_id, preset_name, published_by, published_at, sources_json, destination
       FROM publish_history
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(limit, offset) as PublishHistoryRow[]

  return rows
}

export const getPublishHistoryByPreset = (presetId: number): PublishHistoryRow[] => {
  const rows = getDb()
    .prepare(
      `SELECT id, preset_id, preset_name, published_by, published_at, sources_json, destination
       FROM publish_history
       WHERE preset_id = ?
       ORDER BY published_at DESC`,
    )
    .all(presetId) as PublishHistoryRow[]

  return rows
}
