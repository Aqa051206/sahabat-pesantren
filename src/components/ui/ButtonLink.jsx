import { Link } from 'react-router-dom'
import { buttonClasses } from './buttonStyles'

function ButtonLink({ to, variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  )
}

export default ButtonLink
