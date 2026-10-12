import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

function Spinner({ className, label = 'Memuat' }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary-hover" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default Spinner
