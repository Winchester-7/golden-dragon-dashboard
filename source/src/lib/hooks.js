import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  (document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

export const easeOut = (t) => 1 - Math.pow(1 - t, 3)

/** Live pixel size of an element (charts draw in real pixels, so dots stay round). */
export function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (Math.abs(s.w - width) < 0.5 && Math.abs(s.h - height) < 0.5 ? s : { w: width, h: height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/**
 * Glides a number (or an array of numbers) to a new target. Targets must be stable references.
 * `delay` only applies to the very first run, so charts can wait for their card to land.
 */
export function useTween(target, duration = 700, initial = target, delay = 0) {
  const [value, setValue] = useState(initial)
  const current = useRef(initial)
  const first = useRef(true)
  useEffect(() => {
    const from = current.current
    const lerp = (k) =>
      Array.isArray(target)
        ? target.map((b, i) => {
            const a = Array.isArray(from) && from[i] != null ? from[i] : b
            return a + (b - a) * k
          })
        : from + (target - from) * k
    const reduced = reducedMotion()
    const ms = reduced ? 1 : duration
    let raf = 0
    let start = 0
    const step = (now) => {
      if (!start) start = now - 1
      const t = Math.min(1, (now - start) / ms)
      const v = lerp(easeOut(t))
      current.current = v
      setValue(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    const wait = first.current && !reduced ? delay : 0
    const timer = window.setTimeout(() => {
      first.current = false
      raf = requestAnimationFrame(step)
    }, wait)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [target, duration, delay])
  return value
}

/** Keeps the same array reference while its values don't change (safe to pass to useTween). */
export function useStable(values) {
  const sig = values.join('|')
  return useMemo(() => (sig ? sig.split('|').map(Number) : []), [sig])
}

/** Counts a number up from zero on mount, then glides between later values. */
export function useCountUp(value, duration = 1400, delay = 0) {
  const [v, setV] = useState(() => (reducedMotion() ? value : 0))
  const current = useRef(v)
  useEffect(() => {
    const reduced = reducedMotion()
    const ms = reduced ? 1 : duration
    const from = current.current
    let raf = 0
    let start = 0
    const step = (now) => {
      if (!start) start = now - 1
      const t = Math.min(1, (now - start) / ms)
      const x = from + (value - from) * easeOut(t)
      current.current = x
      setV(x)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(step)
    }, reduced ? 0 : delay)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay])
  return v
}

/** Current time, refreshed on an interval (drives the task countdowns). */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

/** Closes a popover on outside click or Escape. */
export function useDismiss(ref, onClose, open) {
  useEffect(() => {
    if (!open) return undefined
    const down = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const key = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [ref, onClose, open])
}

/** useState that survives reloads. */
export function useStored(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key)
      return s == null ? initial : JSON.parse(s)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* storage blocked: keep it in memory */
    }
  }, [key, v])
  return [v, setV]
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/**
 * First-Last-Invert-Play: when rows reorder, each one glides from its old spot.
 * Children opt in with data-flip="<id>"; a row being dragged opts out with data-dragging.
 */
export function useFlip(ref, key) {
  const spots = useRef(new Map())
  useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    const next = new Map()
    for (const node of list.querySelectorAll(':scope > [data-flip]')) {
      const id = node.dataset.flip
      const spot = { x: node.offsetLeft, y: node.offsetTop }
      next.set(id, spot)
      const prev = spots.current.get(id)
      if (!prev || node.dataset.dragging || reducedMotion()) continue
      const dx = prev.x - spot.x
      const dy = prev.y - spot.y
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
          duration: 560,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
      }
    }
    spots.current = next
  }, [ref, key])
}
