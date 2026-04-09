# Electron auto-update (R&D)

Repo ini menggabungkan tiga bagian: aplikasi Electron contoh yang menerima update, tool desktop untuk “mempublish” artefak ke folder sumber (misalnya di Synology), dan backend yang mem-proxy listing + file dari Synology agar bisa dipakai sebagai **generic provider** oleh `electron-updater`.

## Ringkasan alur

1. **be-server** — jalan di server yang bisa mengakses API Synology; mengekspos `latest.yml` dan file installer di URL HTTP.
2. **app-desktop-publisher** — menyalin folder/file ke path tujuan (biasanya shared folder Synology) sesuai preset; preset disimpan di **SQLite**.
3. **app-electron-test-versioning** — aplikasi contoh; di konfigurasi publish/generic-nya mengarah ke URL **be-server** (bukan langsung ke Synology), lalu mengecek update dan mengunduh versi baru.

Urutan percobaan end-to-end yang masuk akal: siapkan Synology + `.env` **be-server** → jalankan **be-server** → pakai **publisher** untuk menyalin build ke folder yang sama dengan yang dilist Synology → install/build **app Electron** dan uji update.

---

## Prasyarat

- **Node.js** 18+ (wajib untuk `be-server`; untuk app Electron biasanya sama).
- **pnpm** (semua app di sini memakai `pnpm`).
- Akses ke **Synology** (File Station / API) jika ingin uji alur penuh dengan **be-server**.

---

## 1. `app-electron-test-versioning`

Contoh project Electron + React (Vite) untuk mensimulasikan **ada atau tidaknya update** versi. Auto-update memakai `electron-updater` (biasanya dengan provider **generic** mengarah ke URL **be-server**).

### Menjalankan development

```bash
cd app-electron-test-versioning
pnpm install
pnpm transpile:electron
pnpm dev
```

- `pnpm dev` menjalankan Electron dan Vite bersamaan (mode development).

### Build installer (Windows)

```bash
pnpm dist:win
```

Script ini menjalankan `transpile:electron`, build frontend (`vite build`), lalu `electron-builder` untuk Windows x64.

### Mencoba auto-update

Auto-update **tidak** untuk mode `pnpm dev`:

- **Disarankan:** build installer (`pnpm dist:win`), install aplikasinya, lalu rilis versi lebih baru ke sumber update (via publisher + folder Synology + **be-server**), dan buka app terpasang untuk mengecek update.
- Atau jalankan build/production sesuai setup project Anda (intinya updater perlu kondisi mendekati **production** / app terpasang, bukan sekadar dev server).

Sesuaikan konfigurasi `electron-builder` dpada bagian URL generic update agar mengarah ke **be-server** (misalnya `https://host-anda/latest.yml`).

---

## 2. `app-desktop-publisher`

Tool desktop (Electron + React) untuk **mensimulasikan publish**: menyalin satu folder atau beberapa file ke **folder tujuan**. Folder tujuan seharusnya berada di **shared folder Synology** (atau path yang sama dengan yang dilist API Synology untuk **be-server**). Di sini ada **SQLite** untuk menyimpan **preset** (misalnya sumber/tujuan) ke database lokal.

### Menjalankan development

```bash
cd app-desktop-publisher
pnpm install
pnpm transpile:electron
pnpm dev
```

`postinstall` menjalankan `electron-builder install-app-deps` (penting untuk native module seperti **better-sqlite3**).

### Build installer (Windows)

```bash
pnpm dist:win
```

### Konsep penggunaan

- Buat/simpan preset ke DB: path sumber artefak build dan path tujuan di share Synology.
- Setelah salin, isi folder tersebut harus konsisten dengan yang dibaca **be-server** + Synology (termasuk `latest.yml` dan file installer yang direferensikan).

---

## 3. `be-server`

Backend **Express** yang:

- Memanggil **API Synology** untuk melihat isi folder (sesuai env).
- Menyajikan **`/latest.yml`** dan unduhan file (misalnya `GET /nama-installer.exe`) agar kompatibel dengan **generic** update di Electron.
- Halaman **`/`** menampilkan listing HTML untuk debugging.

### Konfigurasi

Salin `.env.example` menjadi `.env` dan isi:

| Variabel               | Keterangan                                      |
| ---------------------- | ----------------------------------------------- |
| `SYNOLOGY_BASE_URL`    | Base URL API Synology (tanpa trailing slash)    |
| `SYNOLOGY_FOLDER_PATH` | Path folder di Synology (sesuai query API list) |
| `SYNOLOGY_BASE_VOLUME` | Volume dasar jika diperlukan API                |
| `PORT`                 | Port server lokal (default `8080`)              |

### Menjalankan

```bash
cd be-server
npm install
npm start
```

Development dengan auto-restart:

```bash
npm run dev
```

Setelah jalan, cek log untuk URL listing; di browser buka `http://localhost:<PORT>/` dan pastikan `http://localhost:<PORT>/latest.yml` bisa diakses.

### Integrasi dengan app Electron

Di konfigurasi publish / `electron-updater` (generic), set URL feed ke basis **be-server**, misalnya:

- `https://domain-anda/` atau host internal, dengan path yang mengarah ke file yang sama seperti di Synology (backend yang mem-proxy file tersebut).

---

## Tips uji cepat

- Pastikan **versi** di artefak (dan `latest.yml`) naik dibanding instalasi yang sudah terpasang.
- **be-server** harus bisa reach Synology dari mesinnya; app Electron hanya perlu reach **be-server** (atau HTTPS publik yang Anda sediakan).
- Jika hanya menguji UI tanpa Synology, Anda perlu menyesuaikan atau mem-mock lingkungan; alur resmi di repo ini mengasumsikan Synology + **be-server** + folder hasil **publisher**.
