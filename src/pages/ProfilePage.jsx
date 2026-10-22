import Card from '../components/ui/Card'
import ChangePasswordPage from './ChangePasswordPage'
import { useAuth } from '../features/auth/auth-context'
import { ROLE_LABELS } from '../lib/constants'

export default function ProfilePage() {
  const { user } = useAuth()
  const fields = [
    { label: 'Nama', value: user?.name },
    { label: 'Peran', value: ROLE_LABELS[user?.role] ?? user?.role },
    { label: 'ID akun', value: user?.id },
    ...(user?.role === 'santri'
      ? [
          { label: 'NIS', value: user?.nis ?? user?.username },
          { label: 'Telepon wali', value: user?.phone },
        ]
      : [
          {
            label: user?.email ? 'Email' : 'Nama pengguna',
            value: user?.email ?? user?.username,
          },
        ]),
  ]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="text-3xl">Profil</h1>
        <p className="mt-1 text-body">Informasi akun dan pengaturan kata sandi.</p>
      </header>

      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-navy">Data pengguna</h2>
        <dl className="mt-4 divide-y divide-border">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
            >
              <dt className="text-sm text-body">{label}</dt>
              <dd className="break-words text-sm font-semibold text-navy">
                {value || 'Belum tersedia'}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5 sm:p-6">
        <ChangePasswordPage embedded />
      </Card>
    </div>
  )
}
