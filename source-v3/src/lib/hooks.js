import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduced' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Keeps something mounted long enough to play its exit animation. */
export function usePresence(open, ms = 280) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, mounted, ms]);
  return { mounted, leaving: mounted && !open };
}

/** Eases a number from its last value to `target` (quartic ease-out). */
export function useCountUp(target, { duration = 1300, delay = 0 } = {}) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const instant = reducedMotion();
    const a = from.current;
    let raf;
    let start;
    const step = (now) => {
      start ??= now;
      const t = instant ? 1 : Math.min(1, Math.max(0, (now - start - delay) / duration));
      const v = a + (target - a) * (1 - (1 - t) ** 4);
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  return shown;
}

/** open/close state for a popover; close is stable. */
export function useToggle(initial = false) {
  const [open, setOpen] = useState(initial);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  return { open, toggle, close, setOpen };
}

/** Current time, refreshed every `interval` ms. */
export function useNow(interval = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

/** Content size of an element, kept current (charts draw in real pixels). */
export function useSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

/** Unique, CSS-safe id for SVG gradients. */
export const useSvgId = () => useId().replace(/[^\w-]/g, '');
