import { useMemo } from 'react'
import Icon from '../components/Icon'
import Score from '../components/Score'
import { BarChart, CardHead, HBars, PageHead, Ring } from '../components/kit'
import { useApp } from '../lib/store'
import { downloadCsv } from '../lib/ui'
import { CRITERIA, RANGES, REPORTS, TEAM, TOPICS } from '../data/hotel'

const COLOR = (v) => (v >= 8 ? 'var(--green)' : v >= 6.5 ? 'var(--orange)' : 'var(--red)')

export default function Reports() {
  const { toast } = useApp()
  const week = RANGES['Неделя']
  const series = useMemo(
    () => [
      { id: 'calls', label: 'Звонки', color: 'var(--green)', data: week.mortgage },
      { id: 'desk', label: 'У стойки', color: 'var(--teal)', data: week.mbs },
    ],
    [week],
  )
  const exportCsv = () => {
    downloadCsv('golden-dragon-otchet.csv', [['День', 'Разговоров', 'Оценка', 'Итог'], ...REPORTS.map((r) => [r.date, r.count, r.score, r.text])])
    toast({ text: 'Отчёт сохранён в CSV', icon: 'download' })
  }

  return (
    <div className="page">
      <PageHead title="Утренние отчёты" sub="Короткий итог каждого дня. Такой же приходит в Telegram в 8:00.">
        <button className="btn btn--white" onClick={exportCsv}>
          <Icon name="download" />
          Скачать
        </button>
      </PageHead>

      <div className="split">
        <section className="card card-pad card-in" style={{ '--d': 0 }}>
          <CardHead title="Оценка по дням недели" sub="Звонки из номеров и беседы у стойки" icon="bars">
            <div className="legend">
              {series.map((s) => (
                <span key={s.id}>
                  <i style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          </CardHead>
          <BarChart labels={week.labels} series={series} height="15rem" d={0} format={(v) => v.toFixed(1)} />
        </section>

        <section className="card card-pad card-in" style={{ '--d': 1 }}>
          <CardHead title="Администраторы" sub="Средняя оценка за день" icon="users" />
          <ul className="admin-list">
            {TEAM.map((m, i) => (
              <li key={m.id} className="rv" style={{ '--i': i }}>
                <Ring value={m.pct} size="5.2rem" stroke={11} color={m.tone === 'green' ? 'var(--green)' : 'var(--teal-2)'} d={1} label={`${m.name}: ${m.pct / 10} из 10`}>
                  <b>{(m.pct / 10).toFixed(1)}</b>
                </Ring>
                <div>
                  <b>{m.name}</b>
                  <span>{m.done} разговоров</span>
                  <p>{m.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="split split--even">
        <section className="card card-pad card-in" style={{ '--d': 2 }}>
          <CardHead title="Что получается, а что нет" sub="Средняя оценка по правилам общения" icon="tasks" />
          <HBars items={CRITERIA.map((c) => ({ ...c, color: COLOR(c.value) }))} d={2} format={(v) => v.toFixed(1)} />
        </section>
        <section className="card card-pad card-in" style={{ '--d': 3 }}>
          <CardHead title="О чём спрашивают гости" sub="Самые частые темы за день" icon="tag" />
          <HBars items={TOPICS} d={3} format={(v) => `${v}`} color="var(--teal-2)" />
        </section>
      </div>

      <div className="rows">
        {REPORTS.map((r, i) => (
          <article key={r.id} className="card report card-in" style={{ '--d': 4 + i }}>
            <Score value={r.score} decimals={1} />
            <div>
              <h3>
                {r.date} <span>· {r.count} разговоров</span>
              </h3>
              <p>{r.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
