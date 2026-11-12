import { useEffect, useState } from 'react'
import emblem from './assets/gd-emblem.png'
import LiveCamera from './components/LiveCamera'
import PhoneHub from './components/PhoneHub'
import { CHATS, TALKS, isBad, talkWhere } from './data/hotel'
import {
  CAMERA_LOG, CRIT_LABELS, NOW, SHIFT_KIND, SHIFTS, STAFF, WEEKS,
  fmtScore, grade, gradeTone, lastShift, liveShift, rota, shiftNames, shiftTitle,
} from './data/shifts'

/* ---------- иконки ---------- */
const PATHS = {
  home: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  shifts: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18M12 7v5l3 2',
  talks: 'M4 5h16v11H9l-5 4z',
  desk: 'M16 11a4 4 0 1 0-8 0a4 4 0 0 0 8 0M4 21a8 8 0 0 1 16 0',
  camera: 'M15 10l5-3v10l-5-3zM3 6h12v12H3z',
  reports: 'M5 20V10M12 20V4M19 20v-7',
  sun: 'M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  bell: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  phone: 'M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z',
  smile: 'M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5v.5M15 9.5v.5',
  alert: 'M12 4l9 16H3zM12 10v4M12 17v.5',
  star: 'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z',
}
const Ic = ({ n, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[n]} />
  </svg>
)

const NAV = [
  { id: 'home', label: 'Сводка' },
  { id: 'shifts', label: 'Смены' },
  { id: 'camera', label: 'Камера' },
  { id: 'talks', label: 'Разговоры' },
  { id: 'phone', label: 'Телефон' },
  { id: 'reports', label: 'Отчёты' },
]
const TASKS = [
  { id: 't1', title: 'Номер 305', text: 'Отнести полотенца и перезвонить гостю. Он просил уже дважды.' },
  { id: 't2', title: 'Номер 418', text: 'Проверить счёт за мини-бар и связаться с гостем после спора у стойки.' },
  { id: 't3', title: 'Номер 401', text: 'Узнать у гостя, стало ли тише после жалобы на шум.' },
]
const TONE = { green: '#22c55e', amber: '#ff9f1c', red: '#ff3b71' }
const scoreColor = (v) => TONE[gradeTone(v)]
const talkColor = (v) => (v >= 8 ? TONE.green : v >= 5 ? TONE.amber : TONE.red)
const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return NAV.some((n) => n.id === id) ? id : 'home'
}
const go = (id) => {
  window.location.hash = `/${id}`
  document.querySelector('.g-main')?.scrollTo({ top: 0 })
  window.scrollTo({ top: 0 })
}
const Avatar = ({ name, size = 44 }) => (
  <span className="g-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{name[0]}</span>
)

/* ---------- график оценок по сменам ---------- */
function ShiftChart() {
  const w = WEEKS.this
  const W = 560, H = 190, padL = 30, padB = 26, padT = 26
  const x = (i) => padL + (i * (W - padL - 16)) / 6
  const y = (v) => padT + ((10 - v) / 5) * (H - padT - padB)
  const line = (arr) => arr.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean)
  const smooth = (pts) => pts.map((p, i) => {
    if (!i) return `M${p}`
    const [x0, y0] = pts[i - 1].split(',').map(Number), [x1, y1] = p.split(',').map(Number), mx = (x0 + x1) / 2
    return `C${mx},${y0} ${mx},${y1} ${x1},${y1}`
  }).join(' ')
  const day = line(w.day), night = line(w.night)
  const best = w.night.reduce((b, v, i) => (v != null && v > w.night[b] ? i : b), 0)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="g-chart" role="img" aria-label="Оценки дневных и ночных смен за неделю">
      <defs>
        <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff701e" stopOpacity="0.28" /><stop offset="1" stopColor="#ff701e" stopOpacity="0" /></linearGradient>
      </defs>
      {[10, 9, 8, 7, 6, 5].map((v) => (
        <g key={v}><line x1={padL} x2={W - 8} y1={y(v)} y2={y(v)} className="g-grid" /><text x="4" y={y(v) + 4} className="g-axis">{v}</text></g>
      ))}
      <path d={`${smooth(day)} L${x(6)},${H - padB} L${x(0)},${H - padB} Z`} fill="url(#gArea)" />
      <path d={smooth(day)} className="g-line g-line--day" />
      <path d={smooth(night)} className="g-line g-line--night" />
      <circle cx={x(best)} cy={y(w.night[best])} r="5" className="g-dot" />
      <g transform={`translate(${Math.max(x(best), padL + 40)},${y(w.night[best]) - 14})`}>
        <rect x="-34" y="-17" width="68" height="20" rx="10" className="g-tip" />
        <text textAnchor="middle" y="-3" className="g-tip-text">{w.nightWho[best]} {fmtScore(w.night[best])}</text>
      </g>
      {w.days.map((d, i) => <text key={d} x={x(i)} y={H - 6} textAnchor="middle" className="g-axis">{d} {w.dates[i]}</text>)}
    </svg>
  )
}

