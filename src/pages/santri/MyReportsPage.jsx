import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '../../components/ui/ButtonLink'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import {
  CategoryBadge,
  StatusBadge,
  UrgencyBadge,
} from '../../features/reports/components/badges'
import { useMyReports } from '../../features/reports/hooks'
import { formatDateOnly } from '../../lib/formatDate'

export default function MyReportsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useMyReports(page)

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
      ) : data?.items.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((report) => (
              <li key={report.kode}>
                <Link
                  to={`/santri/laporan/${report.kode}`}
                  className="block rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(28,42,90,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_34px_rgba(28,42,90,0.1)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-sans text-xl font-semibold text-primary">
                      {report.kode}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CategoryBadge kategori={report.kategori} />
                    <UrgencyBadge urgensi={report.urgensi} />
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
              page={data.meta.currentPage}
              lastPage={data.meta.lastPage}
              onChange={setPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="Belum ada laporan"
          description="Saat kamu siap, kamu bisa membuat laporan pertamamu dengan tenang."
          action={<ButtonLink to="/santri/buat-laporan">Buat laporan</ButtonLink>}
        />
      )}
    </div>
  )
}
