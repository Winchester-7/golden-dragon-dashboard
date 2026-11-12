import Icon from './Icon'
import { HBars, Pill, Ring } from './kit'
import { useApp } from '../lib/store'
import { CRIT_LABELS, SHIFT_KIND, grade, gradeTone } from '../data/shifts'

const TONE = { green: 'green', amber: 'orange', red: 'red' }
const COLOR = { green: 'var(--green)', amber: 'var(--orange)', red: 'var(--red)' }
const critColor = (v) => (v >= 8 ? 'var(--green)' : v >= 6 ? 'var(--orange)' : 'var(--red)')

/** Отчёт за смену: кто работал, как справился по мнению ИИ и что передать дальше. */
export default function ShiftDetails({ shift: s, close }) {
  const { go } = useApp()
  const kind = SHIFT_KIND[s.kind]
  const live = s.status === 'live'
  return (
    <div className="talk">
      <header className="talk-head">
        <Ring value={s.score * 10} size="5.6rem" stroke={11} color={COLOR[gradeTone(s.score)]} label={`Оценка смены ${s.score} из 10`}>
          <b>{s.score.toFixed(1)}</b>
          <span>из 10</span>
        </Ring>
        <div className="talk-head-text">
          <p className="talk-meta">
            {s.wd}, {s.date} · {kind.hours}
          </p>
          <h3>
            {kind.label}: {s.staff.map((p) => p.name).join(' и ')}
          </h3>
          <div className="talk-pills">
            <Pill tone={live ? 'teal' : TONE[gradeTone(s.score)]}>{live ? 'Смена идёт' : grade(s.score)}</Pill>
            <Pill tone="grey" dot={false}>
              {live ? `Отчёт будет в ${s.report}` : `Отчёт отправлен в ${s.report}`}
            </Pill>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={close} aria-label="Закрыть">
          <Icon name="x" />
        </button>
      </header>

      <div className="talk-body">
        <div className="shift-kpis">
          {[
            ['Разговоров', s.talks],
            ['Звонков', s.calls],
            ['У стойки', s.desk],
            ['Проблемных', s.bad],
            ['WhatsApp', s.wa],
          ].map(([label, value]) => (
            <div key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <section className="talk-sec">
          <h4>Вывод ИИ</h4>
          <p className="shift-text">{s.summary}</p>
          <ul className="shift-points">
            {s.good.map((t) => (
              <li key={t} className="is-good">
                <Icon name="check" />
                {t}
              </li>
            ))}
            {s.grow.map((t) => (
              <li key={t} className="is-bad">
                <Icon name="zap" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {s.staff.map((p) => (
          <section key={p.name} className="talk-sec shift-who">
            <div className="shift-who-head">
              <span className="avatar avatar--initials">{p.name[0]}</span>
              <div>
                <b>{p.name}</b>
                <span>
                  <Icon name="camera" /> на ресепшене {p.seen} · {p.talks} разговоров, проблемных {p.bad}
                </span>
              </div>
              <Pill tone={TONE[gradeTone(p.score)]} dot={false}>
                {p.score.toFixed(1)} · {grade(p.score)}
              </Pill>
            </div>
            <p className="shift-text">{p.verdict}</p>
            <HBars items={p.crit.map((v, i) => ({ label: CRIT_LABELS[i], value: v, color: critColor(v) }))} format={(v) => `${v} из 10`} max={10} />
          </section>
        ))}

        {s.todo.length > 0 && (
          <section className="talk-box talk-box--todo">
            <h4>
              <Icon name="check" /> Что передать следующей смене
            </h4>
            <ul className="shift-todo">
              {s.todo.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        <button
          type="button"
          className="btn btn--white"
          onClick={() => {
            close()
            go('talks')
          }}
        >
          Разговоры этой смены
          <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  )
}