/* ---------- страницы ---------- */
function Home({ go, openShift, openTalk }) {
  const kind = SHIFT_KIND[liveShift.kind]
  const bars = WEEKS.this.day
  return (
    <>
      <div className="g-stats">
        <button className="g-card g-stat" onClick={() => openShift(lastShift)}>
          <span className="g-stat-head">Оценка смены<i style={{ background: '#fff1e8', color: '#ff701e' }}><Ic n="star" s={15} /></i></span>
          <span className="g-bars">{bars.map((v, i) => <b key={i} style={{ height: `${(v - 4) * 16}%`, opacity: 0.45 + i * 0.09 }} />)}</span>
          <span className="g-stat-val" style={{ color: '#ff701e' }}>{fmtScore(lastShift.score)} <small>из 10, день</small></span>
        </button>
        <button className="g-card g-stat" onClick={() => go('talks')}>
          <span className="g-stat-head">Разговоров<i style={{ background: '#ffe9ef', color: '#ff3b71' }}><Ic n="phone" s={15} /></i></span>
          <svg viewBox="0 0 100 30" className="g-pulse"><path d="M0 16h28l5-10 7 20 6-14 4 4h50" fill="none" stroke="#ff3b71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="g-stat-val" style={{ color: '#ff3b71' }}>{lastShift.talks} <small>за смену: звонки и стойка</small></span>
        </button>
        <div className="g-card g-stat">
          <span className="g-stat-head">Довольных гостей<i style={{ background: '#e7f9ee', color: '#22c55e' }}><Ic n="smile" s={15} /></i></span>
          <svg viewBox="0 0 60 34" className="g-gauge"><path d="M6 30a24 24 0 0 1 48 0" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" /><path d="M6 30a24 24 0 0 1 48 0" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeDasharray="75.4" strokeDashoffset={75.4 * 0.19} /></svg>
          <span className="g-stat-val" style={{ color: '#22c55e' }}>81% <small>по тону разговора</small></span>
        </div>
        <button className="g-card g-stat" onClick={() => go('talks')}>
          <span className="g-stat-head">С проблемами<i style={{ background: '#e8f0ff', color: '#3b82f6' }}><Ic n="alert" s={15} /></i></span>
          <span className="g-bars g-bars--blue">{[3, 5, 2, 4, 4, 2, 5].map((v, i) => <b key={i} style={{ height: `${v * 18}%` }} />)}</span>
          <span className="g-stat-val" style={{ color: '#3b82f6' }}>{lastShift.bad} <small>разговоров разобрать</small></span>
        </button>
      </div>

      <div className="g-two">
        <div className="g-card g-pad">
          <div className="g-card-head"><h2>Оценки смен за неделю</h2><span className="g-legend"><i style={{ background: '#ff701e' }} />день<i style={{ background: '#3b82f6' }} />ночь</span></div>
          <ShiftChart />
        </div>
        <div className="g-card g-pad g-now">
          <span className="g-chip g-chip--live"><i />Сейчас на смене</span>
          <div className="g-now-who">
            {liveShift.staff.map((p) => (
              <div key={p.name}><Avatar name={p.name} size={52} /><div><b>{p.name}</b><span>камера: {p.seen}</span></div></div>
            ))}
          </div>
          <div className="g-now-nums">
            <div><b>{liveShift.talks}</b><span>разговора, проблем нет</span></div>
            <div><b>{kind.hours}</b><span>{kind.label.toLowerCase()}, отчёт в {liveShift.report}</span></div>
          </div>
          <div className="g-track"><i style={{ width: `${Math.max(5, (NOW.elapsedMin / NOW.totalMin) * 100)}%` }} /></div>
          <div className="g-now-btns">
            <button className="g-btn g-btn--orange" onClick={() => openShift(liveShift)}>Открыть смену</button>
            <button className="g-btn" onClick={() => go('camera')}><Ic n="camera" s={16} />Камера</button>
          </div>
        </div>
      </div>

      <div className="g-sec"><h2>Что нужно сделать</h2><button onClick={() => go('talks')}>все разговоры</button></div>
      <div className="g-three">
        {TASKS.map((t, i) => (
          <button key={t.id} className={`g-card g-task${i === 1 ? ' is-hot' : ''}`} onClick={() => openTalk(TALKS.filter(isBad)[i])}>
            <b>{t.title}</b>
            <span>{t.text}</span>
            <em>{i === 1 ? 'Сегодня' : 'До конца смены'}</em>
          </button>
        ))}
      </div>
    </>
  )
}

