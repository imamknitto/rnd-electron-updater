export const statusText = (ev: UpdateEvent | null): string => {
  if (!ev) return 'Belum diperiksa.'

  switch (ev.type) {
    case 'checking':
      return 'Mengecek pembaruan…'
    case 'not-available':
      return 'Sudah versi terbaru.'
    case 'available':
      return `Versi ${ev.version} tersedia.`
    case 'progress':
      return `Mengunduh ${Math.round(ev.percent)}%`
    case 'downloaded':
      return 'Unduhan selesai. Mulai ulang untuk memasang.'
    case 'error':
      return ev.message
    default:
      return ''
  }
}

export const isCardEvent = (ev: UpdateEvent | null): boolean =>
  ev !== null && (ev.type === 'available' || ev.type === 'progress' || ev.type === 'downloaded')
