// Sesi hanya disimpan di sessionStorage (token tidak pernah ke localStorage).
// Dilarang menyimpan isi laporan/draf di storage browser.

const SESSION_KEY = 'sp.session'

export const getSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setSession = (session) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // storage tidak tersedia: abaikan, sesi tetap hidup di memori React.
  }
}

export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // tidak ada yang perlu dilakukan
  }
}

export const getToken = () => getSession()?.token ?? null

const listeners = new Set()

export const onSessionExpired = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const emitSessionExpired = () => {
  listeners.forEach((listener) => listener())
}
