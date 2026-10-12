export const displayReporter = (report) =>
  report.tampilkanIdentitas && report.pelaporNama
    ? report.pelaporNama
    : 'Pelapor (identitas disembunyikan)'
