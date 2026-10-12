import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Clock3,
  CircleHelp,
  EyeOff,
  HeartHandshake,
  Hand,
  LockKeyhole,
  MessageCircle,
  Monitor,
  Phone,
  Route,
  ShieldCheck,
  UsersRound,
  UserRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AboutIllustration from '../assets/illustrations/AboutIllustration'
import HeroIllustration from '../assets/illustrations/HeroIllustration'
import KioskIllustration from '../assets/illustrations/KioskIllustration'
import WaveDivider from '../assets/illustrations/WaveDivider'
import ButtonLink from '../components/ui/ButtonLink'
import Card from '../components/ui/Card'
import { useAuth } from '../features/auth/auth-context'
import { homeForRole } from '../lib/constants'

const FEATURES = [
  {
    icon: Monitor,
    title: 'Melapor lewat komputer',
    text: 'Gunakan komputer pojok curhat. Sesi akan keluar otomatis setelah tidak aktif.',
    color: 'bg-sky-50 text-primary',
  },
  {
    icon: EyeOff,
    title: 'Identitas disamarkan',
    text: 'Namamu tidak ditampilkan kepada pengurus dan pimpinan kecuali kamu memilihnya.',
    color: 'bg-pink/15 text-primary',
  },
  {
    icon: Route,
    title: 'Laporan ke jalur tepat',
    text: 'Laporan darurat dan laporan tentang pengurus diteruskan kepada pimpinan.',
    color: 'bg-mint-50 text-primary',
  },
  {
    icon: Clock3,
    title: 'Ada batas penanganan',
    text: 'Laporan baru yang belum ditangani dapat diteruskan ke pimpinan sesuai alur.',
    color: 'bg-amber/15 text-primary',
  },
  {
    icon: MessageCircle,
    title: 'Percakapan dua arah',
    text: 'Pantau balasan petugas dari halaman Laporan Saya.',
    color: 'bg-lavender/15 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Ringkasan untuk pimpinan',
    text: 'Pimpinan dapat melihat ringkasan tanpa menampilkan data pribadi pelapor.',
    color: 'bg-leaf/15 text-primary',
  },
]

const CATEGORIES = [
  ['Perundungan', UsersRound, 'bg-sky-50'],
  ['Kekerasan fisik', Hand, 'bg-salmon/15'],
  ['Kekerasan verbal', MessageCircle, 'bg-lavender/15'],
  ['Masalah dengan pengurus', UserRound, 'bg-pink/15'],
  ['Masalah pribadi', HeartHandshake, 'bg-leaf/15'],
  ['Lainnya', CircleHelp, 'bg-amber/15'],
]

const REPORT_STEPS = [
  ['Laporan dibuat', 'Kurang dari 3 menit', 'bg-sky-50'],
  ['Diteruskan ke penerima', 'Otomatis sesuai jalur', 'bg-salmon/15'],
  ['Ditinjau petugas', 'Target tinjauan 24 jam', 'bg-lavender/15'],
  ['Klarifikasi', 'Jika dibutuhkan', 'bg-mint-50'],
  ['Diproses', 'Status dapat dipantau', 'bg-pink/15'],
  ['Selesai', 'Riwayat tetap tercatat', 'bg-band-1'],
]

const GALLERY_ITEMS = [
  { title: 'Ruang belajar bersama', color: 'from-mint-50 to-sky-50', scene: 'study' },
  { title: 'Kebersamaan di pesantren', color: 'from-sky-50 to-band-2', scene: 'community' },
  { title: 'Lingkungan yang asri', color: 'from-band-1 to-mint-50', scene: 'garden' },
]

