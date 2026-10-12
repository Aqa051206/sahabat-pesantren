// CSV aman: sel yang diawali =, +, -, @ diberi awalan petik tunggal agar
// tidak dieksekusi sebagai formula saat dibuka di aplikasi spreadsheet.

const RISKY_PREFIX = /^[=+\-@\t\r]/

const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value)
  const guarded = RISKY_PREFIX.test(text) ? `'${text}` : text
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`
  }
  return guarded
}

export const toCsv = (rows) =>
  rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')

export const downloadCsv = (filename, rows) => {
  const csv = toCsv(rows)
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
