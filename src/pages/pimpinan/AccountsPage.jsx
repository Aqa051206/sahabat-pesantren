import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Plus,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toast-context'
import {
  useAccounts,
  useCreateAccount,
  useImportSantri,
  usePreviewImport,
  useSantriExport,
  useSetAccountActive,
  useTemplate,
} from '../../features/accounts/hooks'
import { downloadBlob } from '../../lib/csv'
import { cn } from '../../lib/cn'
import { MAX_IMPORT_BYTES, ROLE_LABELS, ROLES } from '../../lib/constants'

const ROLE_OPTIONS = [
  { value: '', label: 'Semua peran' },
  { value: ROLES.PENGURUS, label: ROLE_LABELS[ROLES.PENGURUS] },
  { value: ROLES.PIMPINAN, label: ROLE_LABELS[ROLES.PIMPINAN] },
]

const ACTIVE_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
]

const CREATE_ROLE_OPTIONS = [
  { value: '', label: 'Pilih peran' },
  { value: ROLES.PENGURUS, label: ROLE_LABELS[ROLES.PENGURUS] },
  { value: ROLES.PIMPINAN, label: ROLE_LABELS[ROLES.PIMPINAN] },
]

const ACCEPTED_EXT = ['.xlsx']

const makeUsername = (name, role, accounts) => {
  const base = String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
  if (!base) return ''

  const prefix = role === ROLES.PIMPINAN ? 'pimpinan' : 'pengurus'
  const stem = `${prefix}.${base}`
  const taken = new Set(accounts.map((account) => account.username.toLowerCase()))
  if (!taken.has(stem)) return stem

  let suffix = 2
  while (taken.has(`${stem}${suffix}`)) suffix += 1
  return `${stem}${suffix}`
}

function AccountsTab() {
  const toast = useToast()
  const [filters, setFilters] = useState({ q: '', role: '', active: '' })
  const { data, isLoading, isError, refetch } = useAccounts()
  const setActive = useSetAccountActive()
  const createAccount = useCreateAccount()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', role: '', password: '' })
  const [errors, setErrors] = useState({})
  const [usernameAuto, setUsernameAuto] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const accounts = data?.items ?? []
  const searchTerm = filters.q.trim().toLocaleLowerCase('id-ID')
  const visibleAccounts = accounts.filter((account) => {
    const matchesSearch =
      !searchTerm ||
      String(account.name ?? '')
        .toLocaleLowerCase('id-ID')
        .includes(searchTerm) ||
      String(account.username ?? '')
        .toLocaleLowerCase('id-ID')
        .includes(searchTerm)
    const matchesRole = !filters.role || account.role === filters.role
    const matchesActive =
      !filters.active || account.active === (filters.active === 'true')
    return matchesSearch && matchesRole && matchesActive
  })

  const submit = async (event) => {
    event.preventDefault()
    setErrors({})
    try {
      await createAccount.mutateAsync({
        name: form.name,
        username: form.username,
        role: form.role,
        password: form.password || undefined,
      })
      toast.showToast('Akun petugas dibuat.', 'success')
      setOpen(false)
      setForm({ name: '', username: '', role: '', password: '' })
      setUsernameAuto(true)
      setShowPassword(false)
    } catch (error) {
      if (error?.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.showToast(error?.message ?? 'Gagal membuat akun.', 'error')
      }
    }
  }

  const toggleActive = (account) => {
    setActive.mutate(
      { id: account.id, active: !account.active },
      {
        onSuccess: () =>
          toast.showToast(
            account.active ? 'Akun dinonaktifkan.' : 'Akun diaktifkan.',
            'success',
          ),
        onError: (error) =>
          toast.showToast(error?.message ?? 'Gagal mengubah status akun.', 'error'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            id="akun-cari"
            label="Cari"
            placeholder="Nama atau ID pengguna"
            autoComplete="off"
            value={filters.q}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, q: event.target.value }))
            }
          />
          <Select
            id="akun-role"
            label="Peran"
            options={ROLE_OPTIONS}
            value={filters.role}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, role: event.target.value }))
            }
          />
          <Select
            id="akun-aktif"
            label="Status"
            options={ACTIVE_OPTIONS}
            value={filters.active}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, active: event.target.value }))
            }
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Tambah akun
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <ErrorState message="Daftar akun gagal dimuat." onRetry={refetch} />
      ) : visibleAccounts.length ? (
        <ul className="flex flex-col gap-3">
          {visibleAccounts.map((account) => (
            <li key={account.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-amber/15 text-primary">
                    <Users aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy">{account.name}</p>
                    <p className="text-sm text-body">
                      {account.username} · {ROLE_LABELS[account.role] ?? account.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold',
                      account.active
                        ? 'border-status-done/30 bg-status-done-bg text-status-done'
                        : 'border-border bg-band-1 text-body',
                    )}
                  >
                    {account.active ? (
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                    ) : (
                      <XCircle aria-hidden="true" className="size-4" />
                    )}
                    {account.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={setActive.isPending}
                    onClick={() => toggleActive(account)}
                  >
                    {account.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="px-6 py-10 text-center text-sm text-body">
          Tidak ada akun yang cocok.
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah akun petugas"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              form="create-account-form"
              loading={createAccount.isPending}
            >
              <UserPlus aria-hidden="true" className="size-4" />
              Buat akun
            </Button>
          </>
        }
      >
        <form
          id="create-account-form"
          onSubmit={submit}
          className="flex flex-col gap-4"
          autoComplete="off"
          noValidate
        >
          <Input
            id="akun-nama"
            label="Nama lengkap"
            required
            autoComplete="off"
            value={form.name}
            error={errors.name?.[0]}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
                ...(usernameAuto
                  ? {
                      username: makeUsername(
                        event.target.value,
                        prev.role,
                        accounts,
                      ),
                    }
                  : {}),
              }))
            }
          />
          <Input
            id="akun-username"
            label="ID pengguna"
            required
            autoComplete="off"
            value={form.username}
            error={errors.username?.[0]}
            hint="ID dibuat otomatis dari nama dan dapat diedit."
            onChange={(event) => {
              setUsernameAuto(false)
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }}
          />
          <Select
            id="akun-peran"
            label="Peran"
            required
            options={CREATE_ROLE_OPTIONS}
            value={form.role}
            error={errors.role?.[0]}
            onChange={(event) => {
              const role = event.target.value
              setForm((prev) => ({
                ...prev,
                role,
                ...(usernameAuto
                  ? { username: makeUsername(prev.name, role, accounts) }
                  : {}),
              }))
            }}
          />
          <Input
            id="akun-password"
            label="Kata sandi awal (opsional)"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.password}
            error={errors.password?.[0]}
            endAdornment={
              <button
                type="button"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((shown) => !shown)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-body hover:text-navy focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            }
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
        </form>
      </Modal>
    </div>
  )
}

