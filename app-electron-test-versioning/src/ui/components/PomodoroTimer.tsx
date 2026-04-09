import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'

import { playPomodoroChime, tryShowSessionCompletedNotification } from '../utils/pomodoroAlerts'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

type Phase = 'idle' | 'running' | 'completed'

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Fokus',
  shortBreak: 'Istirahat pendek',
  longBreak: 'Istirahat panjang',
}

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const STORAGE_SOUND = 'pomodoro.sound'
const STORAGE_NOTIFY = 'pomodoro.notify'

const readBoolPref = (key: string, defaultValue: boolean): boolean => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return defaultValue
    }
    return raw === 'true'
  } catch {
    return defaultValue
  }
}

const writeBoolPref = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, value ? 'true' : 'false')
  } catch {
    /* ignore quota / private mode */
  }
}

/** Menghindari suara/notifikasi ganda saat React Strict Mode atau re-run effect. */
let lastAlertedCompletionKey = 0

export const PomodoroTimer = (): ReactElement => {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [secondsLeft, setSecondsLeft] = useState<number>(MODE_DURATIONS.focus)
  const [phase, setPhase] = useState<Phase>('idle')
  const [completionKey, setCompletionKey] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => readBoolPref(STORAGE_SOUND, true))
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() =>
    readBoolPref(STORAGE_NOTIFY, true),
  )

  const duration = MODE_DURATIONS[mode]
  const isRunning = phase === 'running'

  const progress = useMemo((): number => {
    if (duration <= 0) {
      return 0
    }
    return 1 - secondsLeft / duration
  }, [duration, secondsLeft])

  const resetToMode = useCallback((nextMode: TimerMode): void => {
    setMode(nextMode)
    setSecondsLeft(MODE_DURATIONS[nextMode])
    setPhase('idle')
  }, [])

  useEffect(() => {
    if (phase !== 'running') {
      return
    }

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase('completed')
          setCompletionKey((k) => k + 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (completionKey === 0) {
      return
    }
    if (lastAlertedCompletionKey === completionKey) {
      return
    }
    lastAlertedCompletionKey = completionKey
    if (soundEnabled) {
      playPomodoroChime()
    }
    if (notifyEnabled) {
      void tryShowSessionCompletedNotification(MODE_LABELS[mode])
    }
  }, [completionKey, mode, notifyEnabled, soundEnabled])

  const setSoundPref = (on: boolean): void => {
    setSoundEnabled(on)
    writeBoolPref(STORAGE_SOUND, on)
  }

  const setNotifyPref = (on: boolean): void => {
    setNotifyEnabled(on)
    writeBoolPref(STORAGE_NOTIFY, on)
  }

  const handleStartPause = (): void => {
    if (phase === 'completed') {
      setSecondsLeft(duration)
      setPhase('running')
      return
    }
    if (phase === 'running') {
      setPhase('idle')
      return
    }
    setPhase('running')
  }

  const handleReset = (): void => {
    setSecondsLeft(MODE_DURATIONS[mode])
    setPhase('idle')
  }

  const handleModeChange = (next: TimerMode): void => {
    if (isRunning) {
      return
    }
    resetToMode(next)
  }

  const circumference = 2 * Math.PI * 52
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <main className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-8 shadow-sm">
        <p className="mb-6 text-center text-sm text-neutral-500">
          Pilih sesi, mulai timer, dan fokus pada satu tugas pada satu waktu.
        </p>

        <div
          className="mb-8 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Mode pomodoro"
        >
          {(Object.keys(MODE_DURATIONS) as TimerMode[]).map((m) => {
            const active = mode === m
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={isRunning}
                onClick={() => handleModeChange(m)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-orange-400 bg-orange-100 text-neutral-900'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            )
          })}
        </div>

        <div className="relative mx-auto mb-8 flex h-56 w-56 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-neutral-200"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-orange-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="relative text-center">
            <p
              className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-neutral-900"
              aria-live="polite"
            >
              {formatTime(secondsLeft)}
            </p>
            {phase === 'completed' ? (
              <p className="mt-2 text-sm font-medium text-orange-700">Sesi selesai</p>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">{MODE_LABELS[mode]}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="btn-primary min-w-[120px] rounded-lg"
            onClick={handleStartPause}
          >
            {phase === 'running' ? 'Jeda' : phase === 'completed' ? 'Ulangi' : 'Mulai'}
          </button>
          <button
            type="button"
            className="btn-ghost rounded-lg"
            onClick={handleReset}
            disabled={phase === 'idle' && secondsLeft === duration}
          >
            Atur ulang
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
            Peringatan saat selesai
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="size-4 rounded border-neutral-300 accent-orange-500"
                checked={soundEnabled}
                onChange={(e) => setSoundPref(e.target.checked)}
              />
              Nada dering
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="size-4 rounded border-neutral-300 accent-orange-500"
                checked={notifyEnabled}
                onChange={(e) => setNotifyPref(e.target.checked)}
              />
              Notifikasi desktop
            </label>
          </div>
          {notifyEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'denied' ? (
            <p className="text-center text-xs text-neutral-500">
              Notifikasi diblokir di pengaturan sistem — aktifkan izin untuk aplikasi ini jika ingin
              melihat popup.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  )
}
