import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Skeleton from '../../components/ui/Skeleton'
import { useSummary } from '../../features/dashboard/hooks'
import { StatusBadge } from '../../features/reports/components/badges'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
  URGENCIES,
  URGENCY_LABELS,
} from '../../lib/constants'
import { cn } from '../../lib/cn'

function StatCard({ icon: Icon, label, value, tone = 'default', hint }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-2xl',
            tone === 'danger'
              ? 'bg-danger-bg text-danger'
              : 'bg-amber/15 text-primary',
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-body">{label}</p>
          <p className="text-3xl font-semibold text-navy">{value}</p>
        </div>
      </div>
      {hint ? <p className="mt-3 text-sm text-body">{hint}</p> : null}
    </Card>
  )
}

function Breakdown({ title, entries }) {
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {entries.map(([key, count]) => {
          const percent = total ? Math.round((count / total) * 100) : 0
          return (
            <li key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-navy">{key}</span>
                <span className="text-body">{count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-primary-hover"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useSummary()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Ringkasan gagal dimuat"
        message="Coba muat ulang dashboard."
        onRetry={refetch}
      />
    )
  }

  const statusEntries = STATUSES.map((status) => ({
    value: status.value,
    count: data.perStatus[status.value] ?? 0,
  }))

  const kategoriEntries = CATEGORIES.map((category) => [
    CATEGORY_LABELS[category.value],
    data.perKategori[category.value] ?? 0,
  ]).filter(([, count]) => count > 0)

  const urgensiEntries = URGENCIES.map((urgency) => [
    URGENCY_LABELS[urgency.value],
    data.perUrgensi[urgency.value] ?? 0,
  ])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-1 text-body">
          Gambaran umum laporan dan status penanganannya.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={ClipboardList}
          label="Total laporan"
          value={data.total}
          hint="Seluruh laporan yang tercatat."
        />
        <StatCard
          icon={AlertTriangle}
          label="Melewati batas klarifikasi"
          value={data.melewatiBatas}
          tone={data.melewatiBatas > 0 ? 'danger' : 'default'}
          hint="Belum selesai dan sudah melewati batas."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <BarChart3 aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-lg font-semibold text-navy">Per status</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {statusEntries.map((entry) => (
              <div key={entry.value} className="flex items-center gap-2">
                <StatusBadge status={entry.value} />
                <span className="text-lg font-semibold text-navy">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/petugas"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
          >
            <TrendingUp aria-hidden="true" className="size-4" />
            Lihat semua laporan
          </Link>
        </Card>

        <Breakdown title="Per urgensi" entries={urgensiEntries} />
      </div>

      {kategoriEntries.length ? (
        <Breakdown title="Per kategori" entries={kategoriEntries} />
      ) : null}
    </div>
  )
}
