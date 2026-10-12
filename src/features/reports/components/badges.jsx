import {
  CheckCircle2,
  CircleDot,
  Hourglass,
} from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUSES,
} from '../../../lib/constants'

const STATUS_ICONS = {
  baru: CircleDot,
  diproses: Hourglass,
  selesai: CheckCircle2,
}

export function StatusBadge({ status }) {
  const meta = STATUSES.find((item) => item.value === status)
  return (
    <Badge tone={meta?.tone ?? 'neutral'} icon={STATUS_ICONS[status]}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function CategoryBadge({ kategori }) {
  return <Badge tone="gold">{CATEGORY_LABELS[kategori] ?? kategori}</Badge>
}
