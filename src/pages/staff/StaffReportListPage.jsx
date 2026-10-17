import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  FileText,
  Hourglass,
  Inbox,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import {
  CategoryBadge,
  StatusBadge,
} from '../../features/reports/components/badges'
import { useStaffReports } from '../../features/reports/hooks'
import { CATEGORIES, STATUSES } from '../../lib/constants'
import { displayReporter } from '../../lib/displayReporter'
import { dueState, formatDateOnly, parseDateOnly, startOfToday } from '../../lib/formatDate'
import { cn } from '../../lib/cn'

const ALL = ''
const withAll = (label, items) => [
  { value: ALL, label },
  ...items.map((item) => ({ value: item.value, label: item.label })),
]

const CATEGORY_OPTIONS = withAll('Semua kategori', CATEGORIES)
const STATUS_FILTERS = [
  { value: ALL, label: 'Semua' },
  ...STATUSES.map(({ value, label }) => ({ value, label })),
]
const STATUS_SUMMARY = [
  { status: 'baru', label: 'Baru', icon: CircleDot, tone: 'blue' },
  { status: 'diproses', label: 'Diproses', icon: Hourglass, tone: 'yellow' },
  { status: 'overdue', label: 'Lewat batas', icon: AlertTriangle, tone: 'coral' },
  { status: 'selesai', label: 'Selesai', icon: CheckCircle2, tone: 'green' },
]

