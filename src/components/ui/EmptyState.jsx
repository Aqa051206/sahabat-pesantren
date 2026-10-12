import { cn } from '../../lib/cn'

function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-white px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-14 items-center justify-center rounded-full bg-amber/15 text-primary">
          <Icon aria-hidden="true" className="size-7" />
        </span>
      ) : null}
      <h3 className="text-xl text-navy">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-body">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export default EmptyState
