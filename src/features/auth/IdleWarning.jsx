import { Timer } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Button from '../../components/ui/Button'

export function IdleWarning({ secondsLeft, onStay, onLogout }) {
  const stayRef = useRef(null)

  useEffect(() => {
    if (secondsLeft !== null) stayRef.current?.focus()
  }, [secondsLeft])

  if (secondsLeft === null) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-white p-6 text-center shadow-xl"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber/15 text-primary">
          <Timer aria-hidden="true" className="size-6" />
        </span>
        <h2 id="idle-title" className="mt-3 text-xl">
          Masih di sana?
        </h2>
        <p className="mt-1 text-sm text-body">
          Demi keamanan, sesi ini akan berakhir otomatis dalam{' '}
          <strong className="text-navy">{secondsLeft} detik</strong>.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button ref={stayRef} onClick={onStay}>
            Tetap di sini
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            Keluar sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}
