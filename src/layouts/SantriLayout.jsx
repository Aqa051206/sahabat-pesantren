import { useCallback, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import { IdleWarning } from '../features/auth/IdleWarning'
import { QuickExitButton } from '../features/auth/QuickExitButton'
import { useAuth } from '../features/auth/auth-context'
import { useIdleTimer } from '../features/auth/useIdleTimer'
import { ROLES } from '../lib/constants'
import { IDLE_TIMEOUT_SECONDS } from '../lib/env'
import { cn } from '../lib/cn'

const NAV_ITEMS = [
  { to: '/santri/buat-laporan', label: 'Buat Laporan' },
  { to: '/santri/laporan-saya', label: 'Laporan Saya' },
]

export function SantriLayout() {
  const { user, logout, quickExit } = useAuth()
  const navigate = useNavigate()
  const lastEscape = useRef(0)

  const handleIdle = useCallback(() => {
    logout()
    navigate('/login', {
      replace: true,
      state: { message: 'Sesi berakhir karena tidak ada aktivitas.' },
    })
  }, [logout, navigate])

  const { secondsLeft, stay } = useIdleTimer({
    timeoutSeconds: IDLE_TIMEOUT_SECONDS,
    onIdle: handleIdle,
  })

  useEffect(() => {
    if (user?.role !== ROLES.SANTRI) return undefined

    const handleKeyDown = (event) => {
      if (
        event.key !== 'Escape' ||
        event.repeat ||
        event.defaultPrevented ||
        event.target.closest?.('[role="dialog"], [role="alertdialog"], [aria-modal="true"]')
      ) {
        return
      }

      const now = Date.now()
      if (now - lastEscape.current <= 600) {
        lastEscape.current = 0
        event.preventDefault()
        quickExit()
      } else {
        lastEscape.current = now
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [user?.role, quickExit])

  return (
    <div className="flex min-h-svh flex-col bg-band-1">
      <DemoBanner />
      <header className="border-b border-border bg-white shadow-[0_3px_18px_rgba(28,42,90,0.04)]">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-body sm:inline">
              Halo, <strong className="text-navy">{user?.name}</strong>
            </span>
            <div className="flex flex-col items-end gap-1">
              <QuickExitButton />
              <span className="text-[10px] text-body">
                Tekan Esc dua kali untuk keluar cepat
              </span>
            </div>
          </div>
        </div>
        <nav
          aria-label="Navigasi santri"
          className="mx-auto flex w-full max-w-4xl gap-2 px-4 pb-3 sm:px-6"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-band-1',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <IdleWarning secondsLeft={secondsLeft} onStay={stay} onLogout={handleIdle} />
    </div>
  )
}
