import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Hourglass,
  Minus,
  ShieldAlert,
} from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUSES,
  URGENCIES,
  URGENCY_LABELS,
} from '../../../lib/constants'

const STATUS_ICONS = {
  baru: CircleDot,
  diproses: Hourglass,
  selesai: CheckCircle2,
}

const URGENCY_ICONS = {
  biasa: Minus,
  perlu_perhatian: ShieldAlert,
  darurat: AlertTriangle,
}

export function StatusBadge({ status }) {
  const meta = STATUSES.find((item) => item.value === status)
  return (
    <Badge tone={meta?.tone ?? 'neutral'} icon={STATUS_ICONS[status]}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function UrgencyBadge({ urgensi }) {
  const meta = URGENCIES.find((item) => item.value === urgensi)
  return (
    <Badge tone={meta?.tone ?? 'neutral'} icon={URGENCY_ICONS[urgensi]}>
      {URGENCY_LABELS[urgensi] ?? urgensi}
    </Badge>
  )
}

export function CategoryBadge({ kategori }) {
  return <Badge tone="gold">{CATEGORY_LABELS[kategori] ?? kategori}</Badge>
}
