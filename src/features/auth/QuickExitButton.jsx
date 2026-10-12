import { LogOut } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuth } from './auth-context'

// Selalu terlihat di halaman santri, tanpa konfirmasi.
export function QuickExitButton({ className }) {
  const { quickExit } = useAuth()

  return (
    <Button variant="danger" size="sm" className={className} onClick={quickExit}>
      <LogOut aria-hidden="true" className="size-4" />
      Keluar Cepat
    </Button>
  )
}
