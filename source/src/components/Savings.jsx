import { useCallback, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { useApp } from '../lib/store'
import { monotone, seeded, toArea } from '../lib/chart'
import { num } from '../lib/format'
import { useCountUp, useDismiss, useSize, useTween } from '../lib/hooks'
import { useEnter } from '../lib/ui'

const N = 26
const BASE_TOTAL = 7.8

function build(seed) {
  const r = seeded(seed * 7919 + 13)
  const area = []
  const line = []
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const trend = 36 + t * 58
    const wave = Math.sin(i * 1.15 + seed) * 7 + Math.sin(i * 2.7 + seed * 2) * 4
    area.push(Math.max(12, Math.min(99, trend + wave + (r() - 0.5) * 9)))
    line.push(Math.max(14, Math.min(99, trend + 5 + Math.sin(i * 0.8 + 1 + seed) * 6 + (r() - 0.5) * 3)))
  }
  area[N - 1] = 97
  const total = seed === 0 ? BASE_TOTAL : BASE_TOTAL * (1 + (r() - 0.35) * 0.06)
  return { area, line, total }
}

export default function Savings() {
  const { toast } = useApp()
  const [seed, setSeed] = useState(0)
  const [target, setTarget] = useState(true)
  const [menu, setMenu] = useState(false)
  const [hover, setHover] = useState(null)
  const menuRef = useRef(null)
  const closeMenu = useCallback(() => setMenu(false), [])
  useDismiss(menuRef, closeMenu, menu)

  const series = useMemo(() => build(seed), [seed])
  const area = useTween(series.area, 900)
  const line = useTween(series.line, 900)
  const hours = useCountUp(8420, 1500, useEnter(3, 120))
  const btc = useCountUp(81, 1500, useEnter(3, 160))
  const total = useCountUp(series.total, 1700, useEnter(3, 200))

  const chartRef = useRef(null)
  const { w, h } = useSize(chartRef)
  const x = (i) => (i * w) / (N - 1)
  const y = (v) => h - (v / 100) * (h - 4)
  const ptsA = area.map((v, i) => [x(i), y(v)])
  const ptsL = line.map((v, i) => [x(i), y(v)])
  const lineA = w ? monotone(ptsA) : ''
  const lineL = w ? monotone(ptsL) : ''
  const valueAt = (i) => (series.total * area[i]) / area[N - 1]

  const exportCsv = () => {
    const rows = ['неделя,оценка,цель']
    for (let i = 0; i < N; i++) {
      rows.push(`${i + 1},${valueAt(i).toFixed(3)},${((series.total * line[i]) / area[N - 1]).toFixed(3)}`)
    }
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'golden-dragon-kachestvo.csv'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMenu(false)
    toast({ text: 'Файл CSV сохранён', icon: 'download' })
  }

  return (
    <section className="savings sect rise" id="sec-savings" style={{ '--d': 3 }}>
      <div className="sec-head">
        <h2 className="sec-title">Качество за полгода</h2>
      </div>

      <div className="card sv-card">
        <div className="sv-stats">
          <div>
            <b>{num(Math.round(hours))}</b>
            <span>Разговоров проверено</span>
          </div>
          <i className="sv-sep" />
          <div>
            <b>{num(Math.round(btc))}%</b>
            <span>Довольных гостей</span>
          </div>
        </div>

        <div
          className="sv-chart"
          ref={chartRef}
          onPointerMove={(e) => {
            const r = chartRef.current.getBoundingClientRect()
            setHover(Math.max(0, Math.min(N - 1, Math.round(((e.clientX - r.left) / r.width) * (N - 1)))))
          }}
          onPointerLeave={() => setHover(null)}
        >
          {w > 0 && (
            <svg width={w} height={h}>
              <defs>
                <linearGradient id="svFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#62b866" />
                  <stop offset="0.55" stopColor="#4ea463" />
                  <stop offset="1" stopColor="#3b8a63" />
                </linearGradient>
              </defs>
              <path d={toArea(lineA, ptsA, h + 2)} fill="url(#svFill)" />
              <path className="sv-edge" d={lineA} />
              {target && <path className="sv-dash" d={lineL} />}
              {hover != null && (
                <g className="sv-focus">
                  <line x1={ptsA[hover][0]} x2={ptsA[hover][0]} y1={ptsA[hover][1]} y2={h} />
                  <circle cx={ptsA[hover][0]} cy={ptsA[hover][1]} r="5" />
                </g>
              )}
            </svg>
          )}
        </div>
        {hover != null && w > 0 && (
          <div className="sv-tip" style={{ left: ptsA[hover][0], bottom: h - ptsA[hover][1] + 12 }}>
            Неделя {hover + 1} · <b>{num(valueAt(hover), 1)}</b>
          </div>
        )}

        <div className="sv-total">
          <b>{num(total, 1)}</b>
          <span>Средняя оценка сейчас</span>
        </div>

        <div className="pop-anchor sv-menu" ref={menuRef}>
          <button className="icon-btn icon-btn--light" onClick={() => setMenu((m) => !m)} aria-label="Действия" aria-expanded={menu}>
            <Icon name="dots" />
          </button>
          {menu && (
            <div className="pop pop--menu pop--up" role="menu">
              <button className="menu-item" role="menuitem" onClick={exportCsv}>
                <Icon name="download" /> Скачать CSV
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setTarget((t) => !t)
                  setMenu(false)
                }}
              >
                <Icon name="eye" /> {target ? 'Скрыть' : 'Показать'} линию цели
              </button>
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setSeed((s) => s + 1)
                  setMenu(false)
                  toast({ text: 'Данные обновлены', icon: 'refresh', tone: 'teal' })
                }}
              >
                <Icon name="refresh" /> Обновить
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
