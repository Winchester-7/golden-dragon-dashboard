import { useMemo } from 'react'
import Icon from '../components/Icon'
import Score from '../components/Score'
import { BarChart, CardHead, Kpi, PageHead, Pill } from '../components/kit'
import { CHATS, SPARKS, WA_HOURS } from '../data/hotel'

export default function WhatsApp() {
  const series = useMemo(() => [{ id: 'wait', label: 'Минут до ответа', color: 'var(--green)', data: WA_HOURS.values }], [])
  return (
    <div className="page">
      <PageHead title="WhatsApp и служебный телефон" sub="Как быстро и как вежливо отвечают гостям в переписке." />

      <div className="grid-kpi">
        <Kpi icon="smartphone" label="Переписок за день" value={23} tone="green" spark={SPARKS.up} d={0} foot="с 19 гостями" />
        <Kpi icon="clock" label="Среднее время ответа, мин" value={6} tone="teal" spark={SPARKS.down} d={1} foot="норма: до 10 минут" />
        <Kpi icon="zap" label="Ответили позже 30 минут" value={2} tone="orange" spark={SPARKS.steady} d={2} foot="гости долго ждали" />
        <Kpi icon="phone" label="Звонков со служебного" value={14} tone="purple" spark={SPARKS.wave} d={3} foot="входящие и исходящие" />
      </div>

      <div className="split">
        <section className="card card-pad card-in" style={{ '--d': 4 }}>
          <CardHead title="Переписки с гостями" sub="Оценка ИИ, время ответа и совет" icon="smartphone" />
          <ul className="msg-list">
            {CHATS.map((c, i) => (
              <li key={c.id} className="msg rv" style={{ '--i': i }}>
                <Score value={c.score} />
                <div className="msg-text">
                  <span className="row-meta">
                    {c.time} · {c.who} · {c.wait}
                  </span>
                  <p>{c.summary}</p>
                  <p className="ai-note">
                    <Icon name="sparkle" />
                    {c.ai}
                  </p>
                </div>
                {c.flag && <Pill tone="red">{c.flag}</Pill>}
              </li>
            ))}
          </ul>
        </section>

        <section className="card card-pad card-in" style={{ '--d': 5 }}>
          <CardHead title="Сколько ждут ответа" sub="Минуты до ответа по времени суток" icon="bars" />
          <BarChart labels={WA_HOURS.labels} series={series} height="15rem" d={5} format={(v) => `${v} мин`} />
          <p className="ai-note">
            <Icon name="sparkle" />
            Вечером после 20:00 гости ждут ответа дольше всего. Стоит проверять телефон чаще.
          </p>
        </section>
      </div>
    </div>
  )
}
