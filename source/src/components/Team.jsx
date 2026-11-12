import { Avatar } from './ui'
import { useCountUp } from '../lib/hooks'
import { useEnter } from '../lib/ui'
import { TEAM } from '../data/hotel'
import { liveShift, shiftNames } from '../data/shifts'
import { useApp } from '../lib/store'

const R = 19.5
const C = 2 * Math.PI * R

function Member({ m, i }) {
  const delay = useEnter(4, 150 + i * 90)
  const pct = useCountUp(m.pct, 1400, delay)
  return (
    <div className="member" tabIndex={0} aria-label={`${m.name}, оценка ${(m.pct / 10).toFixed(1)} из 10`}>
      <div className="ring" style={{ '--c': m.tone === 'green' ? 'var(--green)' : 'var(--teal)' }}>
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle className="trk" cx="22" cy="22" r={R} />
          <circle
            className="val"
            cx="22"
            cy="22"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - m.pct / 100)}
            style={{ '--C': C, animationDelay: `${delay}ms` }}
          />
        </svg>
        <Avatar person={m} className="ring-avatar" />
      </div>
      <span className="member-pct">{(pct / 10).toFixed(1)}</span>
      <div className="member-tip" role="tooltip">
        <strong>{m.name}</strong>
        <span>{m.role}</span>
        <em>
          {m.done} разговоров за месяц. {m.note}
        </em>
      </div>
    </div>
  )
}

export default function Team() {
  const { go } = useApp()
  return (
    <section className="team sect rise" id="sec-team" style={{ '--d': 4 }}>
      <div className="sec-head">
        <h2 className="sec-title">Администраторы</h2>
        <button type="button" className="onshift-chip" onClick={() => go('shifts')}>
          <i />
          На смене: {shiftNames(liveShift)}
        </button>
      </div>
      <div className="card team-card">
        {TEAM.map((m, i) => (
          <Member key={m.id} m={m} i={i} />
        ))}
      </div>
    </section>
  )
}
