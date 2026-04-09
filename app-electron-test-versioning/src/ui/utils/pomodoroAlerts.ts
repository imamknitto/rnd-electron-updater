const BEEP_DURATION_S = 0.22

const scheduleBeep = (
  ctx: AudioContext,
  startTime: number,
  frequencyHz: number,
  peakGain: number,
): void => {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = frequencyHz
  osc.type = 'sine'
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + BEEP_DURATION_S)
  osc.start(startTime)
  osc.stop(startTime + BEEP_DURATION_S + 0.02)
}

/**
 * Dering pendek (dua nada) memakai Web Audio API — tidak perlu file audio.
 * Perlu interaksi pengguna sebelumnya (mis. klik Mulai) agar AudioContext tidak diblokir.
 */
export const playPomodoroChime = (): void => {
  const Ctx =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) {
    return
  }
  const ctx = new Ctx()
  const start = ctx.currentTime
  void ctx.resume().then(() => {
    scheduleBeep(ctx, start, 880, 0.12)
    scheduleBeep(ctx, start + 0.28, 660, 0.1)
  })
}

/**
 * Notifikasi OS saat sesi selesai. `silent: true` supaya tidak dobel dengan nada sistem.
 */
export const tryShowSessionCompletedNotification = async (sessionLabel: string): Promise<void> => {
  if (typeof Notification === 'undefined') {
    return
  }
  if (Notification.permission === 'denied') {
    return
  }
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    if (result !== 'granted') {
      return
    }
  }
  const n = new Notification('Pomodoro selesai', {
    body: `Sesi ${sessionLabel} telah berakhir.`,
    silent: true,
  })
  n.onclick = (): void => {
    n.close()
    if (typeof window !== 'undefined' && window.electron?.focusWindow) {
      void window.electron.focusWindow()
      return
    }
    window.focus()
  }
}
