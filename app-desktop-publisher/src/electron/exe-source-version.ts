import { execFile } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

/** Skor nama file: installer / setup lebih diprioritaskan daripada exe kecil (elevate, dll). */
const scoreExeBasename = (basename: string): number => {
  const lower = basename.toLowerCase()
  if (lower === 'uninstall.exe' || lower.includes('uninst')) return -100
  if (lower.includes('setup') || lower.includes('installer')) return 100
  if (lower.includes('install') && !lower.includes('uninstall')) return 80
  return 0
}

const pickBestExePath = (paths: string[]): string | null => {
  if (paths.length === 0) return null
  const ranked = [...paths].sort((a, b) => {
    const sa = scoreExeBasename(path.basename(a))
    const sb = scoreExeBasename(path.basename(b))
    if (sb !== sa) return sb - sa
    return path.basename(a).localeCompare(path.basename(b))
  })
  return ranked[0]
}

/** Kumpulkan semua .exe di bawah folder sampai kedalaman tertentu (termasuk subfolder release/dist). */
const collectExePathsInDirectory = async (dir: string, maxDepth: number): Promise<string[]> => {
  const acc: string[] = []

  const walk = async (current: string, remaining: number): Promise<void> => {
    if (remaining < 0) return
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => [])
    for (const e of entries) {
      const full = path.join(current, e.name)
      if (e.isFile() && e.name.toLowerCase().endsWith('.exe')) {
        acc.push(full)
      } else if (e.isDirectory()) {
        await walk(full, remaining - 1)
      }
    }
  }

  await walk(dir, maxDepth)
  return acc
}

export const findFirstExeInSources = async (sources: string[]): Promise<string | null> => {
  for (const s of sources) {
    const st = await fs.stat(s).catch(() => null)
    if (!st) continue
    if (st.isFile() && s.toLowerCase().endsWith('.exe')) {
      return s
    }
    if (st.isDirectory()) {
      const exes = await collectExePathsInDirectory(s, 6)
      const best = pickBestExePath(exes)
      if (best) return best
    }
  }
  return null
}

/**
 * Baca versi Windows PE (cocok untuk installer NSIS / electron-builder & .exe app biasa).
 * Pakai System.Diagnostics.FileVersionInfo — lebih stabil daripada Get-Item.VersionInfo saja.
 */
const getWindowsExeFileVersion = async (exePath: string): Promise<string | null> => {
  const escaped = exePath.replace(/'/g, "''")
  const command = `$i = [System.Diagnostics.FileVersionInfo]::GetVersionInfo('${escaped}'); $p = $i.ProductVersion; $f = $i.FileVersion; if (-not [string]::IsNullOrWhiteSpace($p)) { $p.Trim() } elseif (-not [string]::IsNullOrWhiteSpace($f)) { $f.Trim() } else { '' }`

  try {
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      timeout: 20_000,
      windowsHide: true,
    })
    const v = stdout.replace(/\0/g, '').trim().split(/\r?\n/)[0] ?? ''
    return v.length > 0 ? v : null
  } catch {
    return null
  }
}

export const getSourceExeVersion = async (sources: string[]): Promise<string | null> => {
  const exePath = await findFirstExeInSources(sources)
  if (!exePath) return null
  if (process.platform === 'win32') {
    return getWindowsExeFileVersion(exePath)
  }
  return null
}
