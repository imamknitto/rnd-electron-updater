# electron-auto-update

Aplikasi desktop **Electron** dengan UI **React** (Vite). Mode pengembangan memuat antarmuka dari dev server Vite; mode produksi memuat build statis dari `dist-react`.

## Prasyarat

- **Node.js** (LTS disarankan)
- **pnpm** (`npm install -g pnpm`)

## Setup

```bash
pnpm install
```

## Menjalankan proyek

| Perintah | Keterangan |
|----------|------------|
| `pnpm dev` | Menjalankan **Vite** (UI) dan **Electron** bersamaan. UI di `http://localhost:4006` (`strictPort: true` di `vite.config.ts`). |
| `pnpm dev:react` | Hanya dev server Vite. |
| `pnpm dev:electron` | Hanya Electron (pastikan Vite sudah jalan jika mode dev). |
| `pnpm build` | TypeScript project references + build React ke `dist-react`. |
| `pnpm transpile:electron` | Kompilasi main/preload Electron ke `dist-electron`. |
| `pnpm lint` | ESLint. |

**Alur dev:** jalankan `pnpm dev`. Electron memeriksa `NODE_ENV === 'development'` lalu memuat `http://localhost:4006` (lihat `src/electron/main.ts`).

## Windows

- **Variabel lingkungan di skrip npm:** Di Windows, sintaks shell seperti `NODE_ENV=development electron .` tidak didukung. Proyek ini memakai **`cross-env`** pada skrip `dev:electron` agar `NODE_ENV` diset dengan benar di CMD, PowerShell, dan Unix.
- **Shell:** PowerShell atau **Command Prompt** biasanya cukup. **Git Bash** juga bisa selama `pnpm`/`node` ada di `PATH`.
- **Build installer Windows:** Di mesin Windows, jalankan:

  ```bash
  pnpm dist:win
  ```

  Output mengikuti `electron-builder.json` (mis. target **portable** dan **nsis**). Build macOS/Linux dari Windows tidak didukung oleh electron-builder untuk target asli tersebut—gunakan mesin atau CI yang sesuai.

- **Masalah umum:** Jika muncul pesan seperti `'NODE_ENV' is not recognized`, pastikan `package.json` memakai `cross-env` di skrip yang men-set env (sudah dikonfigurasi untuk `dev:electron`).

## Build per platform

| Perintah | Catatan |
|----------|---------|
| `pnpm dist:win` | Windows x64 (jalankan di Windows). |
| `pnpm dist:mac` | macOS arm64 + DMG (jalankan di macOS). |
| `pnpm dist:linux` | Linux x64 AppImage (jalankan di Linux atau CI). |

Konfigurasi paket (`appId`, ikon, target installer) ada di **`electron-builder.json`**.

## Struktur singkat

- `src/ui/` — React (entry Vite / `index.html`)
- `src/electron/` — main process, preload, utilitas IPC / resource
- `dist-react/` — hasil `vite build`
- `dist-electron/` — hasil `transpile:electron`

## Stack

- Electron, React 19, Vite 6, TypeScript, electron-builder, concurrently, cross-env

## Auto-update

Nama repo mengacu pada kemampuan auto-update; **alur `electron-updater` belum terpasang di main process**. Untuk produksi, tambahkan dependensi dan konfigurasi publish (mis. GitHub Releases atau server statis) sesuai [dokumentasi electron-builder / electron-updater](https://www.electron.build/).
