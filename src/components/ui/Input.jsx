import { CircleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

const baseField =
  'w-full rounded-xl border bg-white px-4 text-navy placeholder:text-body/70 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/30 disabled:bg-band-1 disabled:text-body'

const stateField = (error) =>
  error ? 'border-danger' : 'border-border hover:border-primary/60'

function FieldShell({ id, label, hint, error, required, children }) {
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
      {children}
      {hint && !error ? (
        <p className="text-sm text-body">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" aria-live="polite" className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}

function Input({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  ...props
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(baseField, stateField(error), 'h-12', className)}
        {...props}
      />
    </FieldShell>
  )
}

export default Input
