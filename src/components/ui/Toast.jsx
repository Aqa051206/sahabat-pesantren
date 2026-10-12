import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { ToastContext } from './toast-context'

const TONES = {
  success: {
    icon: CheckCircle2,
    className: 'border-status-done/30 bg-status-done-bg text-status-done',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-danger/30 bg-danger-bg text-danger',
  },
  info: {
    icon: Info,
    className: 'border-status-process/30 bg-status-process-bg text-status-process',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, tone = 'info') => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => {
          const config = TONES[toast.tone] ?? TONES.info
          const Icon = config.icon
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg',
                config.className,
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => dismiss(toast.id)}
                className="rounded-full p-1 hover:bg-black/5"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
