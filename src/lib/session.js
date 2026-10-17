// Sesi disimpan di localStorage agar satu browser memakai satu akun dan
// sinkron antar-tab. Isi laporan/draf tetap dilarang di storage browser.

const SESSION_KEY = 'sp.session'

export const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // storage tidak tersedia: abaikan, sesi tetap hidup di memori React.
  }
}

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // tidak ada yang perlu dilakukan
  }
}

export const getToken = () => getSession()?.token ?? null

// Perubahan dari tab lain. Event `storage` hanya terkirim ke tab lain.
export const onSessionChange = (listener) => {
  const handle = (event) => {
    if (event.key === SESSION_KEY || event.key === null) {
      listener(getSession())
    }
  }
  window.addEventListener('storage', handle)
  return () => window.removeEventListener('storage', handle)
}

const listeners = new Set()

export const onSessionExpired = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const emitSessionExpired = () => {
  listeners.forEach((listener) => listener())
}
