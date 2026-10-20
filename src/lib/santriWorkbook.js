const SHEET_NAME = 'Santri'
const HEADERS = ['ID Santri', 'NISN', 'Nama Santri']
const TEXT_FORMAT = '@'

const loadExcelJS = async () => {
  const { default: ExcelJS } = await import('exceljs')
  return ExcelJS
}

const setTextFormat = (row) => {
  for (let column = 1; column <= HEADERS.length; column += 1) {
    row.getCell(column).numFmt = TEXT_FORMAT
  }
}

export const createSantriWorkbook = async (rows) => {
  const ExcelJS = await loadExcelJS()
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(SHEET_NAME)

  worksheet.columns = [
    { header: HEADERS[0], key: 'idSantri', width: 20 },
    { header: HEADERS[1], key: 'nisn', width: 20 },
    { header: HEADERS[2], key: 'name', width: 34 },
  ]
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = {
    from: 'A1',
    to: `C${Math.max(1, rows.length + 1)}`,
  }
  worksheet.getRow(1).font = { bold: true }
  setTextFormat(worksheet.getRow(1))

  rows.forEach((item) => {
    const row = worksheet.addRow([
      item.idSantri == null ? '' : String(item.idSantri),
      item.nisn == null ? '' : String(item.nisn),
      item.name ?? '',
    ])
    setTextFormat(row)
  })

  const instructions = workbook.addWorksheet('Petunjuk')
  instructions.addRows([
    ['Petunjuk pembaruan data santri'],
    ['Edit kolom NISN dan Nama Santri sesuai kebutuhan.'],
    ['ID Santri adalah kunci pencocokan sistem; jangan diubah atau dihapus.'],
    ['Untuk menambahkan santri baru, isi NISN dan nama, lalu biarkan ID Santri kosong.'],
    ['Santri yang tidak tercantum di file tidak akan dihapus atau dinonaktifkan.'],
    ['Pastikan kolom NISN disimpan sebagai teks agar angka nol di depan tetap ada.'],
  ])
  instructions.getRow(1).font = { bold: true }
  instructions.getColumn(1).width = 100

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

const cellText = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value) return ''
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim()
    }
    if ('text' in value) return String(value.text).trim()
    return ''
  }
  return String(value).trim()
}

const normalizeHeader = (value) =>
  cellText(value)
    .toLocaleLowerCase('id-ID')
    .replace(/[^a-z0-9]/g, '')

const HEADER_KEYS = {
  idsantri: 'idSantri',
  nisn: 'nisn',
  namasantri: 'name',
  nama: 'name',
}

const IMPORT_HEADERS = [
  ['Nama', 'name'],
  ['Email', 'email'],
  ['NIS', 'nis'],
  ['Jenis Kelamin', 'jenisKelamin'],
  ['Telepon Wali', 'teleponOrtu'],
]

const IMPORT_HEADER_KEYS = {
  name: 'name',
  nama: 'name',
  email: 'email',
  nis: 'nis',
  jeniskelamin: 'jenisKelamin',
  teleponortu: 'teleponOrtu',
  teleponwali: 'teleponOrtu',
}

export const createSantriImportWorkbook = async () => {
  const ExcelJS = await loadExcelJS()
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Santri')
  worksheet.columns = IMPORT_HEADERS.map(([header, key]) => ({
    header,
    key,
    width: key === 'name' ? 30 : 22,
  }))
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = {
    from: 'A1',
    to: `E${Math.max(1, worksheet.rowCount)}`,
  }
  worksheet.getRow(1).font = { bold: true }
  for (let column = 1; column <= IMPORT_HEADERS.length; column += 1) {
    worksheet.getRow(1).getCell(column).numFmt = TEXT_FORMAT
  }
  const instructions = workbook.addWorksheet('Petunjuk')
  instructions.addRows([
    ['Isi semua kolom pada lembar Santri sesuai data santri.'],
    ['NIS harus disimpan sebagai teks agar angka nol di depan tidak hilang.'],
    ['Email digunakan untuk komunikasi akun dan harus unik.'],
  ])
  instructions.getColumn(1).width = 90
  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export const readSantriImportWorkbook = async (file) => {
  const ExcelJS = await loadExcelJS()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const worksheet =
    workbook.getWorksheet('Santri') ?? workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('File Excel tidak memiliki lembar data santri.')
  }

  const headerMap = new Map()
  worksheet.getRow(1).eachCell((cell, column) => {
    const key = IMPORT_HEADER_KEYS[normalizeHeader(cell.value)]
    if (key) headerMap.set(key, column)
  })
  const missingHeaders = IMPORT_HEADERS
    .map(([, key]) => key)
    .filter((key) => !headerMap.has(key))
  if (missingHeaders.length) {
    throw new Error(
      'Kolom wajib: Nama, Email, NIS, Jenis Kelamin, dan Telepon Wali.',
    )
  }

  const rows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const values = Object.fromEntries(
      IMPORT_HEADERS.map(([, key]) => [
        key,
        cellText(row.getCell(headerMap.get(key)).value),
      ]),
    )
    if (Object.values(values).every((value) => !value)) return
    rows.push({ index: rowNumber, ...values })
  })
  return rows
}

export const readSantriWorkbook = async (file) => {
  const ExcelJS = await loadExcelJS()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const worksheet =
    workbook.getWorksheet(SHEET_NAME) ?? workbook.worksheets[0]

  if (!worksheet) {
    throw new Error('File Excel tidak memiliki lembar data santri.')
  }

  const headerMap = new Map()
  worksheet.getRow(1).eachCell((cell, column) => {
    const key = HEADER_KEYS[normalizeHeader(cell.value)]
    if (key) headerMap.set(key, column)
  })

  if (!headerMap.has('idSantri') || !headerMap.has('nisn') || !headerMap.has('name')) {
    throw new Error('Kolom wajib: ID Santri, NISN, dan Nama Santri.')
  }

  const rows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const idSantri = cellText(row.getCell(headerMap.get('idSantri')).value)
    const nisnCell = row.getCell(headerMap.get('nisn')).value
    const nisn = cellText(nisnCell)
    const name = cellText(row.getCell(headerMap.get('name')).value)

    if (!idSantri && !nisn && !name) return
    rows.push({
      index: rowNumber,
      idSantri,
      nisn,
      name,
      nisnIsText: typeof nisnCell === 'string',
    })
  })
  return rows
}
