import { cn } from '../../lib/cn'

function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl bg-white shadow-[0_8px_30px_rgba(28,42,90,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default Card
