// Nama hanya tampil bila santri mengizinkan: lewat saklar di laporannya
// atau lewat persetujuan atas permintaan pimpinan.
export const identityVisible = (report) =>
  Boolean(report.tampilkanIdentitas) ||
  report.permintaanIdentitas?.status === 'disetujui'

export const displayReporter = (report) =>
  identityVisible(report) && report.pelaporNama
    ? report.pelaporNama
    : 'Pelapor (identitas disembunyikan)'
