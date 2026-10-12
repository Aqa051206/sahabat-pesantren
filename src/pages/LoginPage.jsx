import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useAuth } from '../features/auth/auth-context'
import { homeForRole } from '../lib/constants'
import { USE_MOCK } from '../lib/env'

const schema = z.object({
  identifier: z.string().trim().min(1, 'Isi NIS atau ID terlebih dulu.'),
  password: z.string().min(1, 'Isi kata sandi terlebih dulu.'),
})

const DEMO_ACCOUNTS = [
  { label: 'Santri', identifier: 'santri1', password: 'santri123' },
  { label: 'Santri (ganti sandi)', identifier: 'santri2', password: 'santri123' },
  { label: 'Pengurus', identifier: 'pengurus1', password: 'pengurus123' },
  { label: 'Pimpinan', identifier: 'pimpinan1', password: 'pimpinan123' },
]

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(location.state?.message ?? null)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  })

  if (isAuthenticated) {
    if (user?.mustChangePassword) return <Navigate to="/ganti-password" replace />
    return <Navigate to={homeForRole(user?.role)} replace />
  }

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      const loggedIn = await login(values)
      if (loggedIn.mustChangePassword) {
        navigate('/ganti-password', { replace: true })
      } else {
        navigate(homeForRole(loggedIn.role), { replace: true })
      }
    } catch (error) {
      if (error?.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const key = field === 'identifier' || field === 'password' ? field : null
          if (key) setError(key, { message: messages[0] })
        })
        setFormError(error.message)
      } else {
        setFormError(error?.message ?? 'Tidak dapat masuk. Coba lagi.')
      }
    }
  }

  const fill = (account) => {
    setValue('identifier', account.identifier, { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <DemoBanner />
      <div className="grid flex-1 place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <Brand />
          </div>

          <Card className="p-6 sm:p-8">
            <h1 className="text-2xl">Masuk</h1>
            <p className="mt-1 text-sm text-body">
              Gunakan NIS (santri) atau ID petugas yang diberikan pengurus.
            </p>

            {formError ? (
              <p
                role="alert"
                aria-live="assertive"
                className="mt-4 rounded-2xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
              >
                {formError}
              </p>
            ) : null}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 flex flex-col gap-4"
              autoComplete="off"
              noValidate
            >
              <Input
                id="identifier"
                label="NIS atau ID petugas"
                autoComplete="off"
                error={errors.identifier?.message}
                {...register('identifier')}
              />
              <Input
                id="password"
                type="password"
                label="Kata sandi"
                autoComplete="off"
                error={errors.password?.message}
                {...register('password')}
              />
              <Button type="submit" loading={isSubmitting} className="w-full">
                Masuk
              </Button>
            </form>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-body">
              <ShieldCheck aria-hidden="true" className="size-4 text-primary-hover" />
              Nama pelapor tidak dilihat pengurus kecuali kamu memilihnya.
            </p>
          </Card>

          {USE_MOCK ? (
            <Card className="mt-4 bg-amber/15 p-5">
              <h2 className="text-lg">Akun demo</h2>
              <p className="mt-0.5 text-sm text-body">
                Hanya tersedia saat mode demo.
              </p>
              <ul className="mt-3 grid gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <li
                    key={account.identifier}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2"
                  >
                    <div className="text-sm">
                      <p className="font-semibold text-navy">{account.label}</p>
                      <p className="text-body">
                        {account.identifier} · {account.password}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => fill(account)}>
                      Isi
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