function GalleryIllustration({ scene }) {
  return (
    <svg viewBox="0 0 480 280" aria-hidden="true" className="h-full w-full">
      <rect width="480" height="280" rx="26" fill="var(--color-sky-50)" />
      <circle cx="390" cy="55" r="27" fill="var(--color-amber)" opacity=".7" />
      <path d="M0 205 Q115 155 220 202 T480 190 V280 H0Z" fill="var(--color-mint-50)" />
      {scene === 'study' ? (
        <>
          <path d="M96 68h288v130H96z" fill="white" opacity=".92" />
          <path d="M124 92h232v86H124z" fill="var(--color-mint-50)" />
          <path d="M228 92v86M124 135h232" stroke="var(--color-line)" strokeWidth="6" />
          <rect x="160" y="206" width="160" height="14" rx="7" fill="var(--color-primary)" opacity=".72" />
          <rect x="187" y="185" width="18" height="30" rx="8" fill="var(--color-pink)" />
          <rect x="278" y="185" width="18" height="30" rx="8" fill="var(--color-lavender)" />
        </>
      ) : null}
      {scene === 'community' ? (
        <>
          <path d="M75 193V97l165-54 165 54v96Z" fill="white" opacity=".9" />
          <path d="M57 100 240 36l183 64" fill="none" stroke="var(--color-primary)" strokeWidth="12" strokeLinejoin="round" />
          <path d="M212 194v-58a28 28 0 0 1 56 0v58" fill="var(--color-sky-50)" />
          <circle cx="158" cy="165" r="18" fill="var(--color-amber)" />
          <circle cx="322" cy="165" r="18" fill="var(--color-pink)" />
          <path d="M133 217q25-39 50 0m114 0q25-39 50 0" fill="var(--color-lavender)" opacity=".7" />
        </>
      ) : null}
      {scene === 'garden' ? (
        <>
          <path d="M0 212h480v68H0z" fill="var(--color-mint-50)" />
          <path d="M240 280V115m0 44-72-48m72 78 75-67" stroke="var(--color-leaf)" strokeWidth="12" strokeLinecap="round" />
          <circle cx="157" cy="105" r="48" fill="var(--color-mint-50)" />
          <circle cx="329" cy="100" r="54" fill="var(--color-sky-50)" />
          <circle cx="105" cy="198" r="24" fill="var(--color-pink)" opacity=".8" />
          <circle cx="375" cy="195" r="26" fill="var(--color-lavender)" opacity=".6" />
          <path d="M207 280q33-64 66 0" fill="white" opacity=".8" />
        </>
      ) : null}
    </svg>
  )
}

