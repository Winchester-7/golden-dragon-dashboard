import Icon from '../components/Icon'
import Score from '../components/Score'
import { CardHead, HBars, Kpi, PageHead, Pill } from '../components/kit'
import { useApp } from '../lib/store'
import { MAILS, MAIL_TOPICS, SPARKS } from '../data/hotel'

export default function MailPage() {
  const { toast } = useApp()
  return (
    <div className="page">
      <PageHead title="Почта Outlook" sub="Сводка ИИ по письмам гостей и ответам администраторов.">
        <button className="btn btn--white" onClick={() => toast({ text: 'Черновик ответа открыт в Outlook', icon: 'mail', tone: 'teal' })}>
          <Icon name="mail" />
          Открыть черновик
        </button>
      </PageHead>

      <section className="card digest card-in" style={{ '--d': 0 }}>
        <span className="digest-tag">
          <Icon name="sparkle" /> Сводка Outlook от ИИ
        </span>
        <h2>За день пришло 17 писем. На 15 ответили вовремя, два письма ждут ответа больше четырёх часов.</h2>
        <p>
          Главное: гость m.keller просит счёт для компании, ответа нет 5 часов. Турфирма спрашивает о 12 номерах на 20–23 ноября, ответили быстро и полно. Чаще всего пишут о бронировании и счетах.
        </p>
      </section>

      <div className="grid-kpi">
        <Kpi icon="mail" label="Писем за день" value={17} tone="green" spark={SPARKS.wave} d={1} foot="брони, вопросы, счета" />
        <Kpi icon="clock" label="Среднее время ответа, мин" value={80} tone="teal" spark={SPARKS.down} d={2} foot="норма: до 2 часов" />
        <Kpi icon="zap" label="Без ответа" value={2} tone="orange" spark={SPARKS.steady} d={3} foot="дольше 4 часов" />
        <Kpi icon="star" label="Оценка ответов" value={7.6} decimals={1} tone="purple" spark={SPARKS.up} d={4} foot="из 10" />
      </div>

      <div className="split">
        <section className="card card-pad card-in" style={{ '--d': 5 }}>
          <CardHead title="Письма и ответы администраторов" sub="Оценка ИИ по каждому ответу" icon="inbox" />
          <ul className="msg-list">
            {MAILS.map((m, i) => (
              <li key={m.id} className="msg rv" style={{ '--i': i }}>
                <Score value={m.score} />
                <div className="msg-text">
                  <span className="row-meta">
                    {m.time} · {m.from} · {m.wait}
                  </span>
                  <b>{m.subject}</b>
                  <p>{m.summary}</p>
                  <p className="ai-note">
                    <Icon name="sparkle" />
                    {m.ai}
                  </p>
                </div>
                {m.flag && <Pill tone="red">{m.flag}</Pill>}
              </li>
            ))}
          </ul>
        </section>

        <div className="stack">
          <section className="card card-pad card-in" style={{ '--d': 6 }}>
            <CardHead title="О чём пишут" sub="Темы писем за день" icon="tag" />
            <HBars items={MAIL_TOPICS} d={6} format={(v) => `${v}`} color="var(--teal-2)" />
          </section>
          <section className="card card-pad card-in" style={{ '--d': 7 }}>
            <CardHead title="Что нужно сделать по почте" icon="tasks" />
            <ul className="todo-list">
              <li className="rv" style={{ '--i': 0 }}>
                <span className="ins-ic tone-red">
                  <Icon name="mail" />
                </span>
                <p>Ответить m.keller и приложить счёт. Черновик ответа уже подготовлен ИИ.</p>
              </li>
              <li className="rv" style={{ '--i': 1 }}>
                <span className="ins-ic tone-orange">
                  <Icon name="bulb" />
                </span>
                <p>Напомнить администраторам: в ответах всегда здороваться и предлагать варианты, а не писать одно слово.</p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
