import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Brand from '../components/Brand'
import DemoBanner from '../components/DemoBanner'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { useToast } from '../components/ui/toast-context'
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
  password: 'newPassword',
  new_password: 'newPassword',
}

export default function ChangePasswordPage({ embedded = false }) {
  const { changePassword, logout, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const isProfile = embedded || location.pathname.endsWith('/profil')
  const [formError, setFormError] = useState(null)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [formOpen, setFormOpen] = useState(true)

  const {
    register,
    handleSubmit,
    setError,
    reset,
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
      toast.showToast('Kata sandi berhasil diubah.', 'success')
      reset()
      setVisiblePasswords({})
      if (isProfile) {
        setFormOpen(false)
      } else {
        navigate(homeForRole(user?.role), { replace: true })
      }
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

  const passwordField = (name, id, label, hint) => (
    <div className="relative">
      <Input
        id={id}
        type={visiblePasswords[name] ? 'text' : 'password'}
        label={label}
        hint={hint}
        autoComplete="off"
        minLength={name === 'currentPassword' ? undefined : 8}
        error={errors[name]?.message}
        className="pr-12"
        {...register(name)}
      />
      <button
        type="button"
        aria-label={
          visiblePasswords[name] ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'
        }
        aria-pressed={Boolean(visiblePasswords[name])}
        onClick={() =>
          setVisiblePasswords((current) => ({
            ...current,
            [name]: !current[name],
          }))
        }
        className="absolute right-2 top-8 flex size-10 items-center justify-center rounded-lg text-body hover:bg-band-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {visiblePasswords[name] ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </button>
    </div>
  )

  const formContent = (
    <>
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
        {passwordField('currentPassword', 'currentPassword', 'Kata sandi saat ini')}
        {passwordField(
          'newPassword',
          'newPassword',
          'Kata sandi baru',
          'Minimal 8 karakter.',
        )}
        {passwordField(
          'confirmPassword',
          'confirmPassword',
          'Ulangi kata sandi baru',
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Simpan kata sandi baru
        </Button>
      </form>

      {!isProfile ? (
        <button
          type="button"
          onClick={logout}
          className="mx-auto mt-4 block text-sm font-semibold text-body transition-colors hover:text-navy"
        >
          Keluar dari akun ini
        </button>
      ) : null}
    </>
  )

  if (embedded) {
    return (
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-navy">Ubah kata sandi</h2>
            {formOpen ? (
              <p className="mt-1 text-sm text-body">
                Kata sandi baru harus terdiri dari minimal 8 karakter.
              </p>
            ) : null}
          </div>
          {!formOpen ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              Ubah kata sandi
            </Button>
          ) : null}
        </div>
        {formOpen ? formContent : null}
      </section>
    )
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
            {formContent}
          </Card>
        </div>
      </div>
    </div>
  )
}
