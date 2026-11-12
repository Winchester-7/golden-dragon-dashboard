import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { Avatar, CountUp, PageHead, Ring } from '../components/ui';
import { CAMERA_LOG, NOW, SHIFT_KIND, SHIFTS, STAFF, grade, gradeTone, liveShift, shiftNames } from '../data/shifts';
import { cx, num1 } from '../lib/format';

const COLOR = { Айгерим: 'var(--blue)', Бакыт: 'var(--navy)', Нургуль: 'var(--solid)', Жибек: 'var(--blue-2)' };
const hm = (min) => `${Math.floor(min / 60)} ч ${String(min % 60).padStart(2, '0')} мин`;

function StaffCard({ p, d }) {
  const { openModal } = useApp();
  const diff = p.score - p.prev;
  return (
    <section className="card goal lift" style={{ '--d': d, '--c': COLOR[p.name] }}>
      <header className="goal-head rv" style={{ '--i': 0 }}>
        <Avatar name={p.name} size={44} />
        <div>
          <h3>{p.name}</h3>
          <p>
            {SHIFT_KIND[p.kind].short === 'День' ? 'Дневные смены' : 'Ночные смены'} · {p.shifts} за месяц
          </p>
        </div>
      </header>

      <div className="goal-mid rv" style={{ '--i': 1 }}>
        <Ring value={p.score / 10} size={88} stroke={10} color={COLOR[p.name]}>
          <strong className="goal-pct">{num1(p.score)}</strong>
        </Ring>
        <div className="goal-sum">
          <strong>{grade(p.score)}</strong>
          <span>
            {diff >= 0 ? '▲' : '▼'} {num1(Math.abs(diff))} за месяц
          </span>
        </div>
      </div>

      <div className="goal-split rv" style={{ '--i': 2 }} aria-label={`Разговоров ${p.talks}, проблемных ${p.bad}`}>
        <i style={{ '--w': `${((p.talks - p.bad) / p.talks) * 100}%` }} />
      </div>
      <p className="goal-who rv" style={{ '--i': 3 }}>
        <span>
          <i className="dot" style={{ '--c': COLOR[p.name] }} /> Разговоров <CountUp value={p.talks} />
        </span>
        <span>
          <i className="dot goal-dot-2" /> Проблемных {p.bad}
        </span>
      </p>

      <button type="button" className="btn sm soft goal-btn rv" style={{ '--i': 4 }} onClick={() => openModal('staff', { name: p.name })}>
        <Icon name="sparkle" size={15} /> Как справляется
      </button>
    </section>
  );
}

