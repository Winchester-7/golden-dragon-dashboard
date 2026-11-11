import { useCallback, useContext, useState } from 'react'
import { IntroContext } from './store'
import { BOOT_BASE, STAGGER } from './motion'

/** Delay (ms) for script-driven animations so they start once card `d` has landed. */
export function useEnter(d = 0, extra = 0) {
  const intro = useContext(IntroContext)
  return (intro ? BOOT_BASE : 0) + d * STAGGER + extra
}

function placeAt(el, align) {
  const r = el.getBoundingClientRect()
  const roomBelow = window.innerHeight - r.bottom
  const below = roomBelow > 280 || roomBelow > r.top
  return {
    top: below ? r.bottom + 6 : undefined,
    bottom: below ? undefined : window.innerHeight - r.top + 6,
    left: align === 'right' ? undefined : Math.max(8, r.left),
    right: align === 'right' ? Math.max(8, window.innerWidth - r.right) : undefined,
    minWidth: r.width,
    origin: `${below ? 'top' : 'bottom'} ${align === 'right' ? 'right' : 'left'}`,
    anchor: el,
  }
}

/** State for a floating menu anchored to the button that opened it (pass `toggle` as onClick). */
export function usePopover(align = 'left') {
  const [pos, setPos] = useState(null)
  const close = useCallback(() => setPos(null), [])
  const toggle = useCallback(
    (e) => {
      const el = e.currentTarget
      setPos((p) => (p ? null : placeAt(el, align)))
    },
    [align],
  )
  return { open: !!pos, pos, toggle, close }
}

/** Downloads rows (arrays of cells) as a CSV file. */
export function downloadCsv(filename, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
