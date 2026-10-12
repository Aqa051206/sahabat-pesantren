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

// Logout otomatis karena tidak aktif. Menampilkan hitung mundur 30 detik
// terakhir lewat `secondsLeft` (null bila tidak ada peringatan).
export function useIdleTimer({ enabled = true, timeoutSeconds, warnSeconds = 30, onIdle }) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const lastActivity = useRef(0)
  const warning = useRef(false)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const stay = useCallback(() => {
    lastActivity.current = Date.now()
    warning.current = false
    setSecondsLeft(null)
  }, [])

  useEffect(() => {
    if (!enabled || !timeoutSeconds) return undefined

    const timeoutMs = timeoutSeconds * 1000
    const warnMs = warnSeconds * 1000
    lastActivity.current = Date.now()

    const tick = () => {
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
      lastActivity.current = Date.now()
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
