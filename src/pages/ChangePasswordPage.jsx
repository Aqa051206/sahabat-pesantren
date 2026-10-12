import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useAuth } from '../features/auth/auth-context'
import { homeForRole } from '../lib/constants'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Isi kata sandi saat ini.'),
    newPassword: z.string().min(8, 'Kata sandi baru minimal 8 karakter.'),
    confirmPassword: z.string().min(1, 'Ulangi kata sandi baru.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Kata sandi baru belum sama.',
  })

const FIELD_MAP = {
  current_password: 'currentPassword',
  new_password: 'newPassword',
}

export default function ChangePasswordPage() {
  const { changePassword, logout, user } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      navigate(homeForRole(user?.role), { replace: true })
    } catch (error) {
      if (error?.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const key = FIELD_MAP[field]
          if (key) setError(key, { message: messages[0] })
        })
        setFormError(error.message)
      } else {
        setFormError(error?.message ?? 'Tidak dapat mengganti kata sandi.')
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <DemoBanner />
      <div className="grid flex-1 place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber/15 text-primary">
              <KeyRound aria-hidden="true" className="size-6" />
            </span>
            <Brand />
          </div>

          <Card className="p-6 sm:p-8">
            <h1 className="text-2xl">Ganti kata sandi</h1>
            <p className="mt-1 text-sm text-body">
              Demi keamanan, ganti kata sandimu sebelum melanjutkan.
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
                id="currentPassword"
                type="password"
                label="Kata sandi saat ini"
                autoComplete="off"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <Input
                id="newPassword"
                type="password"
                label="Kata sandi baru"
                hint="Minimal 8 karakter."
                autoComplete="off"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                id="confirmPassword"
                type="password"
                label="Ulangi kata sandi baru"
                autoComplete="off"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" loading={isSubmitting} className="w-full">
                Simpan kata sandi baru
              </Button>
            </form>

            <button
              type="button"
              onClick={logout}
              className="mx-auto mt-4 block text-sm font-semibold text-body transition-colors hover:text-navy"
            >
              Keluar dari akun ini
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}
