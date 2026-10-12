import { FileText, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import { IdleWarning } from '../features/auth/IdleWarning'
import { useAuth } from '../features/auth/auth-context'
import { useIdleTimer } from '../features/auth/useIdleTimer'
import { ROLES, ROLE_LABELS } from '../lib/constants'
import { STAFF_IDLE_TIMEOUT_SECONDS } from '../lib/env'
import { cn } from '../lib/cn'

const NAV_ITEMS = [
  { to: '/petugas', label: 'Laporan', icon: FileText, end: true, roles: ['pengurus', 'pimpinan'] },
  {
    to: '/pimpinan/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['pimpinan'],
  },
  { to: '/pimpinan/akun', label: 'Akun', icon: Users, roles: ['pimpinan'] },
]

export function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleIdle = useCallback(() => {
    logout()
    navigate('/login', {
      replace: true,
      state: { message: 'Sesi berakhir karena tidak ada aktivitas.' },
    })
  }, [logout, navigate])

  const { secondsLeft, stay } = useIdleTimer({
    timeoutSeconds: STAFF_IDLE_TIMEOUT_SECONDS,
    onIdle: handleIdle,
  })

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', {
      replace: true,
      state: { message: 'Kamu telah keluar.' },
    })
  }, [logout, navigate])

  return (
    <div className="flex min-h-svh flex-col bg-band-1">
      <DemoBanner />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-white px-4 py-6 md:block">
          <NavLink to={user?.role === ROLES.PIMPINAN ? '/pimpinan/dashboard' : '/petugas'}>
            <Brand />
          </NavLink>
          <nav aria-label="Navigasi petugas" className="mt-8 flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-navy hover:bg-band-1',
                  )
                }
              >
                <item.icon aria-hidden="true" className="size-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 md:px-6">
            <div className="md:hidden">
              <Brand showText={false} />
            </div>
            <div className="hidden flex-col md:flex">
              <span className="text-sm font-semibold text-navy">{user?.name}</span>
              <span className="text-xs text-body">
                {ROLE_LABELS[user?.role] ?? 'Petugas'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-band-1"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Keluar
            </button>
          </header>

          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-white/95 backdrop-blur md:hidden"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-body',
              )
            }
          >
            <item.icon aria-hidden="true" className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <IdleWarning secondsLeft={secondsLeft} onStay={stay} onLogout={handleIdle} />
    </div>
  )
}
