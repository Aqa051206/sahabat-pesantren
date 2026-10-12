import { cn } from '../../lib/cn'

function Switch({ id, label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer font-semibold text-navy">
          {label}
        </label>
        {description ? (
          <p className="text-sm text-body">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary-hover' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

export default Switch
