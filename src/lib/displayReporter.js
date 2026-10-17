// Backend updates tampilkan_identitas when the santri approves or revokes consent.
export const identityVisible = (report) => Boolean(report.tampilkanIdentitas)

export const displayReporter = (report) =>
  identityVisible(report) && report.pelaporNama
    ? report.pelaporNama
    : 'Pelapor (identitas disembunyikan)'
