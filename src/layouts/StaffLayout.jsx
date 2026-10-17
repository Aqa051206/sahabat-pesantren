import { FileText, LayoutDashboard, Users } from 'lucide-react'
import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner'
import AuthenticatedHeader from './AuthenticatedHeader'
import AuthenticatedNavigation from './AuthenticatedNavigation'
import { IdleWarning } from '../features/auth/IdleWarning'
import { useAuth } from '../features/auth/auth-context'
import { useIdleTimer } from '../features/auth/useIdleTimer'
import { ROLE_LABELS } from '../lib/constants'
import { STAFF_IDLE_TIMEOUT_SECONDS } from '../lib/env'

const NAV_ITEMS = [
  {
    to: '/petugas',
    label: 'Laporan',
    icon: FileText,
    end: true,
    matchPrefix: '/petugas/laporan',
    roles: ['pengurus', 'pimpinan'],
  },
  {
    to: '/pimpinan/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['pimpinan'],
  },
  {
    to: '/petugas/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['pengurus'],
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

  const homePath = items.find((item) => item.label === 'Dashboard')?.to ?? items[0]?.to ?? '/'

  return (
    <div className="flex min-h-svh flex-col bg-[#edf6f0] text-navy">
      <DemoBanner />
      <div className="flex min-h-0 flex-1">
        <AuthenticatedNavigation
          items={items}
          homePath={homePath}
          label="Navigasi petugas"
          darkSidebar
          user={user}
          roleLabel={ROLE_LABELS[user?.role] ?? 'Petugas'}
          onExit={handleLogout}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AuthenticatedHeader
            homePath={homePath}
            user={user}
            roleLabel={ROLE_LABELS[user?.role] ?? 'Petugas'}
            exitLabel="Keluar"
            onExit={handleLogout}
          />
          <main className="w-full flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
            <Outlet />
          </main>
        </div>
      </div>
      <IdleWarning secondsLeft={secondsLeft} onStay={stay} onLogout={handleIdle} />
    </div>
  )
}
