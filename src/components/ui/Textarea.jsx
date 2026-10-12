import { CircleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

function Textarea({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  rows = 6,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-body/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/30',
          error ? 'border-danger' : 'border-border hover:border-primary/60',
          className,
        )}
        {...props}
      />
      {hint && !error ? <p className="text-sm text-body">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" aria-live="polite" className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

export default Textarea
