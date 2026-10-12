export const VARIANTS = {
  primary:
    'bg-primary text-white shadow-[0_8px_20px_rgba(18,55,42,0.18)] hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0',
  secondary:
    'border-2 border-primary bg-transparent text-primary hover:bg-mint-50',
  gold: 'bg-amber text-navy hover:brightness-95',
  ghost: 'bg-transparent text-primary hover:bg-band-1',
  danger: 'bg-danger text-white hover:bg-red-700',
}

export const SIZES = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-6',
  lg: 'min-h-14 px-8 text-lg',
  icon: 'h-12 w-12 p-0',
}

export const buttonClasses = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
  [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')
