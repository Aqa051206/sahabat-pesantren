import { Bell, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../features/auth/auth-context'
import { getNotificationCategories } from '../features/notifications/categories'
import { useNotificationSummary } from '../features/notifications/hooks'
import { cn } from '../lib/cn'
import { ROLES, ROLE_LABELS } from '../lib/constants'

export default function NotifikasiPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, isFetching, refetch } =
    useNotificationSummary()

  const role = user?.role
  const categories = getNotificationCategories(role, data)
  const total = Number(data?.total ?? 0)
  const isSantri = role === ROLES.SANTRI

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-[#ffe8a3] px-3 py-1 text-[11px] font-bold text-[#12372a]">
            {ROLE_LABELS[role] ?? 'Pengguna'}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Notifikasi
          </h1>
          <p className="mt-1 text-sm text-body">
            Ringkasan pembaruan yang perlu kamu periksa.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={isFetching}
          onClick={() => refetch()}
        >
          {isFetching ? null : (
            <RefreshCw aria-hidden="true" className="size-4" />
          )}
          Muat ulang
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : isError || !data ? (
        <ErrorState
          title="Notifikasi gagal dimuat"
          message="Coba muat ulang ringkasan notifikasi."
          onRetry={refetch}
        />
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ffd166] text-[#163b2f]">
                <Bell aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-body">Total pembaruan</p>
                <p className="text-3xl font-extrabold leading-none text-navy">
                  {total}
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm text-body">
              {total > 0
                ? isSantri
                  ? 'Buka laporan atau percakapan terkait untuk menandai notifikasi sudah dibaca.'
                  : 'Buka detail laporan atau percakapan terkait untuk menandai notifikasi sudah dibaca.'
                : 'Semua pembaruan sudah kamu baca.'}
            </p>
          </Card>

          {total > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map(
                ({ key, label, description, icon: Icon, count, to }) => (
                  <Card
                    key={key}
                    className={cn(
                      'p-5',
                      count > 0 ? 'border-[#c98269]' : 'border-[#d3e2d8]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                          count > 0
                            ? 'bg-[#ffddd1] text-[#ba4c30]'
                            : 'bg-band-1 text-body',
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <Badge
                        tone={count > 0 ? 'coral' : 'neutral'}
                      >
                        {count > 0 ? `${count} laporan` : 'Tidak ada'}
                      </Badge>
                    </div>
                    <h2 className="mt-3 text-lg font-extrabold text-navy">
                      {label}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-body">
                      {description}
                    </p>
                    <Link
                      to={to}
                      className="mt-3 inline-flex text-sm font-semibold text-primary-hover hover:underline"
                    >
                      Buka laporan terkait
                    </Link>
                  </Card>
                ),
              )}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="Tidak ada notifikasi baru"
              description="Pembaruan baru akan muncul di sini saat ada laporan, pesan, atau permintaan identitas."
            />
          )}

          <p className="text-xs text-body">
            Notifikasi dihitung ulang saat halaman dimuat dan setiap 30 detik.
            Membuka detail laporan atau daftar pesan akan menandainya sudah
            dibaca.
          </p>
        </>
      )}
    </div>
  )
}
