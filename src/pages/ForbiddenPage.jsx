import { ShieldOff } from 'lucide-react'
import DemoBanner from '../components/DemoBanner'
import ButtonLink from '../components/ui/ButtonLink'
import { useAuth } from '../features/auth/auth-context'
import { homeForRole } from '../lib/constants'

export default function ForbiddenPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <DemoBanner />
      <div className="grid flex-1 place-items-center px-4">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber/15 text-primary">
            <ShieldOff aria-hidden="true" className="size-8" />
          </span>
          <h1 className="mt-4 text-3xl">Kamu tidak punya akses</h1>
          <p className="mt-2 text-body">
            Halaman ini hanya untuk peran tertentu. Kembali ke halaman yang sesuai
            dengan akunmu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <ButtonLink to={homeForRole(user.role)}>Kembali ke beranda</ButtonLink>
            ) : (
              <ButtonLink to="/login">Masuk</ButtonLink>
            )}
            <ButtonLink to="/" variant="secondary">
              Halaman utama
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}
