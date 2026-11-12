import { useApp } from '../app/store';
import Icon from '../components/Icon';
import Player from '../components/Player';
import { Avatar, Modal, Ring } from '../components/ui';
import { TALKS, isBad, talkWhere } from '../data/hotel';
import { CRIT_LABELS, SHIFT_KIND, SHIFTS, grade, gradeTone, shiftById, shiftNames, shiftOfTime, staffByName } from '../data/shifts';
import { cx, num1 } from '../lib/format';

const critColor = (v) => (v >= 8 ? 'var(--blue)' : v >= 6 ? 'var(--navy)' : 'var(--red)');

function CritBars({ values, labels = CRIT_LABELS }) {
  return (
    <ul className="rp-bars">
      {values.map((v, k) => (
        <li key={labels[k]} style={{ '--k': k, '--c': critColor(v), '--w': `${v * 10}%` }}>
          <span>{labels[k]}</span>
          <i />
          <b>{v} из 10</b>
        </li>
      ))}
    </ul>
  );
}

function Points({ good, grow }) {
  if (!good.length && !grow.length) return null;
  return (
    <div className="pts">
      {good.length > 0 && (
        <div>
          <h5>Что получилось</h5>
          <ul>
            {good.map((t) => (
              <li key={t} className="ok">
                <Icon name="check" size={14} stroke={2.4} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
      {grow.length > 0 && (
        <div>
          <h5>Что улучшить</h5>
          <ul>
            {grow.map((t) => (
              <li key={t} className="warn">
                <Icon name="alert" size={14} stroke={2} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Отчёт за смену: кто работал, как справился, что сделать. Можно распечатать.
   --------------------------------------------------------------------------- */
export function ShiftModal({ open, onClose, id }) {
  const { openModal } = useApp();
  const s = shiftById(id) ?? SHIFTS[1];
  const kind = SHIFT_KIND[s.kind];
  const live = s.status === 'live';
  const kpis = [
    { label: 'Оценка ИИ', value: `${num1(s.score)} из 10`, note: live ? 'предварительно' : grade(s.score) },
    { label: 'Разговоров', value: s.talks, note: `звонков ${s.calls}, у стойки ${s.desk}` },
    { label: 'Проблемных', value: s.bad, note: s.bad ? 'требуют внимания' : 'нет' },
    { label: 'WhatsApp', value: s.wa, note: 'сообщений' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${kind.label}, ${s.date}`}
      sub={`${kind.hours} · ${live ? 'смена идёт, отчёт будет в ' + s.report : 'отчёт отправлен в Telegram в ' + s.report}`}
      icon={kind.icon}
      width={680}
      className="rp printable"
      footer={
        <button type="button" className="btn sm solid" onClick={() => window.print()}>
          <Icon name="printer" size={16} /> Печать
        </button>
      }
    >
      <div className="rp-kpis">
        {kpis.map((k, i) => (
          <div key={k.label} style={{ '--k': i }}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em>{k.note}</em>
          </div>
        ))}
      </div>

      <section className="rp-sec">
        <h4>Вывод ИИ</h4>
        <p className="rp-text">{s.summary}</p>
        <Points good={s.good} grow={s.grow} />
      </section>

      <section className="rp-sec">
        <h4>Кто работал и как справился</h4>
        {s.staff.map((p) => (
          <div key={p.name} className="who-card">
            <button type="button" className="who-head" onClick={() => openModal('staff', { name: p.name })}>
              <Avatar name={p.name} size={44} />
              <span>
                <strong>{p.name}</strong>
                <em>
                  <Icon name="camera" size={13} /> на ресепшене {p.seen} · {p.talks} разговоров, проблемных {p.bad}
                </em>
              </span>
              <span className={cx('chip', gradeTone(p.score))}>
                {num1(p.score)} · {grade(p.score)}
              </span>
            </button>
            <p className="rp-text">{p.verdict}</p>
            <CritBars values={p.crit} />
          </div>
        ))}
      </section>

      {s.todo.length > 0 && (
        <section className="rp-sec">
          <h4>Что передать следующей смене</h4>
          <ul className="todo">
            {s.todo.map((t) => (
              <li key={t}>
                <i />
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="rp-foot">Отчёт формируется автоматически при пересменке: в 08:00 и в 20:00. Демо-данные.</p>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   Разговор: запись, оценка ИИ по критериям, расшифровка и совет.
   --------------------------------------------------------------------------- */
export function TalkModal({ open, onClose, id }) {
  const t = TALKS.find((x) => x.id === id) ?? TALKS[0];
  const shift = shiftById(shiftOfTime(t.time));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={talkWhere(t)}
      sub={`${t.time} · ${t.admin} · ${SHIFT_KIND[shift.kind].label.toLowerCase()}`}
      icon={t.kind === 'call' ? 'phone' : 'mic'}
      width={640}
      className="rp"
    >
      <div className="talk-top">
        <Ring value={t.score / 10} size={84} stroke={10} color={t.score >= 8 ? 'var(--blue)' : t.score >= 5 ? 'var(--navy)' : 'var(--red)'}>
          <strong className="goal-pct">{t.score}</strong>
        </Ring>
        <div>
          <p className="rp-text">{t.summary}</p>
          <p className="talk-chips">
            <span className="chip">Гость: {t.mood}</span>
            {t.flags.map((f) => (
              <span key={f} className="chip red">
                {f}
              </span>
            ))}
            {!isBad(t) && <span className="chip green">Без замечаний</span>}
          </p>
        </div>
      </div>

      <Player id={t.id} dur={t.dur} />

      <section className="rp-sec">
        <h4>Оценка ИИ</h4>
        <ul className="crit">
          {t.crit.map(([name, v, note]) => (
            <li key={name} style={{ '--c': critColor(v), '--w': `${v * 10}%` }}>
              <span>
                <strong>{name}</strong>
                <em>{note}</em>
              </span>
              <i />
              <b>{v}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-sec">
        <h4>Расшифровка</h4>
        <div className="dialog">
          {t.dialog.map(([who, text], k) => (
            <p key={k} className={who === 'admin' ? 'me' : 'guest'}>
              <em>{who === 'admin' ? t.admin : 'Гость'}</em>
              {text}
            </p>
          ))}
        </div>
      </section>

      <section className="rp-sec">
        <h4>Совет ИИ</h4>
        <p className="rp-text">{t.advice}</p>
        <p className="rp-text muted">Что сделать: {t.todo}</p>
      </section>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   Администратор: оценка ИИ за месяц и его последние смены.
   --------------------------------------------------------------------------- */
export function StaffModal({ open, onClose, name }) {
  const { openModal } = useApp();
  const p = staffByName(name) ?? staffByName('Айгерим');
  const shifts = SHIFTS.filter((s) => s.staff.some((x) => x.name === p.name));
  const diff = p.score - p.prev;
  return (
    <Modal open={open} onClose={onClose} title={p.name} sub={`Администратор · ${SHIFT_KIND[p.kind].label.toLowerCase().replace('ая', 'ые').replace('смена', 'смены')} · ноябрь`} icon="user" width={620} className="rp">
      <div className="talk-top">
        <Ring value={p.score / 10} size={92} stroke={10} color={p.score >= 7.5 ? 'var(--blue)' : 'var(--navy)'}>
          <strong className="goal-pct">{num1(p.score)}</strong>
        </Ring>
        <div>
          <p className="talk-chips">
            <span className={cx('chip', gradeTone(p.score))}>{grade(p.score)}</span>
            <span className={cx('chip', diff >= 0 ? 'green' : 'red')}>
              {diff >= 0 ? '+' : '−'}
              {num1(Math.abs(diff))} за месяц
            </span>
          </p>
          <p className="rp-text">{p.verdict}</p>
        </div>
      </div>

      <div className="rp-kpis">
        {[
          ['Смен', p.shifts],
          ['Разговоров', p.talks],
          ['Проблемных', p.bad],
          ['Фото для камеры', p.photo ? 'есть' : 'нет'],
        ].map(([label, value], i) => (
          <div key={label} style={{ '--k': i }}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="rp-sec">
        <Points good={p.good} grow={p.grow} />
      </section>

      <section className="rp-sec">
        <h4>Последние смены</h4>
        <table className="rp-table">
          <tbody>
            {shifts.map((s) => {
              const me = s.staff.find((x) => x.name === p.name);
              return (
                <tr key={s.id} className="rp-click" onClick={() => openModal('shift', { id: s.id })}>
                  <td>{s.date}</td>
                  <td>
                    {SHIFT_KIND[s.kind].label}
                    {s.staff.length > 1 ? ` (вместе: ${shiftNames(s)})` : ''}
                  </td>
                  <td className={me.score >= 7.5 ? 'up' : me.score < 6.5 ? 'down' : ''}>{num1(me.score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   Сообщение, письмо или отзыв с разбором ИИ.
   --------------------------------------------------------------------------- */
export function NoteModal({ open, onClose, title, sub, icon, text, ai, score }) {
  return (
    <Modal open={open} onClose={onClose} title={title} sub={sub} icon={icon} width={520} className="rp">
      <section className="rp-sec">
        <h4>Суть</h4>
        <p className="rp-text">{text}</p>
      </section>
      <section className="rp-sec">
        <h4>Разбор ИИ {score !== undefined && <span className={cx('chip', score >= 8 ? 'green' : score >= 5 ? 'amber' : 'red')}>оценка {score}</span>}</h4>
        <p className="rp-text">{ai}</p>
      </section>
    </Modal>
  );
}
