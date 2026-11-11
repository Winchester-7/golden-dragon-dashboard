import Icon from '../components/Icon'
import Player from '../components/Player'
import Score from '../components/Score'
import { CardHead, Kpi, PageHead, Segmented } from '../components/kit'
import { useApp } from '../lib/store'
import { useShared } from '../lib/shared'
import { SPARKS, TALKS, mmss, secs, talkWhere } from '../data/hotel'

const FILTERS = [
  { id: 'all', label: 'Все записи' },
  { id: 'call', label: 'Звонки' },
  { id: 'desk', label: 'У стойки' },
]

export default function Records() {
  const { openTalk } = useApp()
  const [kind, setKind] = useShared('records.kind', 'all')
  const rows = TALKS.filter((t) => kind === 'all' || t.kind === kind)
  const total = TALKS.reduce((a, t) => a + secs(t.dur), 0)

  return (
    <div className="page">
      <PageHead title="Записи разговоров" sub="Все аудиозаписи за день. Нажмите на кнопку, чтобы прослушать.">
        <Segmented label="Тип записи" options={FILTERS} value={kind} onChange={setKind} />
      </PageHead>

      <div className="grid-kpi">
        <Kpi icon="play" label="Записей в примере" value={TALKS.length} tone="green" spark={SPARKS.up} d={0} />
        <Kpi icon="phone" label="Звонков из номеров" value={TALKS.filter((t) => t.kind === 'call').length} tone="teal" spark={SPARKS.wave} d={1} />
        <Kpi icon="users" label="Бесед у стойки" value={TALKS.filter((t) => t.kind === 'desk').length} tone="purple" spark={SPARKS.steady} d={2} />
        <Kpi icon="clock" label="Минут записи" value={Math.round(total / 60)} tone="orange" spark={SPARKS.up} d={3} foot={`всего ${mmss(total)}`} />
      </div>

      <section className="card card-pad card-in" style={{ '--d': 4 }}>
        <CardHead title="Аудиозаписи" sub="Запись хранится вместе с оценкой и текстом разговора" icon="play" />
        <ul className="rec-list">
          {rows.map((t, i) => (
            <li key={t.id} className="rec rv" style={{ '--i': i }}>
              <div className="rec-info">
                <b>
                  {t.time} · {talkWhere(t)}
                </b>
                <span>{t.admin}</span>
              </div>
              <Player id={t.id} dur={t.dur} />
              <Score value={t.score} />
              <button className="btn btn--white btn--sm" onClick={() => openTalk(t.id)}>
                Разбор ИИ
                <Icon name="arrowRight" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="mock-note">В макете звука нет: кнопка показывает, как будет идти прослушивание. В рабочей программе здесь будут настоящие записи.</p>
    </div>
  )
}
