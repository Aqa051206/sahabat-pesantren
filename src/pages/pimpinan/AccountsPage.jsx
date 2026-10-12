import {
  CheckCircle2,
  Download,
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
import Switch from '../../components/ui/Switch'
import { useToast } from '../../components/ui/toast-context'
import {
  useAccounts,
  useCreateAccount,
  useImportSantri,
  usePreviewImport,
  useSetAccountActive,
  useTemplate,
} from '../../features/accounts/hooks'
import { downloadCsv } from '../../lib/csv'
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

const ACCEPTED_EXT = ['.csv', '.xlsx', '.xls']

function AccountsTab() {
  const toast = useToast()
  const [filters, setFilters] = useState({ q: '', role: '', active: '' })
  const deferred = filters
  const { data, isLoading, isError, refetch } = useAccounts(deferred)
  const setActive = useSetAccountActive()
  const createAccount = useCreateAccount()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', role: '', password: '' })
  const [errors, setErrors] = useState({})

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
      ) : data?.items.length ? (
        <ul className="flex flex-col gap-3">
          {data.items.map((account) => (
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
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <Input
            id="akun-username"
            label="ID pengguna"
            required
            autoComplete="off"
            value={form.username}
            error={errors.username?.[0]}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
          />
          <Select
            id="akun-peran"
            label="Peran"
            required
            options={CREATE_ROLE_OPTIONS}
            value={form.role}
            error={errors.role?.[0]}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value }))
            }
          />
          <Input
            id="akun-password"
            label="Kata sandi awal (opsional)"
            type="password"
            autoComplete="new-password"
            value={form.password}
            error={errors.password?.[0]}
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
  const preview = usePreviewImport()
  const importMut = useImportSantri()

  const [file, setFile] = useState(null)
  const [rows, setRows] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [result, setResult] = useState(null)

  const resetPreview = () => {
    setRows(null)
    setAcknowledged(false)
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
      toast.showToast('Berkas harus berupa CSV atau Excel.', 'error')
      event.target.value = ''
      return
    }
    if (selected.size > MAX_IMPORT_BYTES) {
      toast.showToast('Ukuran berkas maksimal 2 MB.', 'error')
      event.target.value = ''
      return
    }
    setFile(selected)
    try {
      const data = await preview.mutateAsync(selected)
      setRows(data.rows ?? [])
    } catch (error) {
      toast.showToast(error?.message ?? 'Pratinjau gagal dimuat.', 'error')
    }
  }

  const doImport = async () => {
    if (!file || !acknowledged) return
    try {
      const data = await importMut.mutateAsync({ file, acknowledged })
      setResult(data)
      toast.showToast(`${data.imported} akun santri dibuat.`, 'success')
    } catch (error) {
      toast.showToast(error?.message ?? 'Impor gagal.', 'error')
    }
  }

  const downloadTemplate = () => {
    if (!template.data) return
    downloadCsv(template.data.filename, [
      template.data.columns,
      ...template.data.rows,
    ])
  }

  const downloadCredentials = () => {
    if (!result?.accounts?.length) return
    downloadCsv('akun-santri-baru.csv', [
      ['nama', 'id_pengguna', 'kata_sandi_sementara'],
      ...result.accounts.map((account) => [
        account.name,
        account.username,
        account.temporaryPassword,
      ]),
    ])
  }

  const validCount = rows?.filter((row) => row.valid).length ?? 0
  const invalidCount = rows?.filter((row) => !row.valid).length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
          <FileSpreadsheet aria-hidden="true" className="size-5 text-primary" />
          Langkah 1 — Siapkan berkas
        </h2>
        <p className="mt-1 text-sm text-body">
          Unggah berkas CSV atau Excel berisi data santri. Ukuran maksimal 2 MB.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
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
            accept={ACCEPTED_EXT.join(',')}
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
                {validCount} valid · {invalidCount} perlu diperbaiki
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-body">
                    <th className="px-3 py-2 font-semibold">#</th>
                    <th className="px-3 py-2 font-semibold">Nama</th>
                    <th className="px-3 py-2 font-semibold">NIS</th>
                    <th className="px-3 py-2 font-semibold">Kelas</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.index} className="border-t border-border">
                      <td className="px-3 py-2 text-body">{row.index}</td>
                      <td className="px-3 py-2 text-navy">{row.name || '—'}</td>
                      <td className="px-3 py-2 text-navy">{row.nis || '—'}</td>
                      <td className="px-3 py-2 text-navy">{row.kelas || '—'}</td>
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
              Langkah 3 — Konfirmasi &amp; impor
            </h2>
            <div className="mt-3">
              <Switch
                id="import-ack"
                label="Wali santri sudah memberikan persetujuan"
                description="Impor hanya boleh dilakukan dengan persetujuan wali santri."
                checked={acknowledged}
                onChange={setAcknowledged}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={doImport}
                loading={importMut.isPending}
                disabled={!acknowledged || invalidCount > 0}
              >
                <Upload aria-hidden="true" className="size-4" />
                Impor {validCount} data
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
            {result.imported} akun santri berhasil dibuat. Bagikan kata sandi
            sementara ini secara aman.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-body">
                  <th className="px-3 py-2 font-semibold">Nama</th>
                  <th className="px-3 py-2 font-semibold">ID pengguna</th>
                  <th className="px-3 py-2 font-semibold">Kata sandi sementara</th>
                </tr>
              </thead>
              <tbody>
                {result.accounts.map((account) => (
                  <tr key={account.username} className="border-t border-border">
                    <td className="px-3 py-2 text-navy">{account.name}</td>
                    <td className="px-3 py-2 text-navy">{account.username}</td>
                    <td className="px-3 py-2 font-mono text-navy">
                      {account.temporaryPassword}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={downloadCredentials}>
              <Download aria-hidden="true" className="size-4" />
              Unduh daftar akun
            </Button>
          </div>
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
