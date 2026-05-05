import { app } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'

export type PublishSourceMode = 'folder' | 'files'

export type PublishPresetRow = {
  id: number
  name: string
  sourceMode: PublishSourceMode
  sources: string[]
  destination: string
  createdAt: number
  createdBy: string
  isPublished: boolean
  publishedAt?: number
}

let db: Database.Database | null = null

type TableInfoRow = { name: string }

const ensurePublishPresetsSchema = (database: Database.Database): void => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS publish_presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_mode TEXT NOT NULL CHECK(source_mode IN ('folder','files')),
      sources_json TEXT NOT NULL,
      destination TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
  const columns = database.prepare('PRAGMA table_info(publish_presets)').all() as TableInfoRow[]
  if (!columns.some((c) => c.name === 'name')) {
    database.exec(`ALTER TABLE publish_presets ADD COLUMN name TEXT NOT NULL DEFAULT ''`)
  }
  if (!columns.some((c) => c.name === 'created_by')) {
    database.exec(
      `ALTER TABLE publish_presets ADD COLUMN created_by TEXT NOT NULL DEFAULT 'unknown'`,
    )
  }
  if (!columns.some((c) => c.name === 'is_published')) {
    database.exec(`ALTER TABLE publish_presets ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0`)
  }
  if (!columns.some((c) => c.name === 'published_at')) {
    database.exec(`ALTER TABLE publish_presets ADD COLUMN published_at INTEGER`)
  }
}

const getDb = (): Database.Database => {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'publisher.db')
    db = new Database(dbPath)
    ensurePublishPresetsSchema(db)
  }
  return db
}

export const savePublishPreset = (
  name: string,
  sourceMode: PublishSourceMode,
  sources: string[],
  destination: string,
  createdByUsername: string,
): { success: true; id: number } | { success: false; error: string } => {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: 'Nama tidak boleh kosong.' }
  }
  if (sources.length === 0) {
    return { success: false, error: 'Sumber tidak boleh kosong.' }
  }
  if (!destination.trim()) {
    return { success: false, error: 'Tujuan tidak boleh kosong.' }
  }
  try {
    const stmt = getDb().prepare(
      `INSERT INTO publish_presets (name, source_mode, sources_json, destination, created_at, created_by, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    const info = stmt.run(
      trimmedName,
      sourceMode,
      JSON.stringify(sources),
      destination.trim(),
      Date.now(),
      createdByUsername,
      0,
      null,
    )
    return { success: true, id: Number(info.lastInsertRowid) }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal menyimpan preset.'
    return { success: false, error: message }
  }
}

type DbRow = {
  id: number
  name: string
  source_mode: string
  sources_json: string
  destination: string
  created_at: number
  created_by: string
  is_published: number
  published_at: number | null
}

export const listPublishPresets = (): PublishPresetRow[] => {
  const rows = getDb()
    .prepare(
      `SELECT id, name, source_mode, sources_json, destination, created_at, created_by, is_published, published_at
       FROM publish_presets
       ORDER BY created_at DESC`,
    )
    .all() as DbRow[]

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sourceMode: r.source_mode as PublishSourceMode,
    sources: JSON.parse(r.sources_json) as string[],
    destination: r.destination,
    createdAt: r.created_at,
    createdBy: r.created_by,
    isPublished: Boolean(r.is_published),
    publishedAt: r.published_at ?? undefined,
  }))
}

export const deletePublishPreset = (id: number): { success: boolean; error?: string } => {
  if (!id) return { success: false, error: 'ID tidak boleh kosong.' }
  if (typeof id !== 'number') return { success: false, error: 'ID harus berupa angka.' }

  try {
    const stmt = getDb().prepare('DELETE FROM publish_presets WHERE id = ?')
    const info = stmt.run(id)
    if (info.changes === 0) return { success: false, error: 'Preset tidak ditemukan.' }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus preset.'
    return { success: false, error: message }
  }
}

export const updatePublishPreset = (
  id: number,
  name: string,
  sourceMode: PublishSourceMode,
  sources: string[],
  destination: string,
): { success: boolean; error?: string } => {
  if (!id) return { success: false, error: 'ID tidak boleh kosong.' }
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: 'Nama tidak boleh kosong.' }
  }
  if (sources.length === 0) {
    return { success: false, error: 'Sumber tidak boleh kosong.' }
  }
  if (!destination.trim()) {
    return { success: false, error: 'Tujuan tidak boleh kosong.' }
  }

  try {
    const stmt = getDb().prepare(
      `UPDATE publish_presets 
       SET name = ?, source_mode = ?, sources_json = ?, destination = ? 
       WHERE id = ?`,
    )
    const info = stmt.run(trimmedName, sourceMode, JSON.stringify(sources), destination.trim(), id)
    if (info.changes === 0) return { success: false, error: 'Preset tidak ditemukan.' }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengupdate preset.'
    return { success: false, error: message }
  }
}

export const markPresetAsPublished = (id: number): { success: boolean; error?: string } => {
  if (!id) return { success: false, error: 'ID tidak boleh kosong.' }

  try {
    const stmt = getDb().prepare(
      `UPDATE publish_presets 
       SET is_published = 1, published_at = ? 
       WHERE id = ?`,
    )
    const info = stmt.run(Date.now(), id)
    if (info.changes === 0) return { success: false, error: 'Preset tidak ditemukan.' }
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengupdate status preset.'
    return { success: false, error: message }
  }
}