function ImportTab() {
  const toast = useToast()
  const inputRef = useRef(null)
  const template = useTemplate()
  const santriExport = useSantriExport()
  const preview = usePreviewImport()
  const importMut = useImportSantri()

  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [result, setResult] = useState(null)

  const resetPreview = () => {
    setPreviewData(null)
    setResult(null)
  }

  const handleFile = async (event) => {
    const selected = event.target.files?.[0] ?? null
    resetPreview()
    if (!selected) {
      setFile(null)
      return
    }
    const lower = selected.name.toLowerCase()
    if (!ACCEPTED_EXT.some((ext) => lower.endsWith(ext))) {
      setFile(null)
      toast.showToast('Berkas harus berupa Excel .xlsx.', 'error')
      event.target.value = ''
      return
    }
    if (selected.size > MAX_IMPORT_BYTES) {
      setFile(null)
      toast.showToast('Ukuran berkas maksimal 5 MB.', 'error')
      event.target.value = ''
      return
    }
    setFile(selected)
    try {
      const data = await preview.mutateAsync(selected)
      setPreviewData(data)
    } catch (error) {
      toast.showToast(error?.message ?? 'Pratinjau gagal dimuat.', 'error')
    }
  }

  const doImport = async () => {
    if (!file || !previewData?.canImport || invalidCount > 0) return
    try {
      const data = await importMut.mutateAsync({ file })
      setResult(data)
      toast.showToast(`Impor selesai: ${data.created} santri ditambahkan.`, 'success')
    } catch (error) {
      toast.showToast(error?.message ?? 'Impor gagal.', 'error')
    }
  }

  const downloadTemplate = () => {
    if (!template.data) return
    downloadBlob('template-santri.xlsx', template.data)
  }

  const downloadSantri = async () => {
    try {
      const blob = await santriExport.mutateAsync()
      downloadBlob('data-santri.xlsx', blob)
    } catch (error) {
      toast.showToast(error?.message ?? 'Gagal mengunduh data santri.', 'error')
    }
  }

  const rows = previewData?.rows ?? null
  const newCount = rows?.filter((row) => row.action === 'new').length ?? 0
  const invalidCount = rows?.filter((row) => !row.valid).length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
          <FileSpreadsheet aria-hidden="true" className="size-5 text-primary" />
          Langkah 1 — Siapkan berkas
        </h2>
        <p className="mt-1 text-sm text-body">
          Unduh template Excel, isi data santri, lalu unggah untuk membuat akun
          baru. Ukuran maksimal 5 MB. Fitur pembaruan data santri yang sudah
          terdaftar memerlukan dukungan backend.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadSantri}
            loading={santriExport.isPending}
          >
            <Download aria-hidden="true" className="size-4" />
            Unduh data santri
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadTemplate}
            disabled={!template.data}
            loading={template.isLoading}
          >
            <Download aria-hidden="true" className="size-4" />
            Unduh template
          </Button>
          <input
            ref={inputRef}
            id="import-file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={handleFile}
          />
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden="true" className="size-4" />
            Pilih berkas
          </Button>
          {file ? (
            <span className="text-sm text-body">{file.name}</span>
          ) : null}
        </div>
      </Card>

      {template.isError ? (
        <ErrorState
          message="Template Excel gagal dimuat."
          onRetry={template.refetch}
        />
      ) : null}

      {preview.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : rows ? (
        <>
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-navy">
                Langkah 2 — Periksa pratinjau
              </h2>
              <span className="text-sm text-body">
                {newCount} santri · {invalidCount} baris bermasalah
              </span>
            </div>
            {previewData.message ? (
              <p className="mt-2 text-sm text-body">{previewData.message}</p>
            ) : null}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[64rem] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-body">
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Nama</th>
                    <th className="px-3 py-2 font-semibold">Email</th>
                    <th className="px-3 py-2 font-semibold">NIS</th>
                    <th className="px-3 py-2 font-semibold">Jenis kelamin</th>
                    <th className="px-3 py-2 font-semibold">Telepon wali</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.index} className="border-t border-border">
                      <td className="px-3 py-2 text-body">{row.index}</td>
                      <td className="px-3 py-2 text-navy">{row.name || '—'}</td>
                      <td className="px-3 py-2 text-navy">{row.email || '—'}</td>
                      <td className="px-3 py-2 text-navy">{row.nis || '—'}</td>
                      <td className="px-3 py-2 text-navy">
                        {row.jenisKelamin || '—'}
                      </td>
                      <td className="px-3 py-2 text-navy">
                        {row.teleponOrtu || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-status-done">
                            <CheckCircle2 aria-hidden="true" className="size-4" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-danger">
                            <XCircle aria-hidden="true" className="size-4" />
                            {row.errors?.join(', ') || 'Tidak valid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-navy">
              Langkah 3 — Impor data
            </h2>
            {!previewData.canImport ? (
              <p className="mt-2 text-sm text-danger">
                Server belum mengizinkan impor. Periksa error di atas atau hubungi
                pengelola backend.
              </p>
            ) : null}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={doImport}
                loading={importMut.isPending}
                disabled={
                  !file ||
                  !rows?.length ||
                  !previewData.canImport ||
                  invalidCount > 0
                }
              >
                <Upload aria-hidden="true" className="size-4" />
                Impor {newCount} santri
              </Button>
            </div>
          </Card>
        </>
      ) : null}

      {result ? (
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            <CheckCircle2 aria-hidden="true" className="size-5 text-status-done" />
            Impor selesai
          </h2>
          <p className="mt-1 text-sm text-body">
            {result.created} akun santri berhasil ditambahkan.{' '}
            {result.message || 'Santri wajib mengganti kata sandi sementara saat login pertama.'}
          </p>
        </Card>
      ) : null}
    </div>
  )
}

export default function AccountsPage() {
  const [tab, setTab] = useState('accounts')

  const tabs = [
    { value: 'accounts', label: 'Akun Petugas' },
    { value: 'import', label: 'Impor Santri' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl">Kelola Akun</h1>
        <p className="mt-1 text-body">
          Kelola akun petugas dan tambahkan data santri lewat impor.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Bagian kelola akun"
        className="flex gap-2 border-b border-border"
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
              tab === item.value
                ? 'border-primary text-primary'
                : 'border-transparent text-body hover:text-navy',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'accounts' ? <AccountsTab /> : <ImportTab />}
    </div>
  )
}
