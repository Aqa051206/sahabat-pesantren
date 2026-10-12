import { cn } from '../lib/cn'

function Brand({ className, tone = 'dark', showText = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        role="presentation"
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="size-10 shrink-0"
      >
        <path d="M5 34V19C5 10.7 11.7 4 20 4s15 6.7 15 15v15" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 13 29 17v6c0 6-4 10-9 13-5-3-9-7-9-13v-6l9-4Z" fill="var(--color-cyan-400)" />
        <path d="m16 22 3 3 6-7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
