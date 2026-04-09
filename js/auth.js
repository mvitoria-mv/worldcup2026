// ============================================================
// Área de Membros — Auth (client-side, sessionStorage)
// ============================================================
const USERS = { demo: 'copa2026' }
const KEY   = 'wc2026_auth'

export function login(user, pass) {
  if (USERS[user] && USERS[user] === pass) {
    sessionStorage.setItem(KEY, JSON.stringify({ user, ts: Date.now() }))
    return true
  }
  return false
}

export function logout() {
  sessionStorage.removeItem(KEY)
}

export function isLoggedIn() {
  return !!sessionStorage.getItem(KEY)
}

export function getUser() {
  const raw = sessionStorage.getItem(KEY)
  return raw ? JSON.parse(raw).user : null
}
