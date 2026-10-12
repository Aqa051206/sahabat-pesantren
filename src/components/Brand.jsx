import { cn } from '../lib/cn'

function Brand({ className, tone = 'dark', showText = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        role="presentation"
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="size-11 shrink-0"
      >
        <rect x="4" y="3" width="32" height="34" rx="13" fill="var(--color-primary)" />
        <path d="M10 15.5c0-4 3-7 7-7h7c4 0 7 3 7 7v6c0 4-3 7-7 7h-5l-6 4v-7c-2-1-3-4-3-7v-3Z" fill="white" />
        <path d="M20.5 24.5 16 20.7c-3.4-3 1-7.3 4.5-3.6 3.5-3.7 7.9.6 4.5 3.6l-4.5 3.8Z" fill="var(--color-salmon)" />
      </svg>
      {showText ? (
        <span className={cn('text-base font-extrabold leading-tight tracking-tight sm:text-lg', tone === 'light' ? 'text-white' : 'text-navy')}>
          Sahabat Pesantren
        </span>
      ) : null}
    </span>
  )
}

export default Brand