function Shifts({ openShift, openStaff }) {
  return (
    <>
      <div className="g-sec"><h2>Как работали администраторы</h2><span>оценка ИИ за неделю</span></div>
      <div className="g-staff">
        {STAFF.map((a) => (
          <button key={a.id} className="g-card g-pad g-person" onClick={() => openStaff(a)}>
            <div className="g-person-head">
              <Avatar name={a.name} size={48} />
              <div><b>{a.name}</b><span>{SHIFT_KIND[a.kind].label.toLowerCase()} · {a.shifts} смен</span></div>
              <strong style={{ color: scoreColor(a.score) }}>{fmtScore(a.score)}</strong>
            </div>
            <span className="g-badge" style={{ background: scoreColor(a.score) }}>{grade(a.score)}</span>
            <p>{a.verdict}</p>
            <small>{a.talks} разговоров · {a.bad} с проблемами · было {fmtScore(a.prev)}</small>
          </button>
        ))}
      </div>

      <div className="g-sec"><h2>Смены</h2><span>день 08:00–20:00, ночь 20:00–08:00</span></div>
      <div className="g-card g-list">
        {SHIFTS.map((s) => (
          <button key={s.id} className="g-row" onClick={() => openShift(s)}>
            <span className="g-row-ic" style={{ background: s.kind === 'day' ? '#fff1e8' : '#e8f0ff', color: s.kind === 'day' ? '#ff701e' : '#3b82f6' }}><Ic n={s.kind === 'day' ? 'sun' : 'moon'} s={18} /></span>
            <span className="g-row-main"><b>{shiftTitle(s)}{s.status === 'live' && <em className="g-chip g-chip--live"><i />идёт</em>}</b><span>{shiftNames(s)} · {s.talks} разговоров · {s.bad} с проблемами</span></span>
            <span className="g-row-time">отчёт {s.status === 'live' ? 'будет в' : 'в'} {s.report}</span>
            <strong style={{ color: scoreColor(s.score) }}>{fmtScore(s.score)}</strong>
          </button>
        ))}
      </div>

      <div className="g-sec"><h2>Отметки камеры</h2><span>кто пришёл и ушёл</span></div>
      <div className="g-card g-list">
        {CAMERA_LOG.map((c) => (
          <div key={c.id} className="g-row is-static">
            <span className="g-row-ic" style={{ background: '#f1f5f9', color: '#475569' }}><Ic n={c.kind === 'report' ? 'reports' : 'camera'} s={18} /></span>
            <span className="g-row-main"><b>{c.name}</b><span>{c.text}</span></span>
            <span className="g-row-time">{c.time}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Talks({ openTalk }) {
  const [f, setF] = useState('all')
  const rows = TALKS.filter((t) => f === 'all' || (f === 'bad' ? isBad(t) : t.kind === f))
  return (
    <>
      <div className="g-tabs">
        {[['all', 'Все'], ['call', 'Звонки'], ['desk', 'У стойки'], ['bad', 'С проблемами']].map(([id, l]) => (
          <button key={id} className={f === id ? 'is-on' : ''} onClick={() => setF(id)}>{l}</button>
        ))}
      </div>
      <div className="g-card g-list">
        {rows.map((t) => (
          <button key={t.id} className="g-row" onClick={() => openTalk(t)}>
            <span className="g-row-ic" style={{ background: '#f1f5f9', color: '#475569' }}><Ic n={t.kind === 'call' ? 'phone' : 'desk'} s={18} /></span>
            <span className="g-row-main"><b>{talkWhere(t)} · {t.admin}</b><span>{t.summary}</span></span>
            <span className="g-row-time">{t.time}</span>
            <strong style={{ color: talkColor(t.score) }}>{t.score}</strong>
          </button>
        ))}
      </div>
    </>
  )
}

function Reports({ openShift }) {
  return (
    <>
      <div className="g-sec"><h2>Отчёты за смену</h2><span>каждые 12 часов: в 08:00 и в 20:00</span></div>
      <div className="g-reports">
        {SHIFTS.filter((s) => s.status === 'done').map((s) => (
          <button key={s.id} className="g-card g-pad g-report" onClick={() => openShift(s)}>
            <div className="g-person-head">
              <span className="g-row-ic" style={{ background: s.kind === 'day' ? '#fff1e8' : '#e8f0ff', color: s.kind === 'day' ? '#ff701e' : '#3b82f6' }}><Ic n={s.kind === 'day' ? 'sun' : 'moon'} s={18} /></span>
              <div><b>{shiftTitle(s)}</b><span>{shiftNames(s)} · отчёт в {s.report}</span></div>
              <strong style={{ color: scoreColor(s.score) }}>{fmtScore(s.score)}</strong>
            </div>
            <p>{s.summary}</p>
            {s.good[0] && <small className="is-good">Хорошо: {s.good[0]}</small>}
            {s.grow[0] && <small className="is-grow">Исправить: {s.grow[0]}</small>}
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- правая панель ---------- */
function Aside({ openShift, openStaff, go }) {
  const me = STAFF.find((s) => s.name === liveShift.staff[0].name)
  const [sel, setSel] = useState(10)
  const r = rota(sel)
  const dayScore = (d) => {
    const i = WEEKS.this.dates.indexOf(String(d))
    return i < 0 ? null : WEEKS.this.day[i]
  }
  return (
    <aside className="g-aside g-glass">
      <button className="g-me" onClick={() => openStaff(me)}>
        <Avatar name={me.name} size={50} />
        <span><b>{me.name}</b><small>на смене с {liveShift.staff[0].seen.replace('с ', '')}</small></span>
        <i className="g-me-live" />
      </button>
      <div className="g-me-stats">
        <div><b>{fmtScore(me.score)}</b><span>оценка ИИ</span></div>
        <div><b>{me.shifts}</b><span>смен</span></div>
        <div><b>{me.talks}</b><span>разговоров</span></div>
      </div>

      <div className="g-cal">
        <div className="g-cal-head"><b>Ноябрь 2026</b><button onClick={() => go('camera')} aria-label="Камера ресепшена"><Ic n="camera" s={15} /></button></div>
        <div className="g-cal-grid">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => <span key={d} className="g-cal-wd">{d}</span>)}
          {Array.from({ length: 6 }, (_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const v = dayScore(d)
            return (
              <button key={d} className={`g-cal-day${d === sel ? ' is-sel' : ''}${d > 10 ? ' is-future' : ''}`} style={v != null && d !== sel ? { background: scoreColor(v), color: '#fff' } : undefined} onClick={() => setSel(d)}>{d}</button>
            )
          })}
        </div>
        <div className="g-cal-foot"><span><Ic n="sun" s={14} />{r.day.join(' и ')}</span><span><Ic n="moon" s={14} />{r.night.join(' и ')}</span></div>
      </div>

      <div className="g-sec g-sec--dark"><h2>Отчёты за смену</h2><button onClick={() => go('reports')}>все</button></div>
      <div className="g-sched">
        {SHIFTS.filter((s) => s.status === 'done').slice(0, 3).map((s) => (
          <button key={s.id} onClick={() => openShift(s)}>
            <span className="g-sched-ic" style={{ color: s.kind === 'day' ? '#ffb27d' : '#93b8ff' }}><Ic n={s.kind === 'day' ? 'sun' : 'moon'} s={20} /></span>
            <span className="g-sched-main"><em>{SHIFT_KIND[s.kind].label}</em><b>{shiftNames(s)}</b><small>{s.date} · отчёт в {s.report}</small></span>
            <strong style={{ color: scoreColor(s.score) }}>{fmtScore(s.score)}</strong>
          </button>
        ))}
      </div>
    </aside>
  )
}

/* ---------- окна ---------- */
function Sheet({ title, sub, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="g-modal" onClick={onClose}>
      <div className="g-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="g-sheet-head"><div><h2>{title}</h2><span>{sub}</span></div><button onClick={onClose} aria-label="Закрыть"><Ic n="close" /></button></div>
        {children}
      </div>
    </div>
  )
}
const Bars = ({ items }) => (
  <div className="g-crit">
    {items.map(([name, v, note]) => (
      <div key={name}><span>{name}<b>{v} из 10</b></span><div className="g-track"><i style={{ width: `${v * 10}%`, background: talkColor(v) }} /></div>{note && <small>{note}</small>}</div>
    ))}
  </div>
)
function Modal({ modal, close }) {
  const { type, item } = modal
  if (type === 'shift') {
    return (
      <Sheet title={shiftTitle(item)} sub={`${SHIFT_KIND[item.kind].hours} · ${shiftNames(item)} · оценка ${fmtScore(item.score)}`} onClose={close}>
        <p>{item.summary}</p>
        {item.staff.map((p) => (
          <div key={p.name} className="g-sheet-block">
            <div className="g-person-head"><Avatar name={p.name} size={42} /><div><b>{p.name}</b><span>камера: {p.seen} · {p.talks} разговоров · {p.bad} с проблемами</span></div><strong style={{ color: scoreColor(p.score) }}>{fmtScore(p.score)}</strong></div>
            <p>{p.verdict}</p>
            <Bars items={CRIT_LABELS.map((l, i) => [l, p.crit[i]])} />
          </div>
        ))}
        {item.good.length > 0 && <div className="g-sheet-block"><h3>Что получилось</h3><ul>{item.good.map((t) => <li key={t}>{t}</li>)}</ul></div>}
        {item.grow.length > 0 && <div className="g-sheet-block"><h3>Что исправить</h3><ul>{item.grow.map((t) => <li key={t}>{t}</li>)}</ul></div>}
        {item.todo.length > 0 && <div className="g-sheet-block"><h3>Что сделать следующей смене</h3><ul>{item.todo.map((t) => <li key={t}>{t}</li>)}</ul></div>}
      </Sheet>
    )
  }
  if (type === 'staff') {
    return (
      <Sheet title={item.name} sub={`${SHIFT_KIND[item.kind].label} · ${item.shifts} смен · ${grade(item.score)}, ${fmtScore(item.score)} из 10`} onClose={close}>
        <p>{item.verdict}</p>
        <div className="g-sheet-block"><h3>Что получается</h3><ul>{item.good.map((t) => <li key={t}>{t}</li>)}</ul></div>
        <div className="g-sheet-block"><h3>Что подтянуть</h3><ul>{item.grow.map((t) => <li key={t}>{t}</li>)}</ul></div>
        <small className="g-sheet-note">{item.talks} разговоров за неделю, из них {item.bad} с проблемами. На прошлой неделе оценка была {fmtScore(item.prev)}.</small>
      </Sheet>
    )
  }
  return (
    <Sheet title={`${talkWhere(item)}, ${item.time}`} sub={`${item.admin} · ${item.dur} · гость ${item.mood} · оценка ${item.score} из 10`} onClose={close}>
      <p>{item.summary}</p>
      <Bars items={item.crit} />
      {item.todo && <div className="g-sheet-block"><h3>Что сделать</h3><p>{item.todo}</p></div>}
      {item.advice && <div className="g-sheet-block"><h3>Совет ИИ администратору</h3><p>{item.advice}</p></div>}
    </Sheet>
  )
}

const TITLES = {
  home: ['Добрый вечер, руководитель', `${NOW.date}, ${NOW.time}. Ночная смена идёт ${NOW.elapsedMin} минут.`],
  shifts: ['Смены и администраторы', 'Кто работал, как справился и что сказал ИИ.'],
  camera: ['Камера ресепшена', 'Прямой эфир с веб-камеры у стойки.'],
  phone: ['Служебный телефон', 'Звонки с SIM, звонки и переписки WhatsApp. ИИ всё записывает и делает выводы.'],
  talks: ['Разговоры с гостями', 'Нажмите на разговор, чтобы увидеть разбор ИИ.'],
  reports: ['Отчёты', 'Отчёт выходит при пересменке.'],
}

export default function App() {
  const [page, setPage] = useState(readHash)
  const [modal, setModal] = useState(null)
  const [light, setLight] = useState(false)
  useEffect(() => {
    const h = () => setPage(readHash())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  const api = {
    go,
    openShift: (item) => setModal({ type: 'shift', item }),
    openStaff: (item) => setModal({ type: 'staff', item }),
    openTalk: (item) => item && setModal({ type: 'talk', item }),
  }
  const [title, sub] = TITLES[page]
  return (
    <div className={`g-view${light ? ' is-light' : ''}`}>
      <div className="g-shell">
        <nav className="g-side g-glass" aria-label="Разделы">
          <img src={emblem} alt="Golden Dragon" className="g-logo" />
          <div className="g-nav">
            {NAV.map((n) => (
              <button key={n.id} className={page === n.id ? 'is-on' : ''} onClick={() => go(n.id)} aria-label={n.label} title={n.label}>
                <Ic n={n.id} /><span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="g-theme">
            <button className={light ? '' : 'is-on'} onClick={() => setLight(false)} aria-label="Тёмное стекло"><Ic n="moon" s={16} /></button>
            <button className={light ? 'is-on' : ''} onClick={() => setLight(true)} aria-label="Светлое стекло"><Ic n="sun" s={16} /></button>
          </div>
        </nav>

        <main className="g-main g-glass">
          <header className="g-head">
            <div><h1>{title}</h1><p>{sub}</p></div>
            <div className="g-head-right">
              <span className="g-date">Golden Dragon · ресепшен</span>
              <button className="g-bell" onClick={() => api.openShift(lastShift)} aria-label="Отчёт за прошлую смену"><Ic n="bell" s={18} /><i /></button>
            </div>
          </header>
          {page === 'home' && <Home {...api} />}
          {page === 'shifts' && <Shifts {...api} />}
          {page === 'camera' && <LiveCamera staff={shiftNames(liveShift)} />}
          {page === 'talks' && <Talks {...api} />}
          {page === 'phone' && <PhoneHub chats={CHATS} />}
          {page === 'reports' && <Reports {...api} />}
          <p className="g-foot">Это макет. Имена, оценки, разговоры и отметки камеры условные.</p>
        </main>

        <Aside {...api} />
      </div>
      {modal && <Modal modal={modal} close={() => setModal(null)} />}
    </div>
  )
}
