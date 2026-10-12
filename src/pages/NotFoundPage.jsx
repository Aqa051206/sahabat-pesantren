import { Compass } from 'lucide-react'
import DemoBanner from '../components/DemoBanner'
import ButtonLink from '../components/ui/ButtonLink'
import { useAuth } from '../features/auth/auth-context'
import { homeForRole } from '../lib/constants'

export default function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <DemoBanner />
      <div className="grid flex-1 place-items-center px-4">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber/15 text-primary">
            <Compass aria-hidden="true" className="size-8" />
          </span>
          <h1 className="mt-4 text-3xl">Halaman tidak ditemukan</h1>
          <p className="mt-2 text-body">
            Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <ButtonLink to={homeForRole(user.role)}>Kembali ke beranda</ButtonLink>
            ) : (
              <ButtonLink to="/">Halaman utama</ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
