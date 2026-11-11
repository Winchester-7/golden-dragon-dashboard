export const money = (n, d = 2) =>
  '$' + n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })

export const num = (n, d = 0) => n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })


/** 1.2k, 3.4M — for axis labels and tight spots. */
export function compact(n) {
  const a = Math.abs(n)
  if (a >= 1e9) return `${+(n / 1e9).toFixed(a >= 1e10 ? 0 : 1)}B`
  if (a >= 1e6) return `${+(n / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`
  if (a >= 1e3) return `${+(n / 1e3).toFixed(a >= 1e5 ? 0 : 1)}k`
  return `${Math.round(n)}`
}

export const usd = (n) => `$${compact(n)}`

/** "just now", "12m ago", "3h ago", "2d ago", "Oct 4". */
export function ago(at, now = Date.now()) {
  if (at == null) return 'никогда'
  const s = Math.max(0, (now - at) / 1000)
  if (s < 60) return 'только что'
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`
  if (s < 86400 * 14) return `${Math.floor(s / 86400)} дн назад`
  return new Date(at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
}

export const clock = (at) => new Date(at).toLocaleTimeString('ru-RU', { hour: 'numeric', minute: '2-digit' })

export const initials = (name) =>
  name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** "Today" inside 24h, otherwise a "03d 12h 23m" countdown. */
export function dueLabel(due, now) {
  const ms = due - now
  if (ms <= 0) return { text: 'просрочено', urgent: true }
  if (ms < 864e5) return { text: 'сегодня', urgent: true }
  const m = Math.floor(ms / 6e4)
  return { text: `${Math.floor(m / 1440)} дн ${Math.floor(m / 60) % 24} ч`, urgent: false }
}
