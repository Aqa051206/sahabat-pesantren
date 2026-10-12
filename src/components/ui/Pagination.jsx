import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

function Pagination({ page, lastPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-between gap-4 pt-2"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Sebelumnya
      </Button>
      <p className="text-sm text-body" aria-live="polite">
        Halaman {page} dari {lastPage}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= lastPage}
      >
        Berikutnya
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </nav>
  )
}

export default Pagination
