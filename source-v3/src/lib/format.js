export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const uid = () => Math.random().toString(36).slice(2, 9);

/* The reference writes compact numbers with a decimal comma: 17,3K · 7,72K · 73,6% */
const trim = (s) => s.replace(/\.?0+$/, '');

/** 17300 → "17,3K" · 7720 → "7,72K" · 12000 → "12K" · 950 → "950" */
export function compact(n) {
  const a = Math.abs(n);
  if (a >= 1e6) return `${trim((n / 1e6).toFixed(2)).replace('.', ',')}M`;
  if (a >= 1e4) return `${trim((n / 1e3).toFixed(1)).replace('.', ',')}K`;
  if (a >= 1e3) return `${trim((n / 1e3).toFixed(2)).replace('.', ',')}K`;
  return String(Math.round(n));
}

/** 532921 → "532,921" */
export const full = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n));

/** 1234.5 → "$1,234.50" */
export const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

/** 73.6 → "73,6%" */
export const pct = (n, digits = 1) => `${trim(n.toFixed(digits)).replace('.', ',')}%`;

/* ---------- Dates: demo data uses day offsets from today ---------- */
export const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const offsetOf = (date) => Math.round((new Date(date).setHours(0, 0, 0, 0) - TODAY) / 86400000);

const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** 0 → "Today", 1 → "Tomorrow", -1 → "Yesterday", else "Nov 8" */
export function day(offset) {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  return short.format(addDays(TODAY, offset));
}

export const dateLong = (offset) => long.format(addDays(TODAY, offset));

/** Day offset ⇄ "2026-11-05" for <input type="date"> (parsed as local time, not UTC). */
export const isoDate = (offset) => {
  const d = addDays(TODAY, offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const offsetFromIso = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return offsetOf(new Date(y, m - 1, d));
};

/** Monday-first 6×7 grid for a month. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, k) => new Date(year, month, 1 - lead + k));
}

/** Download rows as a CSV file. */
export function downloadCsv(name, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Smooth SVG path through points (Catmull-Rom → Bézier). */
export function smooth(points, t = 0.18) {
  if (points.length < 2) return '';
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let k = 0; k < points.length - 1; k++) {
    const [x0, y0] = points[k - 1] ?? points[k];
    const [x1, y1] = points[k];
    const [x2, y2] = points[k + 1];
    const [x3, y3] = points[k + 2] ?? points[k + 1];
    d += `C${(x1 + (x2 - x0) * t).toFixed(1)} ${(y1 + (y2 - y0) * t).toFixed(1)} ${(x2 - (x3 - x1) * t).toFixed(1)} ${(y2 - (y3 - y1) * t).toFixed(1)} ${x2} ${y2}`;
  }
  return d;
}

/** Round a chart's max up to a friendly number. */
export function niceMax(v, steps = 4) {
  const raw = v / steps;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) * steps;
}

/** 7.25 → "7,3" (оценки по 10-балльной шкале) */
export const num1 = (n) => n.toFixed(1).replace('.', ',');
