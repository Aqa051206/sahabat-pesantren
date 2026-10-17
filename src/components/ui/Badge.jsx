import { cn } from '../../lib/cn'

const TONES = {
  neutral: 'bg-band-1 text-navy border-border',
  new: 'bg-status-new-bg text-status-new border-status-new/30',
  process: 'bg-status-process-bg text-status-process border-status-process/30',
  done: 'bg-status-done-bg text-status-done border-status-done/30',
  warning: 'bg-status-new-bg text-status-new border-status-new/30',
  danger: 'bg-danger-bg text-danger border-danger/30',
  gold: 'bg-amber/15 text-primary border-primary/40',
  blue: 'bg-report-blue text-[#315d9e] border-[#a9bddf]',
  coral: 'bg-report-coral text-[#a74831] border-[#e7ad9c]',
  yellow: 'bg-report-yellow text-[#755c10] border-[#dec977]',
}

function Badge({ tone = 'neutral', icon: Icon, children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  )
}

export default Badge
