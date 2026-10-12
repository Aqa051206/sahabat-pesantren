import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import ButtonLink from '../components/ui/ButtonLink'
import { USE_MOCK } from '../lib/env'

const NAV_ITEMS = [
  ['Beranda', '/'],
  ['Tentang', '/#profil'],
  ['Cara Kerja', '/#alur'],
  ['Fitur', '/#fitur'],
  ['Bantuan', '/#bantuan'],
]

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <DemoBanner />
      <div className="hidden bg-navy px-6 py-2 text-xs font-medium text-white sm:block">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 lg:px-8">
          <a href="tel:129" className="transition hover:text-cyan-400">Butuh bantuan segera? Hubungi SAPA 129</a>
          <Link to="/login" className="transition hover:text-cyan-400">Masuk</Link>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 shadow-[0_3px_18px_rgba(28,42,90,0.04)] backdrop-blur">
        <div className="mx-auto flex min-h-[76px] w-full max-w-[1600px] items-center justify-between gap-5 px-5 sm:px-10 lg:px-16 xl:px-24">
          <Link to="/" aria-label="Beranda Sahabat Pesantren" onClick={closeMenu}>
            <Brand />
          </Link>
          <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-semibold text-body transition hover:text-primary">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden lg:block">
            <ButtonLink to="/login" size="sm">Masuk</ButtonLink>
          </div>
          <button
            type="button"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-xl text-primary hover:bg-band-1 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen ? (
          <nav id="public-mobile-menu" aria-label="Navigasi utama seluler" className="border-t border-line bg-white px-5 py-4 lg:hidden">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-1 sm:px-5">
              {NAV_ITEMS.map(([label, href]) => (
                <a key={label} href={href} onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold text-navy hover:bg-band-1">
                  {label}
                </a>
              ))}
              <ButtonLink to="/login" className="mt-2" onClick={closeMenu}>Masuk</ButtonLink>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-navy text-white">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 py-14 sm:px-10 md:grid-cols-2 lg:grid-cols-5 lg:px-16 xl:px-24">
          <div className="lg:col-span-2">
            <Brand tone="light" />
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Ruang bagi santri untuk menyampaikan cerita dan mengikuti tindak lanjut laporan.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Navigasi</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {NAV_ITEMS.map(([label, href]) => <li key={label}><a href={href} className="hover:text-cyan-400">{label}</a></li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Peran</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {['Santri', 'Pengurus', 'Pimpinan'].map((role) => <li key={role}><Link to="/login" className="hover:text-cyan-400">{role}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bantuan</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li><a href="tel:129" className="hover:text-cyan-400">SAPA 129</a></li>
              <li><Link to="/login" className="hover:text-cyan-400">Masuk</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 px-5 py-5 text-center text-xs text-white/65">
          <p>© 2026 Sahabat Pesantren · Karya UINIC 8.0</p>
          {USE_MOCK ? <p className="mt-1">Data pada demo ini adalah data contoh.</p> : null}
        </div>
      </footer>
    </div>
  )
}
