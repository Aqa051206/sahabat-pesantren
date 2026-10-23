const idKey = (id) => (id == null ? id : String(id))

export const reportKeys = {
  mine: () => ['reports', 'mine'],
  detail: (id) => ['reports', 'detail', idKey(id)],
  staff: (filters) => ['reports', 'staff', filters],
  conversation: (id) => ['conversation', idKey(id)],
  summary: () => ['dashboard', 'summary'],
  accounts: (filters) => ['admin', 'accounts', filters],
}
