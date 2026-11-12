import Icon from './Icon'
import Player from './Player'
import { HBars, Pill, Ring } from './kit'
import { talkWhere, tone } from '../data/hotel'

const COLOR = { green: 'var(--green)', orange: 'var(--orange)', red: 'var(--red)' }

/** Разбор одного разговора: оценка, запись, критерии, что сделать, совет и текст. */
export default function TalkDetails({ talk: t, close }) {
  const crit = t.crit.map(([label, value, sub]) => ({ label, value, sub, color: COLOR[tone(value)] }))
  return (
    <div className="talk">
      <header className="talk-head">
        <Ring value={t.score * 10} size="5.6rem" stroke={11} color={COLOR[tone(t.score)]} label={`Оценка ${t.score} из 10`}>
          <b>{t.score}</b>
          <span>из 10</span>
        </Ring>
        <div className="talk-head-text">
          <p className="talk-meta">
            {t.time} · {talkWhere(t)} · {t.admin}
          </p>
          <h3>{t.summary}</h3>
          <div className="talk-pills">
            {t.flags.map((f) => (
              <Pill key={f} tone="red">
                {f}
              </Pill>
            ))}
            <Pill tone={t.flags.length ? 'orange' : 'green'}>Гость {t.mood}</Pill>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={close} aria-label="Закрыть">
          <Icon name="x" />
        </button>
      </header>

      <div className="talk-body">
        <section className="talk-sec">
          <h4>Запись разговора</h4>
          <Player id={t.id} dur={t.dur} />
          <p className="talk-note">В макете звука нет. В рабочей программе здесь будет настоящая запись.</p>
        </section>

        <section className="talk-sec">
          <h4>Оценка по правилам</h4>
          <HBars items={crit} format={(v) => `${v} из 10`} max={10} />
          <ul className="talk-crit">
            {crit.map((c) => (
              <li key={c.label}>
                <b>{c.label}:</b> {c.sub}
              </li>
            ))}
          </ul>
        </section>

        <section className="talk-box talk-box--todo">
          <h4>
            <Icon name="check" /> Что нужно сделать
          </h4>
          <p>{t.todo}</p>
        </section>
        <section className="talk-box talk-box--advice">
          <h4>
            <Icon name="bulb" /> Совет администратору от ИИ
          </h4>
          <p>{t.advice}</p>
        </section>

        <section className="talk-sec">
          <h4>Текст разговора</h4>
          <div className="talk-dialog">
            {t.dialog.map(([who, text], i) => (
              <div key={i} className={`bubble bubble--${who}`}>
                <em>{who === 'guest' ? 'Гость' : 'Администратор'}</em>
                {text}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
