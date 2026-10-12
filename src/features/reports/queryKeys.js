export const reportKeys = {
  mine: (page) => ['reports', 'mine', page],
  detail: (kode) => ['reports', 'detail', kode],
  staff: (filters) => ['reports', 'staff', filters],
  conversation: (kode) => ['conversation', kode],
  summary: () => ['dashboard', 'summary'],
  accounts: (filters) => ['admin', 'accounts', filters],
}
