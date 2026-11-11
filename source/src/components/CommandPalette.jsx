import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import { useApp } from '../lib/store'
import { PAGES, TALKS, talkWhere } from '../data/hotel'

/** ⌘K: jump to any page, customer, user or deal, or run a quick action. */
export default function CommandPalette({ onClose }) {
  const { go, openTalk, setCollapsed, replayIntro } = useApp()
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase()
    const has = (...xs) => !s || xs.some((x) => x?.toLowerCase().includes(s))
    const out = []
    const pages = PAGES.filter((p) => has(p.label)).map((p) => ({ id: `p-${p.id}`, icon: p.icon, label: p.label, hint: 'Раздел', run: () => go(p.id) }))
    if (pages.length) out.push({ title: 'Разделы', items: pages })
    const actions = [
      { id: 'a-bad', icon: 'zap', label: 'Показать проблемные разговоры', run: () => go('problems') },
      { id: 'a-rec', icon: 'play', label: 'Слушать записи', run: () => go('records') },
      { id: 'a-side', icon: 'chevronLeft', label: 'Свернуть или развернуть меню', run: () => setCollapsed((c) => !c) },
      { id: 'a-intro', icon: 'sparkle', label: 'Показать заставку ещё раз', run: () => replayIntro() },
    ].filter((a) => has(a.label))
    if (actions.length) out.push({ title: 'Действия', items: actions })
    if (s) {
      const ts = TALKS.filter((t) => has(t.summary, t.place, t.admin))
        .slice(0, 6)
        .map((t) => ({ id: `t-${t.id}`, icon: t.kind === 'call' ? 'phone' : 'users', label: `${t.time} · ${talkWhere(t)}`, hint: t.admin, run: () => openTalk(t.id) }))
      if (ts.length) out.push({ title: 'Разговоры', items: ts })
    }
    return out
  }, [q, go, openTalk, setCollapsed, replayIntro])

  const flat = groups.flatMap((g) => g.items)
  const safeIdx = Math.min(idx, Math.max(0, flat.length - 1))

  useEffect(() => {
    listRef.current?.querySelector('.is-on')?.scrollIntoView({ block: 'nearest' })
  }, [safeIdx])

  const run = (item) => {
    onClose()
    window.setTimeout(item.run, 10)
  }

  return createPortal(
    <div
      className="palette"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="palette-card" role="dialog" aria-modal="true" aria-label="Быстрый поиск">
        <div className="palette-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={q}
            placeholder="Поиск по разделам и разговорам…"
            onChange={(e) => {
              setQ(e.target.value)
              setIdx(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIdx((i) => Math.min(flat.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIdx((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter' && flat[safeIdx]) {
                run(flat[safeIdx])
              } else if (e.key === 'Escape') {
                onClose()
              }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-list" ref={listRef}>
          {flat.length === 0 && <p className="empty">Ничего не найдено по запросу «{q}».</p>}
          {groups.map((g) => (
            <div key={g.title}>
              <p className="palette-group">{g.title}</p>
              {g.items.map((it) => {
                const i = flat.indexOf(it)
                return (
                  <button key={it.id} className={`palette-item ${i === safeIdx ? 'is-on' : ''}`} onPointerMove={() => setIdx(i)} onClick={() => run(it)}>
                    <Icon name={it.icon} />
                    {it.label}
                    {it.hint && <small>{it.hint}</small>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span>↑↓ выбрать</span>
          <span>↵ открыть</span>
          <span>Ctrl+K закрыть</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
