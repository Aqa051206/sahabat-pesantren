// Nama hanya tampil bila santri mengizinkan: lewat saklar di laporannya
// atau lewat persetujuan atas permintaan pimpinan.
export const identityVisible = (report, viewerRole) =>
  Boolean(report.tampilkanIdentitas) ||
  (viewerRole === 'pimpinan' &&
    report.permintaanIdentitas?.status === 'disetujui')

export const displayReporter = (report, viewerRole) =>
  identityVisible(report, viewerRole) && report.pelaporNama
    ? report.pelaporNama
    : 'Pelapor (identitas disembunyikan)'
