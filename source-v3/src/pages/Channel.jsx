import { useApp } from '../app/store';
import { Sparkline } from '../components/Charts';
import Icon from '../components/Icon';
import { CountUp, PageHead } from '../components/ui';
import { CHATS, MAILS, REVIEWS } from '../data/hotel';
import { cx, num1 } from '../lib/format';

const tone = (score, max = 10) => (score / max >= 0.8 ? 'green' : score / max >= 0.5 ? 'amber' : 'red');

const CHANNELS = {
  whatsapp: {
    name: 'WhatsApp', icon: 'message', label: 'Средняя оценка переписки', score: 7.1, goal: '23 переписки за сутки', share: 0.71,
    eta: 'Двум гостям ответили слишком поздно или не ответили совсем', trend: [6.2, 6.8, 6.5, 7.0, 7.4, 6.9, 7.1],
    day: { n: 14, wait: 'ответ в среднем через 6 мин' }, night: { n: 9, wait: 'ответ в среднем через 31 мин' }, ok: 21, late: 2, listTitle: 'Переписки',
    rows: CHATS.map((c) => ({ id: c.id, title: c.who, sub: c.summary, time: c.time, wait: c.wait, score: c.score, ai: c.ai, bad: !!c.flag })),
  },
  mail: {
    name: 'Почта Outlook', icon: 'mail', label: 'Средняя оценка ответов', score: 7.6, goal: '17 писем за сутки', share: 0.76,
    eta: 'Одно письмо без ответа пять часов: гость просит счёт', trend: [7.0, 7.4, 7.1, 7.8, 7.5, 7.9, 7.6],
    day: { n: 15, wait: 'ответ в среднем через 48 мин' }, night: { n: 2, wait: 'отвечает дневная смена' }, ok: 15, late: 2, listTitle: 'Письма',
    rows: MAILS.map((m) => ({ id: m.id, title: m.subject, sub: `${m.from} · ${m.summary}`, time: m.time, wait: m.wait, score: m.score, ai: m.ai, bad: !!m.flag })),
  },
  booking: {
    name: 'Отзывы Booking', icon: 'star', label: 'Оценка отеля на Booking', score: 8.6, goal: '12 отзывов за месяц', share: 0.86,
    eta: 'Один отзыв с оценкой 6,0 без ответа три дня', trend: [8.2, 8.3, 8.5, 8.4, 8.7, 8.5, 8.6],
    day: { n: 11, wait: 'ответов на отзывы' }, night: { n: 1, wait: 'ждёт ответа' }, ok: 11, late: 1, listTitle: 'Отзывы',
    rows: REVIEWS.map((r) => ({ id: r.id, title: r.name, sub: r.text, time: r.date, wait: r.reply, score: r.score, ai: r.ai, bad: r.replyTone !== 'green' })),
  },
};

/** Канал: WhatsApp, почта или отзывы Booking с разбором ИИ. */
export default function Channel({ param }) {
  const { openModal } = useApp();
  const c = CHANNELS[param] ?? CHANNELS.whatsapp;
  const booking = param === 'booking';

  return (
    <>
      <PageHead title={c.name} crumbs={['Каналы', c.name]} />

      <div className="split split--2-1">
        <section className="card pocket-hero" style={{ '--d': '0ms' }}>
          <div className="pocket-top rv" style={{ '--i': 0 }}>
            <span className="pocket-icon">
              <Icon name={c.icon} size={22} />
            </span>
            <span className="chip">{c.goal}</span>
          </div>
          <div className="rv" style={{ '--i': 1 }}>
            <p className="pocket-label">{c.label}</p>
            <strong className="big pocket-big">
              <CountUp value={c.score} format={num1} />
            </strong>
            <p className="pocket-goal">из 10</p>
          </div>
          <div className="pocket-bar rv" style={{ '--i': 2 }}>
            <i style={{ '--w': `${c.share * 100}%` }} />
          </div>
          <p className="pocket-eta rv" style={{ '--i': 3 }}>
            {c.eta}
          </p>
          <div className="pocket-spark rv" style={{ '--i': 4 }}>
            <Sparkline values={c.trend} color="#fff" height={70} />
          </div>
        </section>

        <div className="pocket-side">
          <section className="card" style={{ '--d': '90ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <div>
                <h3>{booking ? 'Ответы на отзывы' : 'Кто отвечал'}</h3>
                <p>{booking ? 'за ноябрь' : 'по сменам за сутки'}</p>
              </div>
            </header>
            <div className="pocket-auto rv" style={{ '--i': 1 }}>
              <strong>{c.day.n}</strong>
              <span>
                {booking ? '' : 'дневная смена · '}
                {c.day.wait}
              </span>
            </div>
            <div className="pocket-auto rv" style={{ '--i': 2 }}>
              <strong>{c.night.n}</strong>
              <span>
                {booking ? '' : 'ночная смена · '}
                {c.night.wait}
              </span>
            </div>
          </section>

          <section className="card pocket-stats" style={{ '--d': '160ms' }}>
            <div className="rv" style={{ '--i': 0 }}>
              <em>Вовремя</em>
              <strong className="up">{c.ok}</strong>
            </div>
            <div className="rv" style={{ '--i': 1 }}>
              <em>Требуют внимания</em>
              <strong className="down">{c.late}</strong>
            </div>
          </section>
        </div>
      </div>

      <section className="card pocket-history" style={{ '--d': '230ms' }}>
        <header className="card-head rv" style={{ '--i': 0 }}>
          <div>
            <h3>{c.listTitle}</h3>
            <p>Нажмите на строку, чтобы увидеть разбор ИИ</p>
          </div>
        </header>
        <ul className="tx-list">
          {c.rows.map((r, k) => (
            <li key={r.id} className="tx tx--click rv" style={{ '--i': Math.min(k, 8) + 1 }} role="button" tabIndex={0} onClick={() => openModal('note', { title: r.title, sub: `${r.time} · ${r.wait}`, icon: c.icon, text: r.sub, ai: r.ai, score: r.score })} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}>
              <span className={cx('tx-icon', !r.bad && 'in')}>
                <Icon name={r.bad ? 'alert' : 'check'} size={18} />
              </span>
              <span className="tx-main">
                <strong>{r.title}</strong>
                <span>{r.sub}</span>
              </span>
              <span className="tx-date">
                {r.time} · {r.wait}
              </span>
              <span className="tx-end">
                <span className={cx('chip', tone(r.score))}>{booking ? num1(r.score) : `${r.score} из 10`}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
