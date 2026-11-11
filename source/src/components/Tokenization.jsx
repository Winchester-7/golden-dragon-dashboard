import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { RANGES } from '../data/hotel'
import { monotone, toArea } from '../lib/chart'
import { num } from '../lib/format'

const score = (v) => `${v.toFixed(1)} из 10`
import { useCountUp, useSize, useTween } from '../lib/hooks'
import { Segmented } from './kit'
import { useEnter } from '../lib/ui'

const TABS = ['День', 'Неделя', 'Месяц', 'Квартал']
const SERIES = [
  { id: 'mortgage', label: 'Звонки из номеров', color: 'var(--green)' },
  { id: 'mbs', label: 'Беседы у стойки', color: 'var(--purple)' },
]
const PAD_X = 14
const MODES = [
  { id: 'line', label: 'Линия', icon: 'line' },
  { id: 'bars', label: 'Столбцы', icon: 'bars' },
]

export default function Tokenization() {
  const [range, setRange] = useState('Неделя')
  const [pin, setPin] = useState(RANGES['Неделя'].pin)
  const [hover, setHover] = useState(null)
  const [show, setShow] = useState({ mortgage: true, mbs: true })
  const [mode, setMode] = useState('line')
  const data = RANGES[range]

  const mort = useTween(data.mortgage, 750)
  const mbs = useTween(data.mbs, 750)
  const domain = useMemo(() => {
    const vals = [...(show.mortgage ? data.mortgage : []), ...(show.mbs ? data.mbs : [])]
    const v = vals.length ? vals : data.mortgage
    const lo = Math.min(...v)
    const hi = Math.max(...v)
    if (mode === 'bars') return [0, 11.5]
    const pad = (hi - lo) * 0.16 || hi * 0.1
    return [lo - pad * 0.7, hi + pad * 1.6]
  }, [data, show, mode])
  const dom = useTween(domain, 750)
  const count = useCountUp(data.count, 1100, useEnter(2, 150))

  const canvasRef = useRef(null)
  const { w, h } = useSize(canvasRef)
  const n = data.labels.length
  const top = 6
  const bottom = Math.max(top + 1, h - 4)
  const x = (i) => PAD_X + (i * (w - PAD_X * 2)) / (n - 1)
  const y = (v) => bottom - ((v - dom[0]) / (dom[1] - dom[0] || 1)) * (bottom - top)
  const ptsM = mort.map((v, i) => [x(i), y(v)])
  const ptsB = mbs.map((v, i) => [x(i), y(v)])
  const lineM = w ? monotone(ptsM) : ''
  const lineB = w ? monotone(ptsB) : ''

  const idx = hover ?? pin
  const primary = show.mortgage || !show.mbs ? 'mortgage' : 'mbs'
  const focus = primary === 'mortgage' ? ptsM[idx] : ptsB[idx]
  const focusVal = (primary === 'mortgage' ? mort : mbs)[idx]

  const pickIndex = (clientX) => {
    const r = canvasRef.current.getBoundingClientRect()
    const i = Math.round(((clientX - r.left - PAD_X) / (r.width - PAD_X * 2)) * (n - 1))
    return Math.max(0, Math.min(n - 1, i))
  }

  /* sliding pill under the active range tab */
  const tabsRef = useRef(null)
  const tabPill = useRef(null)
  useLayoutEffect(() => {
    const b = tabsRef.current?.querySelector('.is-on')
    const p = tabPill.current
    if (!b || !p) return
    p.style.width = `${b.offsetWidth}px`
    p.style.transform = `translateX(${b.offsetLeft}px)`
  }, [range, w])

  const chooseRange = (r) => {
    setRange(r)
    setPin(RANGES[r].pin)
    setHover(null)
  }

  return (
    <section className="tk sect rise" id="sec-tokenization" style={{ '--d': 2 }}>
      <div className="sec-head">
        <h2 className="sec-title">Оценки ИИ</h2>
        <p className="sec-sub">
          <b>{num(Math.round(count))}</b> разговоров прослушано
        </p>
      </div>

      <div className="card tk-card">
        <div className="tk-legend" role="group" aria-label="Каналы">
          {SERIES.map((s) => (
            <button
              key={s.id}
              className={`legend-btn ${show[s.id] ? '' : 'is-off'}`}
              style={{ '--c': s.color }}
              aria-pressed={show[s.id]}
              onClick={() => setShow((v) => (v[s.id] && !v[s.id === 'mbs' ? 'mortgage' : 'mbs'] ? v : { ...v, [s.id]: !v[s.id] }))}
            >
              <i />
              {s.label}
            </button>
          ))}
          <span className="tk-spacer" />
          <Segmented size="sm" label="Вид графика" options={MODES} value={mode} onChange={setMode} />
        </div>

        <div className="tk-x" aria-hidden="true">
          {w > 0 &&
            data.labels.map((l, i) => (
              <span key={`${range}-${l}`} style={{ left: x(i) }} className={i === idx ? 'is-on' : ''}>
                {l}
              </span>
            ))}
        </div>

        <div
          className="tk-canvas"
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={`График оценок, ${range.toLowerCase()}. ${data.labels[idx]}: ${score(focusVal)}.`}
          onPointerMove={(e) => setHover(pickIndex(e.clientX))}
          onPointerLeave={() => setHover(null)}
          onClick={(e) => setPin(pickIndex(e.clientX))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setPin((p) => Math.min(n - 1, p + 1))
            if (e.key === 'ArrowLeft') setPin((p) => Math.max(0, p - 1))
          }}
        >
          {w > 0 && (
            <svg width={w} height={h}>
              <defs>
                <linearGradient id="tkArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6cc06a" stopOpacity="0.26" />
                  <stop offset="1" stopColor="#6cc06a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="tkCol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6cc06a" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#6cc06a" stopOpacity="0" />
                </linearGradient>
                <clipPath id="tkClip">
                  <rect x="0" y={top} width={w} height={bottom - top} />
                </clipPath>
              </defs>

              {[0, 0.5, 1].map((f) => (
                <line key={f} className="tk-grid" x1="0" x2={w} y1={top + f * (bottom - top)} y2={top + f * (bottom - top)} />
              ))}

              <g clipPath="url(#tkClip)">
                <g className="tk-follow" style={{ transform: `translate(${focus[0]}px, ${focus[1]}px)` }}>
                  <rect className="tk-col" x="-21" y={-(focus[1] - top) - 40} width="42" height={h + 80} rx="14" fill="url(#tkCol)" />
                  {mode === 'line' && <line className="tk-cross" x1="0" x2="0" y1="0" y2={h} />}
                </g>
              </g>

              {mode === 'line' ? (
                <>
                {show.mortgage && <path className="tk-area" d={toArea(lineM, ptsM, bottom)} fill="url(#tkArea)" />}
                {show.mbs && <path className="tk-line tk-line--mbs" d={lineB} pathLength="1" />}
                {show.mortgage && <path className="tk-line tk-line--mort" d={lineM} pathLength="1" />}
                {show.mbs &&
                  ptsB.map(([px, py], i) => (
                    <circle key={`b${i}`} className="tk-dot tk-dot--mbs" cx={px} cy={py} r="3.3" style={{ '--i': i }} />
                  ))}
                {show.mortgage &&
                  ptsM.map(([px, py], i) => (
                    <circle key={`m${i}`} className="tk-dot tk-dot--mort" cx={px} cy={py} r="3.3" style={{ '--i': i }} />
                  ))}
                  <g className="tk-follow" style={{ transform: `translate(${focus[0]}px, ${focus[1]}px)` }}>
                    <circle className="tk-halo" r="11" />
                    <circle className="tk-focus" r="5.4" />
                  </g>
                </>
              ) : (
                <g className="tk-bars">
                  {data.labels.map((l, i) => {
                    const both = show.mortgage && show.mbs
                    const bw = Math.max(6, Math.min(13, ((w - PAD_X * 2) / (n - 1)) * 0.2))
                    const bars = [
                      show.mortgage && { id: 'm', v: mort[i], c: 'var(--green)', x: both ? x(i) - bw - 2 : x(i) - bw / 2 },
                      show.mbs && { id: 'b', v: mbs[i], c: '#b56fdf', x: both ? x(i) + 2 : x(i) - bw / 2 },
                    ].filter(Boolean)
                    return (
                      <g key={`${range}-${l}`} className={`tk-bar-col ${i === idx ? 'is-on' : ''}`} style={{ '--i': i }}>
                        {bars.map((b) => (
                          <rect key={b.id} className="tk-bar" x={b.x} y={y(b.v)} width={bw} height={Math.max(0, bottom - y(b.v))} rx={bw / 2} fill={b.c} />
                        ))}
                      </g>
                    )
                  })}
                </g>
              )}
            </svg>
          )}
          {w > 0 && (
            <div className="tk-tip" style={{ '--x': focus[0], '--y': focus[1] }}>
              <b>{score(focusVal)}</b>
              <span>{data.labels[idx]}</span>
            </div>
          )}
        </div>

        <div className="tabs" ref={tabsRef} role="tablist" aria-label="Период">
          <span className="tabs-pill" ref={tabPill} aria-hidden="true" />
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={range === t} className={range === t ? 'is-on' : ''} onClick={() => chooseRange(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
