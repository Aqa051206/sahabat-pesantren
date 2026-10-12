import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Skeleton from '../../components/ui/Skeleton'
import Switch from '../../components/ui/Switch'
import { useToast } from '../../components/ui/toast-context'
import { Conversation } from '../../features/conversations/Conversation'
import {
  CategoryBadge,
  StatusBadge,
} from '../../features/reports/components/badges'
import { useReport, useUpdateIdentity } from '../../features/reports/hooks'
import { formatDateOnly } from '../../lib/formatDate'

export default function SantriReportDetailPage() {
  const { id } = useParams()
  const { data: report, isLoading, isError, error, refetch } = useReport(id)
  const updateIdentity = useUpdateIdentity(id)
  const toast = useToast()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError || !report) {
    const notFound = error?.status === 404
    if (notFound) {
      return (
        <EmptyState
          icon={FileQuestion}
          title="Laporan tidak ditemukan"
          description="Pastikan nomor laporannya benar."
          action={
            <Link
              to="/santri/laporan-saya"
              className="font-semibold text-primary-hover hover:underline"
            >
              Kembali ke Laporan Saya
            </Link>
          }
        />
      )
    }
    return (
      <ErrorState
        title="Laporan tidak dapat dibuka"
        message={error?.message ?? 'Terjadi gangguan saat membuka laporan.'}
        onRetry={refetch}
      />
    )
  }

  const toggleIdentity = (next) => {
    updateIdentity.mutate(next, {
      onError: (mutationError) =>
        toast.showToast(
          mutationError?.message ?? 'Gagal mengubah pengaturan nama.',
          'error',
        ),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/santri/laporan-saya"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-hover hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Kembali ke Laporan Saya
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-sans text-2xl font-semibold text-primary">
            {report.noLaporan}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryBadge kategori={report.kategori} />
        </div>
        <p className="mt-4 text-sm text-body">
          Dibuat {formatDateOnly(report.createdAt)}
        </p>
        <p className="mt-3 rounded-2xl bg-white p-4" data-pre-wrap>
          {report.isi}
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <Switch
          id="identity-toggle"
          label="Tampilkan namaku ke petugas"
          description={
            report.tampilkanIdentitas
              ? 'Pengurus dan pimpinan dapat melihat namamu sesuai pilihanmu.'
              : 'Pengurus dan pimpinan tidak dapat melihat namamu selama pilihan ini mati.'
          }
          checked={report.tampilkanIdentitas}
          disabled={updateIdentity.isPending}
          onChange={toggleIdentity}
        />
      </Card>

      <Conversation id={id} viewer="santri" />
    </div>
  )
}
