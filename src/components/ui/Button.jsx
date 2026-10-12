import { Loader2 } from 'lucide-react'
import { buttonClasses } from './buttonStyles'

function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      ) : null}
      {children}
    </button>
  )
}

export default Button