function SectionHeading({ eyebrow, title, text, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-body sm:text-lg">{text}</p> : null}
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate(homeForRole(user.role), { replace: true })
  }, [user, navigate])

  return (
    <div className="overflow-hidden">
      <section className="relative bg-primary">
        <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="mx-auto grid min-h-[640px] w-full max-w-[1600px] items-center gap-8 px-5 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 xl:px-24">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-line">
              Ruang aman santri
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
              Bersuara dengan aman, ditangani dengan serius
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-body">
              Sampaikan cerita lewat komputer pojok curhat. Namamu disamarkan dari pengurus dan pimpinan, kecuali kamu memilih untuk menampilkannya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#profil" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-7 font-semibold text-white shadow-[0_10px_24px_-8px_rgba(18,198,214,0.65)] transition hover:-translate-y-0.5 hover:bg-primary-hover">
                Kenali pesantren <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-body">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />Privasi dijaga</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole className="size-5 text-primary" />Keluar otomatis</span>
              <span className="inline-flex items-center gap-2"><HeartHandshake className="size-5 text-primary" />Ada tindak lanjut</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="absolute -right-10 top-1/4 size-64 rounded-full bg-lavender/10 blur-3xl" />
            <HeroIllustration />
          </div>
        </div>
        <WaveDivider className="absolute inset-x-0 bottom-0 h-14 w-full text-white" />
      </section>

      <section id="profil" className="scroll-mt-24 bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 px-5 py-20 sm:px-10 lg:grid-cols-2 lg:px-16 xl:px-24">
          <div className="rounded-[2rem] bg-gradient-to-br from-mint-50 to-sky-50 p-5 sm:p-10">
            <AboutIllustration />
          </div>
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow="Profil pesantren"
              title="Lingkungan belajar yang bertumbuh bersama"
              text="Sahabat Pesantren membantu santri menyampaikan hal yang mengganggu rasa aman dan kenyamanan belajar. Laporan diterima petugas untuk ditinjau dan ditindaklanjuti dengan alur yang tercatat."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <ShieldCheck className="size-7 text-primary" />
                <h3 className="mt-3 text-lg">Ruang untuk didengar</h3>
                <p className="mt-2 text-sm leading-6 text-body">Cerita dapat disampaikan dengan tenang melalui jalur yang tersedia.</p>
              </Card>
              <Card className="p-5">
                <MessageCircle className="size-7 text-lavender" />
                <h3 className="mt-3 text-lg">Proses yang tercatat</h3>
                <p className="mt-2 text-sm leading-6 text-body">Santri dapat memantau status dan percakapan dari akunnya.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="galeri" className="scroll-mt-24 bg-band-1">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Suasana pesantren"
              title="Ruang untuk belajar dan bertumbuh"
              text="Galeri ilustrasi sementara. Foto asli pesantren dapat menggantikan gambar-gambar ini."
            />
            <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold text-body ring-1 ring-line">Ilustrasi sementara</span>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {GALLERY_ITEMS.map((item) => (
              <Card key={item.title} className="group overflow-hidden bg-white transition duration-200 hover:-translate-y-1">
                <div className={`aspect-[1.7] overflow-hidden bg-gradient-to-br ${item.color}`}>
                  <GalleryIllustration scene={item.scene} />
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <h3 className="text-lg">{item.title}</h3>
                  <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-primary transition group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="scroll-mt-24 bg-gradient-to-br from-mint-50 to-sky-50">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-16 xl:px-24">
          <div>
            <SectionHeading
              eyebrow="Alur laporan"
              title="Dari bilik pojok curhat sampai selesai"
              text="Setiap laporan mengikuti tahapan penanganan yang dapat kamu pantau."
            />
            <a href="#privasi" className="mt-6 inline-flex font-semibold text-primary underline underline-offset-4">Baca janji privasi</a>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {REPORT_STEPS.map(([title, text, color], index) => (
              <li key={title} className={`flex min-h-20 items-center gap-4 rounded-full ${color} px-5 py-3 sm:odd:translate-y-3`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-primary">{index + 1}</span>
                <div>
                  <h3 className="text-sm">{title}</h3>
                  <p className="mt-0.5 text-xs text-body">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <SectionHeading
            eyebrow="Sahabat Pesantren"
            title="Laporan yang lebih mudah diikuti"
            text="Fitur dirancang untuk mendukung pelaporan, komunikasi, dan tindak lanjut dengan memperhatikan privasi santri."
            align="center"
          />
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text, color }) => (
              <article key={title} className="flex gap-4">
                <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icon aria-hidden="true" className="size-7" />
                </span>
                <div>
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-body">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-band-2">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 xl:px-24">
          <div>
            <SectionHeading
              eyebrow="Cara kerja"
              title="Dari cerita menjadi tindak lanjut"
              text="Kamu dapat mengirim laporan, mengikuti perkembangannya, dan membaca balasan petugas melalui akunmu."
            />
            <ButtonLink to="/login" className="mt-7">Lihat alur laporan <ArrowRight aria-hidden="true" className="size-5" /></ButtonLink>
          </div>
          <div className="grid gap-3">
            {[
              ['01', 'Laporan dibuat', 'Pilih kategori dan ceritakan kejadian.'],
              ['02', 'Ditinjau petugas', 'Petugas melihat laporan sesuai jalur penanganan.'],
              ['03', 'Percakapan dan tindak lanjut', 'Pantau balasan serta perubahan status laporan.'],
            ].map(([number, title, text]) => (
              <Card key={number} className="flex items-center gap-5 p-5 sm:p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint-50 text-lg font-extrabold text-primary">{number}</span>
                <div>
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-1 text-sm text-body">{text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 py-20 sm:px-10 lg:grid-cols-2 lg:px-16 xl:px-24">
          <div className="order-2 rounded-[2rem] bg-gradient-to-br from-mint-50 to-sky-50 p-5 sm:p-10 lg:order-1">
            <KioskIllustration />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Privasi dan keamanan"
              title="Kamu berhak merasa aman saat bercerita"
              text="Gunakan komputer pojok curhat tanpa perlu ponsel. Sesi akan berakhir otomatis saat tidak aktif. Hubungan laporan dengan akun dipakai agar kamu bisa memantau laporannya."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-mint-50 px-4 py-2 text-sm font-semibold text-primary">Keluar otomatis</span>
              <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-primary">Identitas disamarkan</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-band-1">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <SectionHeading eyebrow="Kategori laporan" title="Pilih kategori yang paling sesuai" align="center" />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map(([label, Icon, color]) => (
              <div key={label} className="rounded-2xl bg-white p-5 text-center shadow-[0_8px_30px_rgba(28,42,90,0.05)]">
                <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${color}`}>
                  <Icon aria-hidden="true" className="size-7 text-primary" />
                </span>
                <p className="mt-3 text-sm font-bold text-navy">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-band-2">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <SectionHeading
            eyebrow="Panduan singkat"
            title="Informasi untuk setiap peran"
            text="Gunakan perangkat yang tersedia dan ikuti petunjuk di dalam aplikasi."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {[
              { label: 'SANTRI', title: 'Untuk Santri', icon: Monitor, meta: 'Komputer pojok curhat', time: 'Kurang dari 3 menit' },
              { label: 'PETUGAS', title: 'Untuk Petugas', icon: MessageCircle, meta: 'Komputer atau ponsel', time: 'Tinjau laporan secara berkala' },
            ].map(({ label, title, icon: Icon, meta, time }) => (
              <Card key={label} className="grid overflow-hidden sm:grid-cols-[0.8fr_1.2fr]">
                <div className="relative flex min-h-48 items-center justify-center bg-gradient-to-br from-mint-50 to-sky-50 p-6">
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-extrabold tracking-wide text-primary">{label}</span>
                  <KioskIllustration />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-2xl">{title}</h3>
                  <p className="mt-4 flex items-center gap-2 text-sm text-body"><Icon aria-hidden="true" className="size-4 text-primary" />{meta}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-body"><Clock3 aria-hidden="true" className="size-4 text-primary" />{time}</p>
                  <ButtonLink to="/login" className="mt-5 w-fit" size="sm">Selengkapnya <ArrowRight aria-hidden="true" className="size-4" /></ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 py-20 sm:px-10 lg:grid-cols-2 lg:px-16 xl:px-24">
          <div>
            <SectionHeading
              eyebrow="Komitmen kami"
              title="Menjaga proses tetap jelas"
              text="Angka berikut adalah target layanan untuk uji coba, bukan hasil pengukuran."
            />
            <ButtonLink to="/login" className="mt-7">Mulai Melapor</ButtonLink>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {[
              ['3 menit', 'Target waktu membuat laporan', 'border-primary'],
              ['24 jam', 'Target batas klarifikasi', 'border-salmon'],
              ['0', 'Target kebocoran identitas', 'border-lavender'],
            ].map(([value, label, ring]) => (
              <div key={value} className="text-center">
                <div className={`mx-auto grid aspect-square w-full max-w-44 place-items-center rounded-full border-[8px] ${ring} bg-white`}>
                  <span className="text-xl font-extrabold text-navy sm:text-3xl">{value}</span>
                </div>
                <p className="mx-auto mt-3 max-w-40 text-xs font-semibold leading-5 text-body sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="privasi" className="scroll-mt-24 bg-band-1">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-10 lg:px-16 xl:px-24">
          <SectionHeading
            eyebrow="Yang perlu kamu tahu"
            title="Jawaban jujur untuk pertanyaan penting"
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              ['Siapa yang bisa melihat laporanku?', 'Pengurus dan pimpinan tidak melihat namamu kecuali kamu memilih untuk menampilkan identitas.'],
              ['Apakah namaku benar-benar aman?', 'Sistem menyimpan hubungan laporan dengan akun agar kamu bisa memantau laporan. Hubungan itu tidak dapat dibuka oleh pengurus maupun pimpinan.'],
              ['Bagaimana jika darurat?', 'Hubungi pengurus atau ustaz terdekat. Kamu juga dapat menghubungi SAPA 129.'],
            ].map(([title, text]) => (
              <Card key={title} className="p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-primary"><ShieldCheck aria-hidden="true" className="size-6" /></span>
                <h3 className="mt-4 text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-body">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="bantuan" className="scroll-mt-24 bg-gradient-to-br from-mint-50 to-sky-50">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16 xl:px-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Butuh bantuan segera?</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Jangan hadapi keadaan darurat sendirian</h2>
            <p className="mt-4 max-w-3xl text-body">Hubungi pengurus atau ustaz terdekat. Kamu juga dapat menghubungi SAPA 129.</p>
          </div>
          <a href="tel:129" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 font-bold text-white shadow-[0_10px_24px_-8px_rgba(18,198,214,0.65)] transition hover:-translate-y-0.5 hover:bg-primary-hover">
            <Phone aria-hidden="true" className="size-5" /> Hubungi SAPA 129
          </a>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 px-5 py-16 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-16 xl:px-24">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">Mulai dari sini</p>
            <h2 className="mt-3 text-3xl text-white sm:text-4xl">Ceritamu layak didengar</h2>
            <p className="mt-4 text-white/75">Masuk untuk membuat laporan atau memantau tindak lanjut yang sedang berjalan.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/login" size="lg">Mulai Melapor <ArrowRight aria-hidden="true" className="size-5" /></ButtonLink>
            <ButtonLink to="/login" size="lg" variant="secondary" className="!border-white !text-white hover:!bg-white/10">Masuk</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
