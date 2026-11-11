import { useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { Highlight } from './ui'
import { uid, useApp } from '../lib/store'
import { dueLabel } from '../lib/format'
import { useFlip, useNow } from '../lib/hooks'

const DUE = [
  { id: 'today', label: 'Сегодня', ms: 6 * 36e5 },
  { id: '3d', label: '3 дня', ms: 3 * 864e5 + 12 * 36e5 },
  { id: '1w', label: 'Неделя', ms: 7 * 864e5 },
]
const TONES = ['blue', 'green', 'peach']

/** Keeps a dragged card under the pointer, relative to its (possibly moved) slot. */
function place(d) {
  const slot = d.el.parentElement
  if (!slot) return
  const r = slot.getBoundingClientRect()
  d.el.style.transform = `translate(${d.px - d.gx - r.left}px, ${d.py - d.gy - r.top}px) rotate(1.6deg)`
}

export default function Tasks({ tasks, setTasks, query }) {
  const { toast } = useApp()
  const now = useNow(15000)
  const listRef = useRef(null)
  const drag = useRef(null)
  const inputRef = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [lifted, setLifted] = useState('t2')
  const [all, setAll] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState({ text: '', due: '3d', tone: 'blue' })

  const shown = query ? tasks.filter((t) => t.text.toLowerCase().includes(query)) : tasks
  const open = tasks.filter((t) => !t.done).length
  useFlip(listRef, shown.map((t) => `${t.id}${t.done ? '+' : ''}`).join('|'))

  /* after a live reorder the dragged card's slot moves; keep the card under the pointer */
  useLayoutEffect(() => {
    if (drag.current?.moved) place(drag.current)
  })
  const shape = `${shown.length}|${all}|${composing}`
  useLayoutEffect(() => {
    const el = listRef.current
    if (el) setOverflow(el.scrollHeight > el.clientHeight + 4)
  }, [shape])

  /* ---------- drag to reorder ---------- */
  const onDown = (e, id) => {
    if (e.button !== 0 || query || e.target.closest('button')) return
    const r = e.currentTarget.getBoundingClientRect()
    drag.current = { id, el: e.currentTarget, sx: e.clientX, sy: e.clientY, px: e.clientX, py: e.clientY, gx: e.clientX - r.left, gy: e.clientY - r.top, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    d.px = e.clientX
    d.py = e.clientY
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return
      d.moved = true
      setDragId(d.id)
      setLifted(null)
    }
    place(d)
    const slots = [...listRef.current.querySelectorAll(':scope > [data-flip]')]
    const from = slots.findIndex((s) => s.dataset.flip === d.id)
    let to = from
    slots.forEach((s, i) => {
      if (i === from) return
      const r = s.getBoundingClientRect()
      const mid = r.top + r.height / 2
      if (i < from && e.clientY < mid) to = Math.min(to, i)
      if (i > from && e.clientY > mid) to = Math.max(to, i)
    })
    if (to !== from) {
      setTasks((ts) => {
        const next = ts.filter((t) => t.id !== d.id)
        next.splice(to, 0, ts.find((t) => t.id === d.id))
        return next
      })
    }
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (!d.moved) {
      if (lifted === d.id) setLifted(null)
      return
    }
    d.el.classList.remove('is-dragging')
    d.el.style.transform = ''
    setDragId(null)
  }

  /* ---------- complete / add ---------- */
  const toggle = (id) => {
    const index = tasks.findIndex((t) => t.id === id)
    const done = !tasks[index].done
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done } : t)))
    if (lifted === id) setLifted(null)
    if (!done) return
    window.setTimeout(() => {
      setTasks((ts) => {
        const item = ts.find((t) => t.id === id)
        if (!item?.done) return ts
        return [...ts.filter((t) => t.id !== id), item]
      })
    }, 700)
    toast({
      text: 'Задача выполнена',
      action: {
        label: 'Вернуть',
        run: () =>
          setTasks((ts) => {
            const item = ts.find((t) => t.id === id)
            if (!item) return ts
            const rest = ts.filter((t) => t.id !== id)
            rest.splice(Math.min(index, rest.length), 0, { ...item, done: false })
            return rest
          }),
      },
    })
  }

  const add = (e) => {
    e.preventDefault()
    const text = draft.text.trim()
    if (!text) {
      inputRef.current?.focus()
      return
    }
    const due = DUE.find((d) => d.id === draft.due)
    setTasks((ts) => [{ id: uid('task'), text, tone: draft.tone, due: Date.now() + due.ms, fresh: true }, ...ts])
    setDraft((d) => ({ ...d, text: '' }))
    setComposing(false)
    toast({ text: 'Задача добавлена', icon: 'plus' })
  }

  return (
    <section className="card tasks sect rise" id="sec-tasks" style={{ '--d': 2 }}>
      <div className="tasks-head">
        <h2 className="sec-title">
          Что сделать <span className="count-chip">{open}</span>
        </h2>
        <button
          className={`icon-btn ${composing ? 'is-on' : ''}`}
          onClick={() => {
            setComposing((c) => !c)
            window.setTimeout(() => inputRef.current?.focus(), 60)
          }}
          aria-label={composing ? 'Закрыть' : 'Добавить задачу'}
          aria-expanded={composing}
        >
          <Icon name="plus" />
        </button>
      </div>

      <div className={`composer-wrap ${composing ? 'is-open' : ''}`}>
        <form className="composer" onSubmit={add}>
          <textarea
            ref={inputRef}
            rows={2}
            placeholder="Что нужно сделать?"
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) add(e)
              if (e.key === 'Escape') setComposing(false)
            }}
            tabIndex={composing ? 0 : -1}
          />
          <div className="composer-row">
            <div className="chips" role="radiogroup" aria-label="Срок">
              {DUE.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  role="radio"
                  aria-checked={draft.due === d.id}
                  className={`chip ${draft.due === d.id ? 'is-on' : ''}`}
                  onClick={() => setDraft((x) => ({ ...x, due: d.id }))}
                  tabIndex={composing ? 0 : -1}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="tones" role="radiogroup" aria-label="Цвет">
              {TONES.map((t) => (
                <button
                  type="button"
                  key={t}
                  role="radio"
                  aria-checked={draft.tone === t}
                  aria-label={t}
                  className={`tone tone--${t} ${draft.tone === t ? 'is-on' : ''}`}
                  onClick={() => setDraft((x) => ({ ...x, tone: t }))}
                  tabIndex={composing ? 0 : -1}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--block" tabIndex={composing ? 0 : -1}>
            Добавить
          </button>
        </form>
      </div>

      <div className={`task-list ${all || query ? 'is-all' : ''} ${dragId ? 'is-sorting' : ''}`} ref={listRef}>
        {shown.map((t) => {
          const due = dueLabel(t.due, now)
          const isLifted = lifted === t.id && !dragId && !t.done
          const isDrag = dragId === t.id
          return (
            <div
              key={t.id}
              data-flip={t.id}
              data-dragging={isDrag || undefined}
              className={`task-slot ${isLifted || isDrag ? 'is-placeholder' : ''} ${t.fresh ? 'is-fresh' : ''}`}
            >
              <div
                className={`task task--${t.tone} ${t.done ? 'is-done' : ''} ${isLifted ? 'is-lifted' : ''} ${isDrag ? 'is-dragging' : ''}`}
                onPointerDown={(e) => onDown(e, t.id)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              >
                <button className="check" onClick={() => toggle(t.id)} aria-pressed={!!t.done} aria-label={t.done ? 'Вернуть в работу' : 'Отметить выполненной'}>
                  <Icon name="check" />
                </button>
                <div className="task-main">
                  <p className="task-text">
                    <Highlight text={t.text} q={query} />
                  </p>
                  <p className="task-due">
                    {t.done ? 'Выполнено' : 'Срок:'}
                    {!t.done && <b className={due.urgent ? 'is-urgent' : ''}>{due.text}</b>}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        {shown.length === 0 && <p className="empty">Ничего не найдено по запросу «{query}».</p>}
      </div>
      {(overflow || all) && !query && <div className={`task-fade ${all ? 'is-hidden' : ''}`} aria-hidden="true" />}
      {(overflow || all) && !query && (
        <button className="tasks-more link" onClick={() => setAll((a) => !a)}>
          {all ? 'Свернуть' : `Все задачи: ${tasks.length}`}
          <Icon name="chevronDown" className={`chev ${all ? 'is-up' : ''}`} />
        </button>
      )}
    </section>
  )
}
