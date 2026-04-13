import fs from 'fs'
import path from 'path'

import type { PublishSourceMode } from './publish-db.js'

export const derivePublishSourceMode = (sources: string[]): PublishSourceMode => {
  if (sources.length === 1) {
    try {
      const resolved = path.resolve(sources[0])
      const st = fs.statSync(resolved)
      return st.isDirectory() ? 'folder' : 'files'
    } catch {
      return 'files'
    }
  }
  return 'files'
}
