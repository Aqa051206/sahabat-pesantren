export const reportKeys = {
  mine: () => ['reports', 'mine'],
  detail: (id) => ['reports', 'detail', id],
  staff: (filters) => ['reports', 'staff', filters],
  conversation: (id) => ['conversation', id],
  summary: () => ['dashboard', 'summary'],
  accounts: (filters) => ['admin', 'accounts', filters],
}
