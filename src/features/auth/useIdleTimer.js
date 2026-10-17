import { useCallback, useEffect, useRef, useState } from 'react'

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
  'focus',
]

// Aktivitas dibagi antar-tab lewat localStorage agar satu browser memakai satu
// sesi: bergerak di tab mana pun menahan logout otomatis di semua tab.
const ACTIVITY_KEY = 'sp.activity'
const ACTIVITY_WRITE_MS = 5000

const readSharedActivity = () => {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0
  } catch {
    return 0
  }
}

const writeSharedActivity = (value) => {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(value))
  } catch {
    // storage tidak tersedia: abaikan
  }
}

// Logout otomatis karena tidak aktif. Menampilkan hitung mundur 30 detik
// terakhir lewat `secondsLeft` (null bila tidak ada peringatan).
export function useIdleTimer({ enabled = true, timeoutSeconds, warnSeconds = 30, onIdle }) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const lastActivity = useRef(0)
  const lastWrite = useRef(0)
  const warning = useRef(false)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const stay = useCallback(() => {
    const now = Date.now()
    lastActivity.current = now
    lastWrite.current = now
    writeSharedActivity(now)
    warning.current = false
    setSecondsLeft(null)
  }, [])

  useEffect(() => {
    if (!enabled || !timeoutSeconds) return undefined

    const timeoutMs = timeoutSeconds * 1000
    const warnMs = warnSeconds * 1000
    const start = Date.now()
    lastActivity.current = Math.max(start, readSharedActivity())
    lastWrite.current = start

    const tick = () => {
      const shared = readSharedActivity()
      if (shared > lastActivity.current) lastActivity.current = shared

      const elapsed = Date.now() - lastActivity.current
      const remaining = timeoutMs - elapsed

      if (remaining <= 0) {
        onIdleRef.current?.()
        return
      }

      const shouldWarn = remaining <= warnMs
      if (shouldWarn || warning.current) {
        warning.current = shouldWarn
        setSecondsLeft(shouldWarn ? Math.ceil(remaining / 1000) : null)
      }
    }

    const handleActivity = () => {
      if (warning.current) return
      const current = Date.now()
      lastActivity.current = current
      if (current - lastWrite.current > ACTIVITY_WRITE_MS) {
        lastWrite.current = current
        writeSharedActivity(current)
      }
    }

    const interval = window.setInterval(tick, 1000)
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    )

    return () => {
      window.clearInterval(interval)
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      )
    }
  }, [enabled, timeoutSeconds, warnSeconds])

  return { secondsLeft, stay }
}
