import { AlertTriangle, FileText, Inbox } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import {
  CategoryBadge,
  StatusBadge,
  UrgencyBadge,
} from '../../features/reports/components/badges'
import { useStaffReports } from '../../features/reports/hooks'
import {
  CATEGORIES,
  REPORT_RECIPIENTS,
  STATUSES,
  URGENCIES,
} from '../../lib/constants'
import { displayReporter } from '../../lib/displayReporter'
import { dueState, formatDateOnly } from '../../lib/formatDate'

const ALL = ''
const withAll = (label, items) => [
  { value: ALL, label },
  ...items.map((item) => ({ value: item.value, label: item.label })),
]

const STATUS_OPTIONS = withAll('Semua status', STATUSES)
const CATEGORY_OPTIONS = withAll('Semua kategori', CATEGORIES)
const URGENCY_OPTIONS = withAll('Semua urgensi', URGENCIES)

function DueNote({ batasKlarifikasi, status }) {
  if (status === 'selesai' || !batasKlarifikasi) return null
  const state = dueState(batasKlarifikasi)
  if (state === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger">
        <AlertTriangle aria-hidden="true" className="size-4" />
        Lewat batas klarifikasi
      </span>
    )
  }
  if (state === 'today') {
    return (
      <span className="text-xs font-semibold text-primary-hover">
        Batas klarifikasi hari ini
      </span>
    )
  }
  return (
    <span className="text-xs text-body">
      Batas klarifikasi {formatDateOnly(batasKlarifikasi)}
    </span>
  )
}

export default function StaffReportListPage() {
  const [filters, setFilters] = useState({
    page: 1,
    status: ALL,
    kategori: ALL,
    urgensi: ALL,
  })
  const { data, isLoading, isError, refetch, isFetching } =
    useStaffReports(filters)

  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }))

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-3xl">Daftar Laporan</h1>
        <p className="mt-1 text-body">
          Kelola dan tindak lanjuti laporan yang masuk.
        </p>
      </header>

      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            id="filter-status"
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
          />
          <Select
            id="filter-kategori"
            label="Kategori"
            options={CATEGORY_OPTIONS}
            value={filters.kategori}
            onChange={(event) => update({ kategori: event.target.value })}
          />
          <Select
            id="filter-urgensi"
            label="Urgensi"
            options={URGENCY_OPTIONS}
            value={filters.urgensi}
            onChange={(event) => update({ urgensi: event.target.value })}
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          message="Daftar laporan gagal dimuat. Coba lagi sebentar."
          onRetry={refetch}
        />
      ) : data?.items.length ? (
        <>
          <p className="mb-3 text-sm text-body" aria-live="polite">
            {data.meta.total} laporan
            {isFetching ? ' · memuat ulang…' : ''}
          </p>
          <ul className="flex flex-col gap-3">
            {data.items.map((report) => (
              <li key={report.kode}>
                <Link
                  to={`/petugas/laporan/${report.kode}`}
                  className="block rounded-3xl border border-border/70 bg-band-1 p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-xl font-semibold text-primary">
                      {report.kode}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CategoryBadge kategori={report.kategori} />
                    <UrgencyBadge urgensi={report.urgensi} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-body" data-pre-wrap>
                    {report.isi}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-body">
                    <span>
                      {displayReporter(report)}{' '}
                      · {REPORT_RECIPIENTS[report.penerima] ?? 'Pengurus'} ·{' '}
                      {formatDateOnly(report.createdAt)}
                    </span>
                    <DueNote
                      batasKlarifikasi={report.batasKlarifikasi}
                      status={report.status}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Pagination
              page={data.meta.currentPage}
              lastPage={data.meta.lastPage}
              onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Belum ada laporan"
          description={
            filters.status || filters.kategori || filters.urgensi
              ? 'Tidak ada laporan yang cocok dengan filter ini.'
              : 'Laporan yang masuk akan tampil di sini.'
          }
          action={
            filters.status || filters.kategori || filters.urgensi ? (
              <button
                type="button"
                onClick={() =>
                  setFilters({ page: 1, status: ALL, kategori: ALL, urgensi: ALL })
                }
                className="font-semibold text-primary-hover hover:underline"
              >
                Bersihkan filter
              </button>
            ) : (
              <FileText aria-hidden="true" className="size-5 text-body" />
            )
          }
        />
      )}
    </div>
  )
}
