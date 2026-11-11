import Icon from '../components/Icon'
import Score from '../components/Score'
import { CardHead, DonutMulti, Kpi, PageHead, Pill } from '../components/kit'
import { REVIEWS, REVIEW_MIX, SPARKS } from '../data/hotel'

export default function Booking() {
  return (
    <div className="page">
      <PageHead title="Отзывы на Booking" sub="Что пишут гости и как отель отвечает. Отзывы подтягиваются автоматически." />

      <div className="grid-kpi">
        <Kpi icon="star" label="Оценка на Booking" value={8.6} decimals={1} tone="teal" spark={SPARKS.up} d={0} foot="из 10" />
        <Kpi icon="inbox" label="Новых отзывов за неделю" value={12} tone="green" spark={SPARKS.wave} d={1} />
        <Kpi icon="zap" label="Без ответа" value={1} tone="orange" spark={SPARKS.down} d={2} foot="ждёт 3 дня" />
        <Kpi icon="sparkle" label="Оценка ответов отеля" value={7.2} decimals={1} tone="purple" spark={SPARKS.steady} d={3} foot="из 10, по мнению ИИ" />
      </div>

      <div className="split">
        <section className="card card-pad card-in" style={{ '--d': 4 }}>
          <CardHead title="Отзывы и ответы администраторов" sub="ИИ оценивает и отзыв, и ответ отеля" icon="star" />
          <ul className="msg-list">
            {REVIEWS.map((r, i) => (
              <li key={r.id} className="msg rv" style={{ '--i': i }}>
                <Score value={r.score} decimals={1} />
                <div className="msg-text">
                  <span className="row-meta">
                    {r.name} · {r.date}
                  </span>
                  <p>«{r.text}»</p>
                  <p className="ai-note">
                    <Icon name="sparkle" />
                    {r.ai}
                  </p>
                </div>
                <Pill tone={r.replyTone}>{r.reply}</Pill>
              </li>
            ))}
          </ul>
        </section>

        <section className="card card-pad card-in" style={{ '--d': 5 }}>
          <CardHead title="За что хвалят" sub="Доля упоминаний в отзывах" icon="pie" />
          <DonutMulti items={REVIEW_MIX} size="10rem" thickness={15} d={5} title="Отзывы" />
          <p className="ai-note">
            <Icon name="sparkle" />
            Гостям нравятся чистота и завтрак. Чаще всего жалуются на Wi-Fi и ожидание при заселении.
          </p>
        </section>
      </div>
    </div>
  )
}
