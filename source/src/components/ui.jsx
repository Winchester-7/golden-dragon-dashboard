import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

/** Photo avatar that falls back to initials if the image can't load. */
export function Avatar({ person, className = '' }) {
  const [broken, setBroken] = useState(false)
  if (!person.photo || broken) {
    const initials =
      person.initials ??
      person.name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
    return <span className={`avatar avatar--initials ${className}`}>{initials}</span>
  }
  return <img className={`avatar ${className}`} src={person.photo} alt="" onError={() => setBroken(true)} draggable="false" />
}

const STATUS = { pending: 'Не решено', closed: 'Всё хорошо', review: 'Нужен разбор' }

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS[status]}</span>
}

/** Marks the part of a string that matches the search. */
export function Highlight({ text, q }) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

/** Centered dialog. Children is a render function that receives `close`, so content can play the exit. */
export function Modal({ label, onClose, children }) {
  const [leaving, setLeaving] = useState(false)
  const close = useCallback(() => {
    setLeaving(true)
    window.setTimeout(onClose, 200)
  }, [onClose])
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [close])
  return createPortal(
    <div
      className={`modal ${leaving ? 'is-leaving' : ''}`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={label}>
        {children(close)}
      </div>
    </div>,
    document.body,
  )
}

export function Toasts({ items, onDismiss }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">
          <span className={`toast-ic toast-ic--${t.tone ?? 'green'}`}>
            <Icon name={t.icon ?? 'check'} />
          </span>
          <span className="toast-text">{t.text}</span>
          {t.action && (
            <button
              className="toast-act"
              onClick={() => {
                t.action.run()
                onDismiss(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
          <button className="toast-x" onClick={() => onDismiss(t.id)} aria-label="Закрыть">
            <Icon name="x" />
          </button>
        </div>
      ))}
    </div>
  )
}
