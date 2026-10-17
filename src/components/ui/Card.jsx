import { cn } from '../../lib/cn'

function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border-2 border-[#91a99a] bg-white shadow-[0_3px_0_#12372a,0_8px_18px_rgba(18,55,42,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default Card
