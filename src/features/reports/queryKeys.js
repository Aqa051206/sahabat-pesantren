export const reportKeys = {
  mine: (page) => ['reports', 'mine', page],
  detail: (id) => ['reports', 'detail', id],
  staff: (filters) => ['reports', 'staff', filters],
  conversation: (id) => ['conversation', id],
  summary: () => ['dashboard', 'summary'],
  accounts: (filters) => ['admin', 'accounts', filters],
}