function SummaryCard({ icon: Icon, label, value, tone }) {
  const toneClasses = {
    blue: 'bg-report-blue',
    yellow: 'bg-report-yellow',
    coral: 'bg-report-coral',
    green: 'bg-report-green',
  }
  const iconClasses = {
    blue: 'text-[#3156a5]',
    yellow: 'text-[#80600b]',
    coral: 'text-danger',
    green: 'text-[#216b49]',
  }

  return (
    <div
      className={cn(
        'min-h-28 rounded-[20px] p-3 shadow-[0_8px_24px_rgba(18,55,42,0.05)]',
        toneClasses[tone],
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-white/80">
        <Icon aria-hidden="true" className={cn('size-5', iconClasses[tone])} />
      </span>
      <p className="mt-2 text-3xl font-extrabold leading-none text-navy">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold leading-none text-navy/80">{label}</p>
    </div>
  )
}

function dueDescription(report) {
  if (report.status === 'selesai') return 'Selesai'
  const state = dueState(report.batasKlarifikasi)
  if (state === 'overdue') {
    const dueDate = parseDateOnly(report.batasKlarifikasi)
    const daysLate = Math.max(
      1,
      Math.floor((startOfToday().getTime() - dueDate.getTime()) / 86400000),
    )
    return `Lewat ${daysLate} hari`
  }
  if (state === 'today') return 'Batas: hari ini'
  if (state === 'upcoming') {
    const dueDate = parseDateOnly(report.batasKlarifikasi)
    const daysUntil = Math.floor(
      (dueDate.getTime() - startOfToday().getTime()) / 86400000,
    )
    return daysUntil === 1 ? 'Batas: besok' : `Batas: ${formatDateOnly(report.batasKlarifikasi)}`
  }
  return 'Batas belum ditentukan'
}

function isOverdue(report) {
  return report.status !== 'selesai' && dueState(report.batasKlarifikasi) === 'overdue'
}

export default function StaffReportListPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    page: 1,
    status: ALL,
    kategori: ALL,
  })
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch, isFetching } =
    useStaffReports(filters)
  const newReports = useStaffReports({ page: 1, status: 'baru' })
  const inProgressReports = useStaffReports({ page: 1, status: 'diproses' })
  const completedReports = useStaffReports({ page: 1, status: 'selesai' })
  const statusQueries = [newReports, inProgressReports, completedReports]

  const update = (patch) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }))
  const visibleReports = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('id')
    if (!needle) return data?.items ?? []
    return (data?.items ?? []).filter((report) =>
      [report.noLaporan, report.isi, displayReporter(report)]
        .join(' ')
        .toLocaleLowerCase('id')
        .includes(needle),
    )
  }, [data?.items, search])

  const isStatsLoading = statusQueries.some((query) => query.isLoading)
  const isStatsError = statusQueries.some((query) => query.isError)
  const overdueCount = (data?.items ?? []).filter(isOverdue).length
  const summaries = [
    newReports.data?.meta.total ?? 0,
    inProgressReports.data?.meta.total ?? 0,
    overdueCount,
    completedReports.data?.meta.total ?? 0,
  ]

  return (
    <div className="flex flex-col gap-4">
      <header>
        <span className="inline-flex rounded-full bg-[#ffe8a3] px-3 py-1 text-[11px] font-bold text-[#12372a]">
          Halo, {user?.name}
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Daftar laporan
        </h1>
        <p className="mt-1 text-sm text-body">
          Kelola dan tindak lanjuti laporan yang masuk.
        </p>
      </header>

      <section
        aria-label="Ringkasan status laporan"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {STATUS_SUMMARY.map((item, index) =>
          isStatsLoading || (item.status === 'overdue' && isLoading) ? (
            <Skeleton key={item.status} className="h-28 rounded-3xl" />
          ) : (
            <SummaryCard
              key={item.status}
              icon={item.icon}
              label={item.label}
              value={summaries[index]}
              tone={item.tone}
            />
          ),
        )}
      </section>

      <section aria-label="Cari dan saring laporan" className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Cari di halaman ini</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-body"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor atau isi laporan"
              className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm text-navy shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((item) => {
              const active = filters.status === item.value
              return (
                <button
                  key={item.value || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ status: item.value })}
                  className={cn(
                    'min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    active
                      ? 'bg-primary text-white shadow-[0_5px_14px_rgba(18,55,42,0.18)]'
                      : 'bg-white text-navy shadow-sm hover:bg-mint-50',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
        <details className="text-xs text-body">
          <summary className="w-fit cursor-pointer font-semibold text-[#315344]">
            Filter kategori
          </summary>
          <div className="mt-2">
            <Select
              id="filter-kategori"
              label="Kategori laporan"
              options={CATEGORY_OPTIONS}
              value={filters.kategori}
              className="h-10 rounded-full py-0 text-sm sm:w-64"
              onChange={(event) => update({ kategori: event.target.value })}
            />
          </div>
        </details>
      </section>

      {isError || isStatsError ? (
        <ErrorState
          message="Daftar laporan gagal dimuat. Coba lagi sebentar."
          onRetry={() => {
            refetch()
            statusQueries.forEach((query) => query.refetch())
          }}
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : visibleReports.length ? (
        <>
          <p className="text-sm text-body" aria-live="polite">
            {search.trim()
              ? `${visibleReports.length} hasil pada halaman ini`
              : `${data.meta.total} laporan`}
            {isFetching ? ' · memuat ulang…' : ''}
          </p>
          <ul className="flex flex-col gap-3">
            {visibleReports.map((report) => {
              const overdue = isOverdue(report)
              return (
                <li key={report.id}>
                  <Link
                    to={`/petugas/laporan/${report.id}`}
                    className={cn(
                      'grid gap-4 rounded-3xl p-4 shadow-[0_8px_24px_rgba(18,55,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(18,55,42,0.1)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5',
                      overdue
                        ? 'bg-[#fff2eb]'
                        : 'bg-white',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans text-base font-extrabold text-navy">
                          {report.noLaporan}
                        </span>
                        {overdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-salmon px-2.5 py-1 text-[11px] font-bold text-white">
                            <AlertTriangle aria-hidden="true" className="size-3.5" />
                            Lewat batas
                          </span>
                        ) : null}
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-navy" data-pre-wrap>
                        {report.isi}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CategoryBadge kategori={report.kategori} />
                        <span className="text-xs text-body">
                          {displayReporter(report)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:min-w-32 sm:flex-col sm:items-end">
                      <span
                        className={cn(
                          'font-bold',
                          overdue ? 'text-danger' : 'text-navy',
                        )}
                      >
                        {dueDescription(report)}
                      </span>
                      <span className="text-body">
                        {formatDateOnly(report.batasKlarifikasi)}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Pagination
            page={data.meta.currentPage}
            lastPage={data.meta.lastPage}
            onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      ) : (
        <EmptyState
          icon={search.trim() || filters.status || filters.kategori ? Inbox : FileText}
          title={search.trim() ? 'Tidak ada hasil di halaman ini' : 'Belum ada laporan'}
          description={
            search.trim()
              ? 'Coba kata kunci lain atau pindah halaman untuk mencari laporan lainnya.'
              : filters.status || filters.kategori
                ? 'Tidak ada laporan yang cocok dengan filter ini.'
                : 'Laporan yang masuk akan tampil di sini.'
          }
          action={
            search.trim() || filters.status || filters.kategori ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilters({ page: 1, status: ALL, kategori: ALL })
                }}
                className="font-semibold text-primary-hover hover:underline"
              >
                Bersihkan pencarian dan filter
              </button>
            ) : null
          }
        />
      )}
    </div>
  )
}
