import { useRef, useState } from 'react'
import Icon from './Icon'
import { StatusBadge } from './ui'

/** A folder-shaped loan file card (shared by the top row and the peeking card). */
export function FileCard({ file, className = '', style, ...rest }) {
  const pct = (file.done / file.total) * 100
  return (
    <div className={`file file--${file.tone} ${className}`} style={style} {...rest}>
      <span className="file-tab" aria-hidden="true" />
      <div className="file-body">
        <div className="file-meta">
          <span>{file.scope}</span>
          <span className="file-access">
            <Icon name={file.icon} />
            {file.access}
          </span>
        </div>
        <h4>{file.address}</h4>
        <p className="file-lender">{file.lender}</p>
        <StatusBadge status={file.status} />
        <div className="file-foot">
          {file.status === 'closed' ? (
            <>
              <span>оценка {file.done} из 10</span>
              <span>{file.date}</span>
            </>
          ) : (
            <>
              <span className="bar">
                <i style={{ width: `${pct}%` }} />
              </span>
              <span>
                {file.done} из {file.total}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Two file slots. Cards can be dragged and swapped; the second one starts "picked up",
 * hovering above its dashed slot like in the reference.
 */
export default function FileCards({ files, onOpen }) {
  const [order, setOrder] = useState(() => files.map((f) => f.id))
  const [lifted, setLifted] = useState(files[1]?.id ?? null)
  const [drag, setDrag] = useState(null)
  const zoneRef = useRef(null)
  const start = useRef(null)

  const targetSlot = (s, clientX) => {
    const rect = zoneRef.current.getBoundingClientRect()
    const from = order.indexOf(s.id)
    const slotW = rect.width / 2
    const center = rect.left + from * slotW + slotW / 2 + (clientX - s.x)
    return center < rect.left + rect.width / 2 ? 0 : 1
  }

  const onDown = (e, id) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { id, x: e.clientX, y: e.clientY, lastX: e.clientX, rot: 0, moved: false }
  }
  const onMove = (e) => {
    const s = start.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!s.moved && Math.hypot(dx, dy) < 5) return
    s.moved = true
    s.rot = Math.max(-9, Math.min(9, s.rot * 0.8 + (e.clientX - s.lastX) * 0.5))
    s.lastX = e.clientX
    setLifted(null)
    setDrag({ id: s.id, dx, dy, rot: s.rot, target: targetSlot(s, e.clientX) })
  }
  const onUp = (e) => {
    const s = start.current
    start.current = null
    if (!s) return
    if (!s.moved) {
      setLifted(null)
      onOpen(s.id)
      return
    }
    const to = targetSlot(s, e.clientX)
    if (to !== order.indexOf(s.id)) setOrder((o) => [...o].reverse())
    setDrag(null)
  }

  const byId = Object.fromEntries(files.map((f) => [f.id, f]))
  const occupied = order.map((id) => id !== lifted && drag?.id !== id)

  return (
    <div className="files sect rise" id="sec-files" ref={zoneRef} style={{ '--d': 1 }}>
      {[0, 1].map((slot) => (
        <span
          key={slot}
          className={`slot ${occupied[slot] ? '' : 'is-open'} ${drag && drag.target === slot ? 'is-target' : ''}`}
          style={{ '--x': slot }}
          aria-hidden="true"
        />
      ))}
      {order.map((id, slot) => {
        const isDrag = drag?.id === id
        return (
          <FileCard
            key={id}
            file={byId[id]}
            className={`${lifted === id ? 'is-lifted' : ''} ${isDrag ? 'is-dragging' : ''}`}
            style={{
              '--x': slot,
              transform: isDrag ? `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.rot}deg) scale(1.02)` : undefined,
            }}
            role="button"
            tabIndex={0}
            aria-label={`${byId[id].address}. Открыть разбор или перетащить.`}
            onPointerDown={(e) => onDown(e, id)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => {
              start.current = null
              setDrag(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(id)
              }
            }}
          />
        )
      })}
    </div>
  )
}
