import { Sparkles } from 'lucide-react'
import { USE_MOCK } from '../lib/env'

// Pita kecil tetap yang menandai data contoh saat mode mock aktif.
function DemoBanner() {
  if (!USE_MOCK) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-amber/15 px-4 py-1.5 text-center text-xs font-semibold text-navy">
      <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
      Mode demo · data contoh
    </div>
  )
}

export default DemoBanner
