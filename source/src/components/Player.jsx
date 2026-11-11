import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon'
import { useApp } from '../lib/store'
import { mmss, secs } from '../data/hotel'

const BARS = 46
/** В макете звука нет: кнопка показывает, как идёт прослушивание (в 6 раз быстрее). */
const SPEED = 6

function useWave(id) {
  return useMemo(() => {
    const seed = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0)
    return Array.from({ length: BARS }, (_, k) => Math.min(100, 24 + Math.round(Math.abs(Math.sin(k * 0.9 + seed) * 46 + Math.sin(k * 2.3 + seed * 1.7) * 26))))
  }, [id])
}

export default function Player({ id, dur, compact = false }) {
  const { playing, setPlaying } = useApp()
  const on = playing === id
  const total = secs(dur)
  const wave = useWave(id)
  const [pos, setPos] = useState(0)

  useEffect(() => {
    if (!on) return undefined
    let raf
    let last = performance.now()
    let p = 0
    const tick = (now) => {
      p += ((now - last) / 1000) * SPEED
      last = now
      if (p >= total) {
        setPos(0)
        setPlaying((cur) => (cur === id ? null : cur))
        return
      }
      setPos(p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setPos(0)
    }
  }, [on, id, total, setPlaying])

  const frac = on ? pos / total : 0
  return (
    <div className={`player ${on ? 'is-on' : ''} ${compact ? 'is-compact' : ''}`}>
      <button
        type="button"
        className="player-btn"
        aria-label={on ? 'Остановить' : 'Слушать запись'}
        onClick={(e) => {
          e.stopPropagation()
          setPlaying(on ? null : id)
        }}
      >
        <Icon name={on ? 'minus' : 'play'} />
      </button>
      <div className="player-wave" aria-hidden="true">
        {wave.map((h, k) => (
          <i key={k} className={k / BARS < frac ? 'is-played' : ''} style={{ height: `${h}%`, '--k': k }} />
        ))}
      </div>
      <span className="player-time">{on ? `${mmss(pos)} / ${dur}` : dur}</span>
    </div>
  )
}
