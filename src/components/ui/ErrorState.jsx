import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'

function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi gangguan saat mengambil data. Coba lagi sebentar.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-danger/20 bg-danger-bg px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle aria-hidden="true" className="size-8 text-danger" />
      <h3 className="text-xl text-navy">{title}</h3>
      <p className="max-w-md text-sm text-body">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full border border-danger/40 px-5 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}

export default ErrorState
