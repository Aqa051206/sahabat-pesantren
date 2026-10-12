import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Info, LifeBuoy, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import ButtonLink from '../../components/ui/ButtonLink'
import Card from '../../components/ui/Card'
import Switch from '../../components/ui/Switch'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/ui/toast-context'
import { useAuth } from '../../features/auth/auth-context'
import { useCreateReport } from '../../features/reports/hooks'
import { cn } from '../../lib/cn'
import { CATEGORIES, routesToPimpinan } from '../../lib/constants'

const schema = z.object({
  kategori: z.string().min(1, 'Pilih salah satu kategori.'),
  isi: z
    .string()
    .trim()
    .min(20, 'Ceritakan sedikit lebih lengkap, minimal 20 karakter.')
    .max(2000, 'Cerita terlalu panjang, maksimal 2000 karakter.'),
  tampilkan_identitas: z.boolean(),
})

const MAX = 2000

function SuccessScreen({ report }) {
  const { quickExit } = useAuth()

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-status-done-bg text-status-done">
        <CheckCircle2 aria-hidden="true" className="size-8" />
      </span>
      <h1 className="mt-4 text-3xl">Laporanmu sudah terkirim</h1>
      <p className="mt-2 text-body">
        Terima kasih sudah berani bercerita. Laporanmu akan diperiksa petugas
        dalam waktu 24 jam.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-body">
          Nomor laporan
        </p>
        <p className="font-sans text-3xl font-semibold text-primary">
          {report.noLaporan}
        </p>
        <p className="mt-3 text-sm text-body">
          Catat nomor ini. Kamu bisa memantau status dan balasan di halaman
          <strong className="text-navy"> Laporan Saya</strong>.
        </p>
      </Card>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink to={`/santri/laporan/${report.id}`}>
          Lihat laporanku
        </ButtonLink>
        <Button variant="secondary" onClick={quickExit}>
          Selesai dan keluar
        </Button>
      </div>
    </div>
  )
}

export default function CreateReportPage() {
  const createReport = useCreateReport()
  const toast = useToast()
  const navigate = useNavigate()
  const [created, setCreated] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      kategori: '',
      isi: '',
      tampilkan_identitas: false,
    },
  })

  const kategori = useWatch({ control, name: 'kategori' })
  const isi = useWatch({ control, name: 'isi' }) ?? ''
  const tampilkanIdentitas = Boolean(
    useWatch({ control, name: 'tampilkan_identitas' }),
  )
  const kePimpinan = routesToPimpinan({ kategori })

  const onSubmit = async (values) => {
    try {
      const report = await createReport.mutateAsync({
        kategori: values.kategori,
        isi: values.isi,
        tampilkan_identitas: values.tampilkan_identitas,
      })
      setCreated(report)
    } catch (error) {
      if (error?.status === 422 && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (['kategori', 'isi'].includes(field)) {
            setError(field, { message: messages[0] })
          }
        })
        toast.showToast('Periksa kembali isianmu, ya.', 'error')
      } else {
        toast.showToast(error?.message ?? 'Laporan gagal dikirim.', 'error')
      }
    }
  }

  if (created) return <SuccessScreen report={created} />

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 text-center">
        <ShieldCheck aria-hidden="true" className="mx-auto size-8 text-primary" />
        <h1 className="mt-3 text-3xl">Ceritakan dengan tenang</h1>
        <p className="mt-2 text-body">
          Kamu tidak harus sempurna. Tulis saja apa yang ingin kamu sampaikan.
        </p>
      </header>

      <Card className="mb-6 border-l-4 border-primary p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <LifeBuoy aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-bold text-navy">Butuh bantuan segera?</h2>
            <p className="mt-1 text-sm leading-6 text-body">
              Jika kamu sedang dalam bahaya, segera hubungi pengurus atau ustaz
              terdekat. Kamu juga dapat menghubungi SAPA 129 melalui{' '}
              <a href="tel:129" className="font-semibold text-primary underline underline-offset-2">
                telepon 129
              </a>
              . Untuk membuat laporan di sini, pilih kategori, ceritakan
              kejadian, lalu kirim.
            </p>
          </div>
        </div>
      </Card>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        autoComplete="off"
        noValidate
      >
        <Card className="p-5 sm:p-6">
          <fieldset>
            <legend className="text-lg font-semibold text-navy">
              Ini tentang apa?
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((category) => {
                const selected = kategori === category.value
                return (
                  <label
                    key={category.value}
                    className={cn(
                      'cursor-pointer rounded-2xl border p-4 transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/70',
                    )}
                  >
                    <input
                      type="radio"
                      value={category.value}
                      className="sr-only"
                      {...register('kategori')}
                    />
                    <span className="flex items-center gap-2 font-semibold text-navy">
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-full border-2',
                          selected ? 'border-primary' : 'border-border',
                        )}
                      >
                        {selected ? (
                          <span className="size-2.5 rounded-full bg-primary" />
                        ) : null}
                      </span>
                      {category.label}
                    </span>
                    <span className="mt-1 block text-sm text-body">
                      {category.description}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.kategori ? (
              <p role="alert" className="mt-2 text-sm font-medium text-danger">
                {errors.kategori.message}
              </p>
            ) : null}
          </fieldset>
        </Card>

        {kePimpinan ? (
          <div className="flex items-start gap-2 rounded-2xl border border-primary/40 bg-amber/15 px-4 py-3 text-sm text-navy">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary-hover" />
            <p>Laporan tentang pengurus akan langsung diteruskan ke pimpinan.</p>
          </div>
        ) : null}

        <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          <LifeBuoy aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Bila ada bahaya langsung, segera hubungi pengurus atau ustaz
            terdekat, atau layanan SAPA 129.
          </p>
        </div>

        <Card className="p-5 sm:p-6">
          <Textarea
            id="isi"
            label="Ceritamu"
            rows={7}
            required
            autoComplete="off"
            placeholder="Tulis di sini dengan bahasamu sendiri…"
            error={errors.isi?.message}
            hint={`${Math.min(isi.length, MAX)} / ${MAX} karakter`}
            {...register('isi')}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <Switch
            id="tampilkan_identitas"
            label="Tampilkan namaku ke petugas"
            description="Nama hanya dapat dilihat pengurus dan pimpinan jika kamu mengaktifkan pilihan ini."
            checked={tampilkanIdentitas}
            onChange={(next) =>
              setValue('tampilkan_identitas', next, { shouldDirty: true })
            }
          />
          <p className="mt-3 flex items-start gap-2 text-sm text-body">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-hover" />
            Kamu bisa mengubah pilihan ini kapan saja di halaman laporanmu.
          </p>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/santri/laporan-saya')}
          >
            Lihat laporan saya
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting}>
            Kirim laporan
          </Button>
        </div>
      </form>
    </div>
  )
}
