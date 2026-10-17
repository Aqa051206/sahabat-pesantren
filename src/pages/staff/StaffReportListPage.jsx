import { FileText, Inbox } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../features/auth/auth-context'
import {
  CategoryBadge,
  StatusBadge,
} from '../../features/reports/components/badges'
import { useStaffReports } from '../../features/reports/hooks'
import {
  CATEGORIES,
  PAGE_SIZE,
  STATUSES,
} from '../../lib/constants'
import { displayReporter } from '../../lib/displayReporter'
import { formatDateOnly } from '../../lib/formatDate'

const ALL = ''
const withAll = (label, items) => [
  { value: ALL, label },
  ...items.map((item) => ({ value: item.value, label: item.label })),
]

const STATUS_OPTIONS = withAll('Semua status', STATUSES)
const CATEGORY_OPTIONS = withAll('Semua kategori', CATEGORIES)

export default function StaffReportListPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    page: 1,
    status: ALL,
    kategori: ALL,
    kodeLaporan: '',
  })
  const { data, isLoading, isError, refetch, isFetching } =
    useStaffReports(filters)
  const reports = data?.items ?? []
  const pageReports = reports.slice(
    (filters.page - 1) * PAGE_SIZE,
    filters.page * PAGE_SIZE,
  )
  const lastPage = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))

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
          <Input
            id="filter-kode-laporan"
            label="Kode laporan"
            placeholder="Cari kode laporan"
            autoComplete="off"
            value={filters.kodeLaporan}
            onChange={(event) => update({ kodeLaporan: event.target.value })}
          />
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
      ) : reports.length ? (
        <>
          <p className="mb-3 text-sm text-body" aria-live="polite">
            {reports.length} laporan
            {isFetching ? ' · memuat ulang…' : ''}
          </p>
          <ul className="flex flex-col gap-3">
            {pageReports.map((report) => (
              <li key={report.id}>
                <Link
                  to={`/petugas/laporan/${report.id}`}
                  className="block rounded-3xl border border-border/70 bg-white p-5 shadow-sm transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-xl font-semibold text-primary">
                      {report.noLaporan}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CategoryBadge kategori={report.kategori} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-body" data-pre-wrap>
                    {report.isi}
                  </p>
                  <p className="mt-3 text-xs text-body">
                    {displayReporter(report, user?.role)} · {formatDateOnly(report.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Pagination
              page={filters.page}
              lastPage={lastPage}
              onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Belum ada laporan"
          description={
            filters.status || filters.kategori || filters.kodeLaporan
              ? 'Tidak ada laporan yang cocok dengan filter ini.'
              : 'Laporan yang masuk akan tampil di sini.'
          }
          action={
            filters.status || filters.kategori || filters.kodeLaporan ? (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    page: 1,
                    status: ALL,
                    kategori: ALL,
                    kodeLaporan: '',
                  })
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
