import { useCallback, useState } from 'react'
import { useApp } from './store'

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

/**
 * Like useState, but the value lives in the app (not the page), so it survives tab changes.
 * Use a unique key per piece of state, e.g. useShared('tokenization.mints', seedMints).
 */
export function useShared(key, initial) {
  const { shared, setShared } = useApp()
  const [fallback] = useState(initial)
  const value = has(shared, key) ? shared[key] : fallback
  const set = useCallback(
    (next) =>
      setShared((s) => {
        const cur = has(s, key) ? s[key] : fallback
        return { ...s, [key]: typeof next === 'function' ? next(cur) : next }
      }),
    [key, fallback, setShared],
  )
  return [value, set]
}
