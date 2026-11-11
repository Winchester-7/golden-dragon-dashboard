import { useState } from 'react'
import { useCountUp, useTween } from '../lib/hooks'
import { useEnter } from '../lib/ui'

const R = 66
const C = 2 * Math.PI * R

export default function PortfolioDonut({ portfolio: p }) {
  const [hot, setHot] = useState(null)
  const total = p.total
  const share = useTween(p.bad / total, 950, 0, useEnter(4, 120))
  const balance = useCountUp(p.total - p.bad, 1100, useEnter(4, 150))
  const paid = useCountUp(p.bad, 1100, useEnter(4, 220))
  const paidLen = share * C
  const pct = Math.round((hot === 'paid' ? share : 1 - share) * 100)

  const seg = (id) => ({
    className: `seg seg--${id} ${hot === id ? 'is-hot' : ''} ${hot && hot !== id ? 'is-dim' : ''}`,
    onPointerEnter: () => setHot(id),
    onPointerLeave: () => setHot(null),
  })

  return (
    <section className="card donut-card sect rise" id="sec-donut" style={{ '--d': 4 }}>
      <h3 key={p.id} className="donut-title swap-in">
        {p.name}
      </h3>

      <div className="donut-wrap">
        <svg viewBox="0 0 200 200" className="donut" role="img" aria-label={`${p.name}: ${Math.round(share * 100)}% с проблемами`}>
          <g transform="rotate(-90 100 100)">
            <circle cx="100" cy="100" r={R} {...seg('bal')} strokeDasharray={`${Math.max(0, C - paidLen)} ${C}`} strokeDashoffset={-paidLen} />
            <circle cx="100" cy="100" r={R} {...seg('paid')} strokeDasharray={`${paidLen} ${C}`} />
          </g>
        </svg>
        <div className={`donut-center ${hot ? 'is-on' : ''}`} aria-hidden="true">
          <b>{pct}%</b>
          <span>{hot === 'paid' ? 'С проблемами' : 'Без замечаний'}</span>
        </div>
      </div>

      <div className="donut-legend">
        <div onPointerEnter={() => setHot('bal')} onPointerLeave={() => setHot(null)}>
          <span>Без замечаний</span>
          <b>
            <i className="dot" style={{ background: 'var(--green)' }} />
            {Math.round(balance)}
          </b>
        </div>
        <div onPointerEnter={() => setHot('paid')} onPointerLeave={() => setHot(null)}>
          <span>С проблемами</span>
          <b>
            <i className="dot" style={{ background: 'var(--teal)' }} />
            {Math.round(paid)}
          </b>
        </div>
      </div>
    </section>
  )
}
