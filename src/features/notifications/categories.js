import {
  FilePlus2,
  MessageCircle,
  RefreshCw,
  ShieldQuestion,
} from 'lucide-react'
import { ROLES } from '../../lib/constants'

const SANTRI_CATEGORIES = [
  {
    key: 'permintaanIdentitas',
    label: 'Permintaan melihat identitas',
    description: 'Pimpinan mengajukan permintaan untuk melihat namamu.',
    icon: ShieldQuestion,
    to: '/santri/laporan-saya',
  },
  {
    key: 'pesanBaru',
    label: 'Pesan baru dari petugas',
    description: 'Ada balasan baru pada laporanmu.',
    icon: MessageCircle,
    to: '/santri/laporan-saya',
  },
  {
    key: 'statusDiubah',
    label: 'Status laporan berubah',
    description: 'Status salah satu laporanmu sudah diperbarui.',
    icon: RefreshCw,
    to: '/santri/laporan-saya',
  },
]

const STAFF_CATEGORIES = [
  {
    key: 'laporanBaru',
    label: 'Laporan baru',
    description: 'Ada laporan baru yang perlu ditinjau.',
    icon: FilePlus2,
    to: '/petugas',
  },
  {
    key: 'pesanBaru',
    label: 'Pesan baru pada laporan',
    description: 'Ada pesan baru pada laporan yang belum selesai.',
    icon: MessageCircle,
    to: '/petugas',
  },
]

export const getNotificationCategories = (role, summary) => {
  const source = role === ROLES.SANTRI ? SANTRI_CATEGORIES : STAFF_CATEGORIES
  return source.map((category) => ({
    ...category,
    count: summary?.[category.key] ?? 0,
  }))
}
