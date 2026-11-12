import { useMemo } from 'react'
import Icon from '../components/Icon'
import Score from '../components/Score'
import { BarChart, CardHead, HBars, PageHead, Ring } from '../components/kit'
import { useApp } from '../lib/store'
import { downloadCsv } from '../lib/ui'
import { CRITERIA, TOPICS } from '../data/hotel'
import { SHIFT_KIND, SHIFTS, STAFF, WEEKS, grade, shiftNames } from '../data/shifts'

const COLOR = (v) => (v >= 8 ? 'var(--green)' : v >= 6.5 ? 'var(--orange)' : 'var(--red)')

/** Отчёты за смену: ИИ готовит отчёт при каждой пересменке, в 08:00 и в 20:00. */
export default function Reports() {
  const { toast, openShift } = useApp()
  const week = WEEKS.this
  const series = useMemo(
    () => [
      { id: 'day', label: 'Дневная смена', color: 'var(--green)', data: week.day },
      { id: 'night', label: 'Ночная смена', color: 'var(--teal)', data: week.night.map((v) => v ?? 9) },
    ],
    [week],
  )
  const exportCsv = () => {
    downloadCsv('golden-dragon-smeny.csv', [['Дата', 'Смена', 'Кто работал', 'Разговоров', 'Проблемных', 'Оценка ИИ', 'Вывод'], ...SHIFTS.map((s) => [s.date, SHIFT_KIND[s.kind].label, shiftNames(s), s.talks, s.bad, s.score, s.summary])])
    toast({ text: 'Отчёты сохранены в CSV', icon: 'download' })
  }

  return (
    <div className="page">
      <PageHead title="Отчёты за смену" sub="ИИ готовит отчёт каждые 12 часов, при пересменке: в 08:00 за ночную смену и в 20:00 за дневную. Такой же приходит в Telegram.">
        <button className="btn btn--white" onClick={exportCsv}>
          <Icon name="download" />
          Скачать
        </button>
      </PageHead>

      <div className="split">
        <section className="card card-pad card-in" style={{ '--d': 0 }}>
          <CardHead title="Оценка смен за неделю" sub="Дневные и ночные смены по дням" icon="bars">
            <div className="legend">
              {series.map((s) => (
                <span key={s.id}>
                  <i style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          </CardHead>
          <BarChart labels={week.days} series={series} height="15rem" d={0} format={(v) => v.toFixed(1)} />
        </section>

        <section className="card card-pad card-in" style={{ '--d': 1 }}>
          <CardHead title="Администраторы" sub="Оценка ИИ за ноябрь" icon="users" />
          <ul className="admin-list admin-list--tight">
            {STAFF.map((m, i) => (
              <li key={m.id} className="rv" style={{ '--i': i }}>
                <Ring value={m.score * 10} size="4.4rem" stroke={11} color={COLOR(m.score)} d={1} label={`${m.name}: ${m.score} из 10`}>
                  <b>{m.score.toFixed(1)}</b>
                </Ring>
                <div>
                  <b>
                    {m.name} · {grade(m.score).toLowerCase()}
                  </b>
                  <span>
                    {m.kind === 'day' ? 'дневные смены' : 'ночные смены'} · {m.talks} разговоров
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="rows">
        {SHIFTS.map((r, i) => (
          <button key={r.id} type="button" className="card report report--link card-in" style={{ '--d': 2 + i }} onClick={() => openShift(r.id)}>
            <Score value={r.score} decimals={1} />
            <div>
              <h3>
                {r.status === 'live' ? `Будет в ${r.report}` : `Отчёт в ${r.report}`} · {SHIFT_KIND[r.kind].label.toLowerCase()}, {r.date}{' '}
                <span>
                  · {shiftNames(r)} · {r.talks} разговоров
                </span>
              </h3>
              <p>{r.summary}</p>
            </div>
            <Icon name="arrowRight" />
          </button>
        ))}
      </div>

      <div className="split split--even">
        <section className="card card-pad card-in" style={{ '--d': 10 }}>
          <CardHead title="Что получается, а что нет" sub="Средняя оценка по правилам общения" icon="tasks" />
          <HBars items={CRITERIA.map((c) => ({ ...c, color: COLOR(c.value) }))} d={10} format={(v) => v.toFixed(1)} />
        </section>
        <section className="card card-pad card-in" style={{ '--d': 11 }}>
          <CardHead title="О чём спрашивают гости" sub="Самые частые темы за сутки" icon="tag" />
          <HBars items={TOPICS} d={11} format={(v) => `${v}`} color="var(--teal-2)" />
        </section>
      </div>
    </div>
  )
}
