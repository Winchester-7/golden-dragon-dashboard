/* ---------------- intro timing (ms) ----------------
   The intro follows Dashboard v22: the logo draws itself, flies into the
   sidebar, and the whole app opens out of it in an expanding circle.
   BOOT_BASE: when the first card starts landing.
   BOOT_MS:   when the whole board has settled. */
export const BOOT_BASE = 1150
export const BOOT_MS = 3600

/* each card waits --d × STAGGER before it lands (keep in sync with fx.css) */
export const STAGGER = 60

export const prefersReduced = () =>
  document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
