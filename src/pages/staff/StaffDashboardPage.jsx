import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Skeleton from '../../components/ui/Skeleton'
import { useStaffReports } from '../../features/reports/hooks'
import { StatusBadge, CategoryBadge } from '../../features/reports/components/badges'
import { formatDateOnly } from '../../lib/formatDate'
import { cn } from '../../lib/cn'

const STAT_ITEMS = [
  { label: 'Total laporan', icon: ClipboardList },
  { label: 'Laporan baru', icon: LayoutDashboard },
  { label: 'Sedang diproses', icon: Clock3 },
  { label: 'Selesai', icon: CheckCircle2 },
]

function SummaryCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={cn(
        'min-h-28 rounded-[20px] border border-[#e1e9e2] p-3 shadow-[0_2px_10px_rgba(18,55,42,0.06)]',
        highlight ? 'bg-report-yellow' : 'bg-white',
      )}
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-xl bg-white/80',
          highlight ? 'text-[#80600b]' : 'text-primary',
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-2 text-3xl font-extrabold leading-none tracking-tight text-navy">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-none text-navy/80">{label}</p>
    </div>
  )
}

export default function StaffDashboardPage() {
  const reportsQuery = useStaffReports({})
  const reports = reportsQuery.data?.items ?? []
  const isLoading = reportsQuery.isLoading
  const isError = reportsQuery.isError

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STAT_ITEMS.map(({ label }) => (
            <Skeleton key={label} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (isError || !reportsQuery.data) {
    return (
      <ErrorState
        title="Ringkasan gagal dimuat"
        message="Coba muat ulang dashboard."
        onRetry={() => reportsQuery.refetch()}
      />
    )
  }

  const statValues = [
    reports.length,
    reports.filter((report) => report.status === 'baru').length,
    reports.filter((report) => report.status === 'diproses').length,
    reports.filter((report) => report.status === 'selesai').length,
  ]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-[#ffe8a3] px-3 py-1 text-[11px] font-bold text-[#12372a]">
            Dashboard pengurus
          </p>
          <h1 className="text-3xl font-extrabold text-navy">Dashboard</h1>
          <p className="mt-1 text-body">
            Gambaran laporan yang diteruskan kepada peranmu.
          </p>
        </div>
        <Link
          to="/petugas"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(18,55,42,0.12)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          Lihat daftar laporan
        </Link>
      </header>

      <section
        aria-label="Ringkasan jumlah laporan"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {STAT_ITEMS.map(({ icon, label }, index) => (
          <SummaryCard
            key={label}
            icon={icon}
            label={label}
            value={statValues[index]}
            highlight={index === 1}
          />
        ))}
      </section>

      <section aria-labelledby="recent-reports-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2
              id="recent-reports-title"
              className="text-xl font-bold text-navy"
            >
              Laporan terbaru
            </h2>
            <p className="mt-1 text-sm text-body">
              Identitas pelapor tidak ditampilkan di ringkasan ini.
            </p>
          </div>
        </div>
        {reports.length ? (
          <ul className="grid gap-3">
            {reports.slice(0, 6).map((report) => (
              <li key={report.id}>
                <Link
                  to={`/petugas/laporan/${report.id}`}
                  className="block rounded-3xl border border-[#e1e9e2] bg-white p-4 shadow-[0_2px_10px_rgba(18,55,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cbd9ce] hover:shadow-[0_4px_14px_rgba(18,55,42,0.08)] sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy">
                        Laporan #{report.noLaporan}
                      </p>
                      <p className="mt-1 text-sm text-body">
                        {formatDateOnly(report.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="mt-4">
                    <CategoryBadge kategori={report.kategori} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="!border !border-[#e1e9e2] !shadow-[0_2px_10px_rgba(18,55,42,0.06)] p-6">
            <EmptyState
              title="Belum ada laporan"
              description="Laporan yang diteruskan kepada peranmu akan tampil di sini."
            />
          </Card>
        )}
      </section>
    </div>
  )
}
