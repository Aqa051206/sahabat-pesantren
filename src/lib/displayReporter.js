import { ROLES } from './constants'

const isAnonymous = (name) =>
  !name || /^anonymous$/i.test(String(name).trim())

export const identityVisible = (report, role) =>
  Boolean(report?.tampilkanIdentitas) ||
  (role === ROLES.PIMPINAN &&
    report?.permintaanIdentitas?.status === 'disetujui')

export const displayReporter = (report, role) => {
  const name = report?.pelaporNama
  return identityVisible(report, role) && !isAnonymous(name)
    ? name
    : 'Pelapor (identitas disembunyikan)'
}