/** Смены: кто на ресепшене сейчас, журнал камеры, оценка ИИ по каждому администратору и список смен. */
export default function Shifts() {
  const { openModal, go } = useApp();
  const s = liveShift;
  const kind = SHIFT_KIND[s.kind];
  const part = NOW.elapsedMin / NOW.totalMin;

  return (
    <>
      <PageHead title="Смены ресепшена" crumbs={['Обзор', 'Смены']}>
        <button type="button" className="btn sm outline" onClick={() => go('calendar')}>
          <Icon name="calendar" size={16} /> График
        </button>
        <button type="button" className="btn sm blue shine" onClick={() => openModal('shift', { id: s.id })}>
          <Icon name="statement" size={16} /> Текущая смена
        </button>
      </PageHead>

      <div className="page">
        <div className="split split--2-1">
          <section className="card joint" style={{ '--d': '0ms' }}>
            <span className="klass-glow" aria-hidden="true" />
            <div className="joint-top rv" style={{ '--i': 0 }}>
              <span className="joint-faces">
                {s.staff.map((p) => (
                  <Avatar key={p.name} name={p.name} size={44} />
                ))}
                <span className="joint-heart">
                  <Icon name="camera" size={13} stroke={2.2} />
                </span>
              </span>
              <span>
                <strong>Сейчас на ресепшене</strong>
                <em>
                  {kind.label} · {kind.hours}
                </em>
              </span>
            </div>

            <div className="joint-total rv" style={{ '--i': 1 }}>
              <span>Камера узнала сотрудника в {s.staff[0].seen.replace('с ', '')}</span>
              <strong className="big">{shiftNames(s)}</strong>
              <em>
                {s.talks} разговора за смену, проблемных нет · предварительная оценка ИИ {num1(s.score)}
              </em>
            </div>

            <div className="joint-bar joint-bar--time rv" style={{ '--i': 2 }}>
              <i style={{ '--w': `${Math.max(part * 100, 4)}%` }} />
              <i style={{ '--w': `${100 - Math.max(part * 100, 4)}%` }} />
            </div>
            <div className="joint-legend rv" style={{ '--i': 3 }}>
              <span>
                <i className="dot" style={{ '--c': 'var(--blue)' }} /> Прошло <b>{hm(NOW.elapsedMin)}</b>
              </span>
              <span>
                <i className="dot" style={{ '--c': 'var(--blue-soft)' }} /> До пересменки и отчёта <b>{hm(NOW.totalMin - NOW.elapsedMin)}</b>
              </span>
            </div>
          </section>

          <section className="card" style={{ '--d': '90ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <div>
                <h3>Камера ресепшена</h3>
                <p>Кто пришёл и ушёл сегодня</p>
              </div>
              <span className="live-dot">Онлайн</span>
            </header>
            <ul className="feed">
              {CAMERA_LOG.map((a, k) => (
                <li key={a.id} className="rv" style={{ '--i': k + 1 }}>
                  <Avatar name={a.name} size={36} />
                  <span>
                    <strong>{a.name}</strong> {a.text}
                    <em>{a.kind === 'report' ? 'автоматически' : 'распознано по лицу'}</em>
                  </span>
                  <b className={cx(a.kind === 'out' && 'feed-out')}>{a.time}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="goals goals--4">
          {STAFF.map((p, k) => (
            <StaffCard key={p.id} p={p} d={`${180 + k * 70}ms`} />
          ))}
        </div>

        <section className="card" style={{ '--d': '460ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <div>
              <h3>Все смены</h3>
              <p>Отчёт ИИ готов сразу после пересменки: в 08:00 и в 20:00</p>
            </div>
          </header>
          <div className="inv-table sh-table" role="table" aria-label="Смены">
            <div className="inv-row inv-headrow rv" role="row" style={{ '--i': 1 }}>
              <span role="columnheader">Кто работал</span>
              <span role="columnheader">Смена</span>
              <span role="columnheader">Разговоров</span>
              <span role="columnheader">Проблемных</span>
              <span role="columnheader">Оценка ИИ</span>
              <span role="columnheader">Итог</span>
              <span />
            </div>
            {SHIFTS.map((x, k) => (
              <div key={x.id} className="inv-row rv" role="row" tabIndex={0} style={{ '--i': Math.min(k, 8) + 2 }} onClick={() => openModal('shift', { id: x.id })} onKeyDown={(e) => e.key === 'Enter' && openModal('shift', { id: x.id })}>
                <span className="inv-client" role="cell">
                  <span className="faces">
                    {x.staff.map((p) => (
                      <Avatar key={p.name} name={p.name} size={38} />
                    ))}
                  </span>
                  <span>
                    <strong>{shiftNames(x)}</strong>
                    <em>на ресепшене {x.staff[0].seen}</em>
                  </span>
                </span>
                <span className="inv-id" role="cell">
                  <strong>
                    {x.wd}, {x.date}
                  </strong>
                  <em>
                    {SHIFT_KIND[x.kind].label} · {SHIFT_KIND[x.kind].hours}
                  </em>
                </span>
                <span role="cell" className="inv-date">
                  {x.talks}
                </span>
                <span role="cell" className={cx('inv-due', x.bad >= 4 && 'late')}>
                  {x.bad || 'нет'}
                </span>
                <strong role="cell" className="inv-amt">
                  {num1(x.score)}
                </strong>
                <span role="cell">
                  <span className={cx('chip', x.status === 'live' ? 'blue' : gradeTone(x.score))}>
                    <i className="dot" style={{ '--c': 'currentColor' }} />
                    {x.status === 'live' ? 'Идёт сейчас' : grade(x.score)}
                  </span>
                </span>
                <span role="cell" className="inv-act">
                  <Icon name="chevronRight" size={16} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
