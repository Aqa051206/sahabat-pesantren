import { cn } from '../../lib/cn'

function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-band-1', className)}
    />
  )
}

export default Skeleton
