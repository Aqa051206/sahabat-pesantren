import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import ButtonLink from '../../components/ui/ButtonLink'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../features/auth/auth-context'
import { useMyReports } from '../../features/reports/hooks'
import { CATEGORY_LABELS } from '../../lib/constants'
import { formatDateOnly } from '../../lib/formatDate'

const FILTERS = [
  { value: 'semua', label: 'Semua' },
  { value: 'baru', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
]

const EMPTY_REPORTS = []

const STATUS_META = {
  baru: {
    label: 'Baru',
    icon: CircleDot,
    className: 'bg-[#dfeaff] text-[#315d9e]',
  },
  diproses: {
    label: 'Diproses',
    icon: RefreshCw,
    className: 'bg-[#fff0bd] text-[#735b12]',
  },
  selesai: {
    label: 'Selesai',
    icon: CheckCircle2,
    className: 'bg-[#d9f0e1] text-[#31714d]',
  },
}

const CATEGORY_CLASS_NAMES = {
  perundungan: 'bg-[#e8defd] text-[#60469c]',
  kekerasan_fisik: 'bg-[#ffddd1] text-[#a74831]',
  kekerasan_verbal: 'bg-[#fff0bd] text-[#755c10]',
  masalah_pengurus: 'bg-[#dfeaff] text-[#315d9e]',
  masalah_pribadi: 'bg-[#d9f0e1] text-[#31714d]',
  lainnya: 'bg-[#edf0ed] text-[#536158]',
}

const countStatus = (reports, status) =>
  reports.filter((report) => report.status === status).length

function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    icon: CircleDot,
    className: 'bg-[#edf0ed] text-[#536158]',
  }
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}>
      {Icon ? <Icon aria-hidden="true" className="size-3" /> : null}
      {meta.label}
    </span>
  )
}

export default function MyReportsPage() {
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState('semua')
  const { data, isLoading, isError, refetch } = useMyReports(page)
  const { user } = useAuth()
  const reports = data?.items ?? EMPTY_REPORTS
  const visibleReports = useMemo(
    () =>
      activeFilter === 'semua'
        ? reports
        : reports.filter((report) => report.status === activeFilter),
    [activeFilter, reports],
  )

  const stats = [
    {
      label: 'Laporanku',
      value: data?.meta.total ?? 0,
      icon: FileText,
      className: 'bg-[#edf0ed]',
      iconColor: 'text-[#536158]',
    },
    {
      label: 'Menunggu',
      value: countStatus(reports, 'baru'),
      icon: Clock3,
      className: 'bg-[#dfeaff]',
      iconColor: 'text-[#315d9e]',
    },
    {
      label: 'Diproses',
      value: countStatus(reports, 'diproses'),
      icon: RefreshCw,
      className: 'bg-[#fff0bd]',
      iconColor: 'text-[#735b12]',
    },
    {
      label: 'Selesai',
      value: countStatus(reports, 'selesai'),
      icon: CheckCircle2,
      className: 'bg-[#d9f0e1]',
      iconColor: 'text-[#31714d]',
    },
  ]

  return (
    <div className="w-full">
      <header className="mb-6">
        <span className="inline-flex rounded-full bg-[#ffe99e] px-3 py-1 text-[11px] font-semibold text-[#163b2f]">
          Halo, {user?.name}
        </span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#12372a] sm:text-4xl">
              Laporan <span className="underline decoration-[#ffd166] decoration-4 underline-offset-[-2px]">saya</span>
            </h1>
            <p className="mt-2 text-sm text-[#718078]">
              Pantau status dan balasan petugas untuk laporan yang kamu buat.
            </p>
          </div>
          <ButtonLink
            to="/santri/buat-laporan"
            className="!min-h-11 !bg-[#0d352a] !px-5 !text-xs !shadow-[0_8px_20px_rgba(13,53,42,0.2)]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Buat laporan
          </ButtonLink>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => <Skeleton key={stat.label} className="h-32 w-full" />)}
        </div>
      ) : isError ? (
        <ErrorState
          message="Laporanmu gagal dimuat. Coba lagi sebentar."
          onRetry={refetch}
        />
      ) : (
        <>
          <section aria-label="Ringkasan laporan" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, className, iconColor }) => (
              <article key={label} className={`min-h-32 rounded-2xl p-4 shadow-[0_8px_22px_rgba(35,69,48,0.04)] ${className}`}>
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/80">
                  <Icon aria-hidden="true" className={`size-4 ${iconColor}`} />
                </span>
                <p className="mt-2 text-2xl font-extrabold leading-none text-[#12372a]">{value}</p>
                <p className="mt-2 text-xs font-medium text-[#536158]">{label}</p>
              </article>
            ))}
          </section>
          {reports.length ? (
            <p className="mt-2 text-[10px] text-[#7b8980]">
              Status dihitung dari laporan pada halaman ini.
            </p>
          ) : null}

          <div role="group" aria-label="Filter status laporan" className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={activeFilter === value}
                onClick={() => setActiveFilter(value)}
                className={`min-h-10 rounded-full px-4 text-xs font-semibold shadow-[0_5px_14px_rgba(35,69,48,0.05)] transition-colors ${
                  activeFilter === value
                    ? 'bg-[#0d352a] text-white'
                    : 'bg-white text-[#385347] hover:bg-[#e4eee7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {visibleReports.length ? (
            <>
              <ul className="mt-4 flex flex-col gap-3">
                {visibleReports.map((report) => {
                  const hasIdentityRequest =
                    report.permintaanIdentitas?.status === 'menunggu'
                  const categoryClassName =
                    CATEGORY_CLASS_NAMES[report.kategori] ?? 'bg-[#edf0ed] text-[#536158]'

                  return (
                    <li key={report.id}>
                      <Link
                        to={`/santri/laporan/${report.id}`}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border-2 border-[#91a99a] p-4 shadow-[0_3px_0_#12372a,0_8px_18px_rgba(18,55,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#12372a] hover:shadow-[0_4px_0_#12372a,0_12px_24px_rgba(18,55,42,0.08)] ${
                          hasIdentityRequest ? 'bg-[#fff9e5]' : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-[#163b2f]">
                              {report.noLaporan}
                            </span>
                            <StatusPill status={report.status} />
                            {hasIdentityRequest ? (
                              <Badge className="!border-0 !bg-[#0d352a] !px-2.5 !py-1 !text-[10px] !text-[#ffd166]">
                                Ada permintaan untukmu
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#43574d]" data-pre-wrap>
                            {report.isi}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${categoryClassName}`}>
                              {CATEGORY_LABELS[report.kategori] ?? report.kategori}
                            </span>
                            <span className="text-[10px] text-[#718078]">
                              Dibuat {formatDateOnly(report.createdAt)}
                            </span>
                          </div>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9f4ed] text-[#315944] transition-colors group-hover:bg-[#d9ecdf]">
                          <ChevronRight aria-hidden="true" className="size-4" />
                        </span>
                      </Link>
                    </li>
                  )
                })}
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
            <div className="mt-4">
              {reports.length ? (
                <>
                  <EmptyState
                    icon={FileText}
                    title="Tidak ada laporan di status ini pada halaman ini"
                    description="Pindah halaman atau pilih filter lain untuk melihat laporanmu."
                  />
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
          )}
        </>
      )}
    </div>
  )
}
