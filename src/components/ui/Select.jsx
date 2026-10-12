import { ChevronDown, CircleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

function Select({ id, label, hint, error, options = [], className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-navy transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/30',
            error ? 'border-danger' : 'border-border hover:border-primary/60',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-body"
        />
      </div>
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

export default Select
