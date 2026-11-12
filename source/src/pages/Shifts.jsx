import Icon from '../components/Icon'
import Score from '../components/Score'
import { CardHead, Kpi, PageHead, Pill, Ring } from '../components/kit'
import { useApp } from '../lib/store'
import { SPARKS } from '../data/hotel'
import { CAMERA_LOG, NOW, SHIFT_KIND, SHIFTS, STAFF, grade, gradeTone, liveShift, shiftNames } from '../data/shifts'

const TONE = { green: 'green', amber: 'orange', red: 'red' }
const COLOR = { green: 'var(--green)', amber: 'var(--orange)', red: 'var(--red)' }
const hm = (min) => `${Math.floor(min / 60)} ч ${String(min % 60).padStart(2, '0')} мин`

/** Смены: кто на ресепшене сейчас, журнал камеры, оценка ИИ по каждому администратору, список смен. */
export default function Shifts() {
  const { openShift, go } = useApp()
  const s = liveShift
  const kind = SHIFT_KIND[s.kind]
  const done = SHIFTS.filter((x) => x.status === 'done')
  const part = Math.max(4, (NOW.elapsedMin / NOW.totalMin) * 100)

  return (
    <div className="page">
      <PageHead title="Смены ресепшена" sub="Дневная смена 08:00–20:00, ночная 20:00–08:00. Кто работал, определяет камера над ресепшеном, а ИИ оценивает, как справился администратор.">
        <button className="btn btn--white" onClick={() => go('reports')}>
          <Icon name="report" />
          Отчёты за смену
        </button>
      </PageHead>

      <div className="grid-kpi">
        <Kpi icon="users" label="Смен за 4 дня" value={done.length} tone="teal" spark={SPARKS.steady} d={0} foot="отчёт после каждой смены" />
        <Kpi icon="phone" label="Разговоров за эти смены" value={done.reduce((a, x) => a + x.talks, 0)} tone="green" spark={SPARKS.up} d={1} />
        <Kpi icon="zap" label="Проблемных" value={done.reduce((a, x) => a + x.bad, 0)} tone="orange" spark={SPARKS.down} d={2} />
        <Kpi icon="sparkle" label="Средняя оценка ИИ" value={done.reduce((a, x) => a + x.score, 0) / done.length} decimals={1} tone="purple" spark={SPARKS.wave} d={3} foot="по 10-балльной шкале" />
      </div>

      <div className="split">
        <section className="card card-pad card-in onshift" style={{ '--d': 4 }}>
          <CardHead title="Сейчас на ресепшене" sub={`${kind.label} · ${kind.hours}`} icon={kind.icon}>
            <Pill tone="green">Онлайн</Pill>
          </CardHead>
          <div className="onshift-main rv" style={{ '--i': 0 }}>
            <span className="avatar avatar--initials onshift-avatar">{s.staff[0].name[0]}</span>
            <div>
              <b>{shiftNames(s)}</b>
              <span>
                <Icon name="camera" /> камера узнала сотрудника в {s.staff[0].seen.replace('с ', '')}
              </span>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => openShift(s.id)}>
              Открыть смену
            </button>
          </div>
          <div className="onshift-bar rv" style={{ '--i': 1 }}>
            <i style={{ width: `${part}%` }} />
          </div>
          <div className="onshift-legend rv" style={{ '--i': 2 }}>
            <span>
              Прошло <b>{hm(NOW.elapsedMin)}</b>
            </span>
            <span>
              До пересменки и отчёта <b>{hm(NOW.totalMin - NOW.elapsedMin)}</b>
            </span>
          </div>
          <p className="onshift-note rv" style={{ '--i': 3 }}>
            За смену {s.talks} разговора, проблемных нет. Предварительная оценка ИИ: {s.score.toFixed(1)}.
          </p>
        </section>

        <section className="card card-pad card-in" style={{ '--d': 5 }}>
          <CardHead title="Камера ресепшена" sub="Кто пришёл и ушёл сегодня" icon="camera" />
          <ul className="cam-log">
            {CAMERA_LOG.map((a, i) => (
              <li key={a.id} className={`rv is-${a.kind}`} style={{ '--i': i }}>
                <time>{a.time}</time>
                <i />
                <span>
                  <b>{a.name}</b> {a.text}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card card-pad card-in" style={{ '--d': 6 }}>
        <CardHead title="Как справляются администраторы" sub="Оценка ИИ за ноябрь по всем разговорам каждого администратора" icon="users" />
        <div className="staff-grid">
          {STAFF.map((p, i) => (
            <article key={p.id} className="staff rv" style={{ '--i': i }}>
              <header>
                <Ring value={p.score * 10} size="4.8rem" stroke={11} color={COLOR[gradeTone(p.score)]} d={6} label={`${p.name}: ${p.score} из 10`}>
                  <b>{p.score.toFixed(1)}</b>
                </Ring>
                <div>
                  <b>{p.name}</b>
                  <span>
                    {p.kind === 'day' ? 'Дневные смены' : 'Ночные смены'} · {p.shifts} смен
                  </span>
                  <Pill tone={TONE[gradeTone(p.score)]} dot={false}>
                    {grade(p.score)} · {p.score >= p.prev ? '▲' : '▼'} {Math.abs(p.score - p.prev).toFixed(1)}
                  </Pill>
                </div>
              </header>
              <p>{p.verdict}</p>
              <ul className="shift-points">
                {p.good.map((t) => (
                  <li key={t} className="is-good">
                    <Icon name="check" />
                    {t}
                  </li>
                ))}
                {p.grow.map((t) => (
                  <li key={t} className="is-bad">
                    <Icon name="zap" />
                    {t}
                  </li>
                ))}
              </ul>
              <footer>
                {p.talks} разговоров · проблемных {p.bad}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <div className="rows">
        {SHIFTS.map((x, i) => (
          <button key={x.id} type="button" className="card report report--link card-in" style={{ '--d': 7 + i }} onClick={() => openShift(x.id)}>
            <Score value={x.score} decimals={1} />
            <div>
              <h3>
                {SHIFT_KIND[x.kind].label}, {x.date}: {shiftNames(x)}{' '}
                <span>
                  · {x.talks} разговоров, проблемных {x.bad} · {x.status === 'live' ? 'идёт сейчас' : `отчёт в ${x.report}`}
                </span>
              </h3>
              <p>{x.summary}</p>
            </div>
            <Icon name="arrowRight" />
          </button>
        ))}
      </div>
      <p className="mock-note">Это макет. Имена, оценки и отметки камеры условные. Распознавание по камере подключим после установки программы.</p>
    </div>
  )
}
