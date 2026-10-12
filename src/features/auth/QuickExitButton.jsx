import { LogOut } from 'lucide-react'
import { useAuth } from './auth-context'

// Selalu terlihat di halaman santri, tanpa konfirmasi.
export function QuickExitButton({ className }) {
  const { quickExit } = useAuth()

  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-band-1 ${className ?? ''}`}
      onClick={quickExit}
    >
      <LogOut aria-hidden="true" className="size-4" />
      Keluar Cepat
    </button>
  )
}
