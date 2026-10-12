import { FilePlus2, FileText } from 'lucide-react'
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
  { to: '/santri/buat-laporan', label: 'Buat Laporan', icon: FilePlus2 },
  { to: '/santri/laporan-saya', label: 'Laporan Saya', icon: FileText },
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
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col border-r border-line bg-white px-6 py-7 lg:flex">
          <Brand />
          <p className="mt-10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-body">
            Menu utama
          </p>
          <nav aria-label="Navigasi santri" className="mt-3 flex flex-col gap-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-[0_8px_20px_rgba(18,55,42,0.18)]'
                      : 'text-primary hover:bg-band-1',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-mint-50 p-4">
            <p className="text-sm font-bold text-navy">Privasi tetap terjaga</p>
            <p className="mt-1 text-xs leading-5 text-body">
              Gunakan Keluar Cepat saat meninggalkan komputer pojok curhat.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-line bg-white/95 shadow-[0_3px_18px_rgba(28,42,90,0.04)] backdrop-blur">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-10 xl:px-12 2xl:px-16">
              <div className="lg:hidden">
                <Brand showText={false} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-body sm:flex-none">
                Halo, <strong className="text-navy">{user?.name}</strong>
              </span>
              <div className="ml-auto flex flex-col items-end">
                <QuickExitButton />
                <span className="hidden text-[10px] text-body sm:block">
                  Tekan Esc dua kali untuk keluar cepat
                </span>
              </div>
            </div>
          </header>

          <main className="w-full flex-1 px-5 py-7 pb-24 sm:px-7 lg:px-10 lg:py-9 xl:px-12 2xl:px-16">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        aria-label="Navigasi santri"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 backdrop-blur lg:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors',
                isActive ? 'text-primary' : 'text-body',
              )
            }
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <IdleWarning secondsLeft={secondsLeft} onStay={stay} onLogout={handleIdle} />
    </div>
  )
}
