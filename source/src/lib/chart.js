/** Smooth line through points without overshooting peaks (monotone cubic / Fritsch–Carlson). */
export function monotone(points) {
  const n = points.length
  if (n < 2) return ''
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const dx = []
  const m = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i] || 1e-6
    m[i] = (ys[i + 1] - ys[i]) / dx[i]
  }
  const t = new Array(n)
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
      continue
    }
    const a = t[i] / m[i]
    const b = t[i + 1] / m[i]
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      t[i] = k * a * m[i]
      t[i + 1] = k * b * m[i]
    }
  }
  const f = (v) => Math.round(v * 100) / 100
  let d = `M${f(xs[0])},${f(ys[0])}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${f(xs[i] + h)},${f(ys[i] + t[i] * h)} ${f(xs[i + 1] - h)},${f(ys[i + 1] - t[i + 1] * h)} ${f(xs[i + 1])},${f(ys[i + 1])}`
  }
  return d
}

/** Closes a line path down to a baseline so it can be filled. */
export const toArea = (line, points, base) =>
  line ? `${line}L${points[points.length - 1][0]},${base}L${points[0][0]},${base}Z` : ''

/** Small seeded random generator, so "refresh" produces repeatable data. */
export function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
