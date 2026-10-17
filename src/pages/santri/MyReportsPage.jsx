import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import ButtonLink from '../../components/ui/ButtonLink'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Pagination from '../../components/ui/Pagination'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import {
  CategoryBadge,
  StatusBadge,
} from '../../features/reports/components/badges'
import { useMyReports } from '../../features/reports/hooks'
import { CATEGORIES, PAGE_SIZE, STATUSES } from '../../lib/constants'
import { formatDateOnly } from '../../lib/formatDate'

const ALL = ''
const FILTER_STATUSES = [
  { value: ALL, label: 'Semua status' },
  ...STATUSES.map(({ value, label }) => ({ value, label })),
]
const FILTER_CATEGORIES = [
  { value: ALL, label: 'Semua kategori' },
  ...CATEGORIES.map(({ value, label }) => ({ value, label })),
]

export default function MyReportsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    status: ALL,
    kategori: ALL,
    kodeLaporan: '',
  })
  const { data, isLoading, isError, refetch } = useMyReports()
  const reports = (data?.items ?? []).filter((report) => {
    const code = filters.kodeLaporan.trim().toLowerCase()
    return (
      (!filters.status || report.status === filters.status) &&
      (!filters.kategori || report.kategori === filters.kategori) &&
      (!code || String(report.noLaporan ?? '').toLowerCase().includes(code))
    )
  })
  const lastPage = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))
  const pageReports = reports.slice(
    (filters.page - 1) * PAGE_SIZE,
    filters.page * PAGE_SIZE,
  )
  const hasFilters =
    Boolean(filters.status || filters.kategori || filters.kodeLaporan.trim())
  const updateFilter = (patch) =>
    setFilters((current) => ({ ...current, ...patch, page: 1 }))

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Laporan Saya</h1>
          <p className="mt-1 text-body">
            Pantau status dan balasan petugas untuk laporan yang kamu buat.
          </p>
        </div>
        <ButtonLink to="/santri/buat-laporan" size="sm">
          <Plus aria-hidden="true" className="size-4" />
          Buat laporan
        </ButtonLink>
      </header>

      <div className="mb-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            id="my-reports-code-filter"
            label="Kode laporan"
            placeholder="Cari kode laporan"
            autoComplete="off"
            value={filters.kodeLaporan}
            onChange={(event) =>
              updateFilter({ kodeLaporan: event.target.value })
            }
          />
          <Select
            id="my-reports-status-filter"
            label="Status"
            options={FILTER_STATUSES}
            value={filters.status}
            onChange={(event) => updateFilter({ status: event.target.value })}
          />
          <Select
            id="my-reports-category-filter"
            label="Kategori"
            options={FILTER_CATEGORIES}
            value={filters.kategori}
            onChange={(event) => updateFilter({ kategori: event.target.value })}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          message="Laporanmu gagal dimuat. Coba lagi sebentar."
          onRetry={refetch}
        />
      ) : reports.length ? (
        <>
          <p className="mb-3 text-sm text-body" aria-live="polite">
            {reports.length} laporan
          </p>
          <ul className="flex flex-col gap-3">
            {pageReports.map((report) => (
              <li key={report.id}>
                <Link
                  to={`/santri/laporan/${report.id}`}
                  className="block rounded-3xl border border-border/70 bg-band-1 p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-xl font-semibold text-primary">
                      {report.noLaporan}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CategoryBadge kategori={report.kategori} />
                    {report.permintaanIdentitas?.status === 'menunggu' ? (
                      <Badge tone="warning">Ada permintaan untukmu</Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-body" data-pre-wrap>
                    {report.isi}
                  </p>
                  <p className="mt-2 text-xs text-body">
                    Dibuat {formatDateOnly(report.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Pagination
              page={filters.page}
              lastPage={lastPage}
              onChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title={hasFilters ? 'Laporan tidak ditemukan' : 'Belum ada laporan'}
          description={
            hasFilters
              ? 'Tidak ada laporan yang cocok dengan filter ini.'
              : 'Saat kamu siap, kamu bisa membuat laporan pertamamu dengan tenang.'
          }
          action={
            hasFilters ? (
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
              <ButtonLink to="/santri/buat-laporan">
                Buat laporan
              </ButtonLink>
            )
          }
        />
      )}
    </div>
  )
}
