import { useEffect, useRef, useState, type ReactElement } from 'react'

import {
  AppHeader,
  Backdrop,
  isCardEvent,
  PomodoroTimer,
  UpdateNotificationCard,
  UpdateSidebar,
} from './components'

const App = (): ReactElement => {
  const [lastEvent, setLastEvent] = useState<UpdateEvent | null>(null)
  const [offerVersion, setOfferVersion] = useState<string | null>(null)
  const [cardDismissed, setCardDismissed] = useState(true)
  const [appVersion, setAppVersion] = useState<string>('—')
  const [showSidebar, setShowSidebar] = useState(false)
  const [hasShowSidebar, setHasShowSidebar] = useState(false)
  const [downloadActive, setDownloadActive] = useState(false)
  const [smoothPercent, setSmoothPercent] = useState(0)

  const sidebarRef = useRef<HTMLDivElement>(null)
  const progressTargetRef = useRef(0)
  const smoothDisplayRef = useRef(0)

  useEffect(() => {
    void window.electron.getAppVersion().then(setAppVersion)
  }, [])

  useEffect(() => {
    window.electron.onUpdateEvent((ev) => {
      setLastEvent(ev)
      if (ev.type === 'available') {
        setOfferVersion(ev.version)
        setCardDismissed(false)
      }
      if (ev.type === 'not-available') {
        setOfferVersion(null)
      }
      if (ev.type === 'downloaded' || ev.type === 'error') {
        setDownloadActive(false)
      }
    })
  }, [])

  useEffect(() => {
    if (lastEvent?.type === 'progress') {
      progressTargetRef.current = lastEvent.percent
    }
  }, [lastEvent])

  useEffect(() => {
    if (!downloadActive) {
      smoothDisplayRef.current = 0
      setSmoothPercent(0)
      progressTargetRef.current = 0
      return
    }

    let rafId = 0

    const tick = (): void => {
      const prev = smoothDisplayRef.current
      const target = progressTargetRef.current
      const next = Math.abs(target - prev) < 0.25 ? target : prev + (target - prev) * 0.2
      if (next !== prev) {
        smoothDisplayRef.current = next
        setSmoothPercent(next)
      }
      if (Math.abs(progressTargetRef.current - smoothDisplayRef.current) > 0.08) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [downloadActive, lastEvent])

  const startDownload = (): void => {
    progressTargetRef.current = 0
    smoothDisplayRef.current = 0
    setSmoothPercent(0)
    setDownloadActive(true)
    void window.electron.downloadUpdate()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowSidebar(false)
        setHasShowSidebar(true)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSidebar])

  const showCard = !cardDismissed && isCardEvent(lastEvent) && !showSidebar && !hasShowSidebar
  const canInstall = lastEvent?.type === 'downloaded'

  return (
    <div className="relative mx-auto min-h-screen w-full px-28 py-10">
      {showSidebar ? <Backdrop onClose={() => setShowSidebar(false)} /> : null}
      <UpdateSidebar
        sidebarRef={sidebarRef}
        showSidebar={showSidebar}
        lastEvent={lastEvent}
        downloadActive={downloadActive}
        smoothPercent={smoothPercent}
        offerVersion={offerVersion}
        canInstall={canInstall}
        onCheckForUpdates={() => void window.electron.checkForUpdates()}
        onStartDownload={startDownload}
        onQuitAndInstall={() => void window.electron.quitAndInstall()}
      />

      <AppHeader
        appVersion={appVersion}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      <PomodoroTimer />

      {showCard ? (
        <UpdateNotificationCard
          offerVersion={offerVersion}
          lastEvent={lastEvent}
          downloadActive={downloadActive}
          smoothPercent={smoothPercent}
          onDismiss={() => setCardDismissed(true)}
          onStartDownload={startDownload}
          onQuitAndInstall={() => void window.electron.quitAndInstall()}
        />
      ) : null}
    </div>
  )
}

export default App
