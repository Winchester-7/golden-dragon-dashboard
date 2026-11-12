import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { Avatar, PageHead } from '../components/ui';
import { SHIFT_KIND, SHIFTS, STAFF, grade, gradeTone, rota } from '../data/shifts';
import { cx, num1 } from '../lib/format';

const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const TODAY = 10; /* демо: 10 ноября 2026 */
const LEAD = 6; /* 1 ноября 2026 — воскресенье */
const CELLS = Array.from({ length: 42 }, (_, k) => k - LEAD + 1); /* <1 октябрь, >30 декабрь */
const COLOR = { Айгерим: 'var(--blue)', Бакыт: 'var(--navy)', Нургуль: 'var(--solid)', Жибек: 'var(--blue-2)' };
const shiftOf = (kind, n) => SHIFTS.find((s) => s.kind === kind && s.date === `${n} ноября`);

/** График смен на месяц: кто работает днём и ночью, с оценкой ИИ за прошедшие смены. */
export default function Calendar() {
  const { openModal, toast } = useApp();
  const [sel, setSel] = useState(TODAY);
  const r = rota(sel);

  const rows = ['day', 'night'].map((kind) => ({ kind, names: r[kind], shift: shiftOf(kind, sel) }));
  const counts = STAFF.map((p) => ({ ...p, planned: Array.from({ length: 30 }, (_, k) => rota(k + 1)).filter((x) => x.day.includes(p.name) || x.night.includes(p.name)).length }));

  return (
    <>
      <PageHead title="График смен" crumbs={['Обзор', 'График']}>
        <div className="toggles">
          {STAFF.map((p) => (
            <span key={p.id} className="toggle-pill on">
              <i className="dot" style={{ '--c': COLOR[p.name] }} />
              {p.name}
            </span>
          ))}
        </div>
      </PageHead>

      <div className="split split--cal">
        <section className="card cal" style={{ '--d': '0ms' }}>
          <header className="cal-head rv" style={{ '--i': 0 }}>
            <h3 className="cal-month">Ноябрь 2026</h3>
            <div className="card-actions">
              <button type="button" className="btn sm outline" onClick={() => setSel(TODAY)}>
                Сегодня
              </button>
            </div>
          </header>

          <div className="cal-week rv" style={{ '--i': 1 }}>
            {WEEK.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="cal-grid">
            {CELLS.map((n, k) => {
              const out = n < 1 || n > 30;
              const num = n < 1 ? 31 + n : n > 30 ? n - 30 : n;
              const x = out ? null : rota(n);
              return (
                <button key={k} type="button" disabled={out} className={cx('cal-day', out && 'out', n === TODAY && 'today', n === sel && 'sel', n < TODAY && 'past')} style={{ '--k': k }} onClick={() => setSel(n)} aria-pressed={n === sel} aria-label={out ? undefined : `${n} ноября: днём ${x.day.join(' и ')}, ночью ${x.night.join(' и ')}`}>
                  <span className="cal-num">{num}</span>
                  {x && (
                    <>
                      <span className="cal-evs">
                        <i style={{ '--c': COLOR[x.day[0]] }}>☀ {x.day.join(', ')}</i>
                        <i style={{ '--c': COLOR[x.night[0]] }}>☾ {x.night.join(', ')}</i>
                      </span>
                      <span className="cal-dots" aria-hidden="true">
                        {[...x.day, ...x.night].map((name) => (
                          <i key={name} style={{ '--c': COLOR[name] }} />
                        ))}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <p className="cal-hint rv" style={{ '--i': 2 }}>
            Фактический состав смены подтверждается камерой ресепшена. Если пришёл другой администратор, в отчёте будет его имя.
          </p>
        </section>

        <div className="cal-side">
          <section className="card" style={{ '--d': '90ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <div>
                <h3>{sel === TODAY ? 'Сегодня' : sel === TODAY - 1 ? 'Вчера' : sel === TODAY + 1 ? 'Завтра' : `${sel} ноября`}</h3>
                <p>{sel} ноября 2026</p>
              </div>
            </header>
            <ul className="agenda" key={sel}>
              {rows.map((row, k) => (
                <li key={row.kind} className="rv" style={{ '--i': k + 1, '--c': COLOR[row.names[0]] }}>
                  <span>
                    <strong>{row.names.join(' и ')}</strong>
                    <em>
                      {SHIFT_KIND[row.kind].label} · {SHIFT_KIND[row.kind].hours}
                    </em>
                  </span>
                  {row.shift ? (
                    <button type="button" className={cx('chip', row.shift.status === 'live' ? 'blue' : gradeTone(row.shift.score))} onClick={() => openModal('shift', { id: row.shift.id })}>
                      {row.shift.status === 'live' ? 'идёт' : `${num1(row.shift.score)} · ${grade(row.shift.score)}`}
                    </button>
                  ) : (
                    <button type="button" className="chip" onClick={() => toast({ title: sel > TODAY ? 'Смена ещё не началась' : 'Отчёт в архиве', text: sel > TODAY ? 'Оценка появится после пересменки' : 'В демо открываются смены с 7 по 10 ноября', icon: 'calendar' })}>
                      {sel > TODAY ? 'по графику' : 'архив'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="card" style={{ '--d': '160ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <h3>Смен в ноябре</h3>
              <span className="chip">{counts.reduce((a, p) => a + p.planned, 0)}</span>
            </header>
            <ul className="upcoming">
              {counts.map((p, k) => (
                <li key={p.id} className="rv" style={{ '--i': k + 1 }}>
                  <button type="button" onClick={() => openModal('staff', { name: p.name })}>
                    <Avatar name={p.name} size={40} />
                    <span className="up-text">
                      <strong>{p.name}</strong>
                      <em>{p.kind === 'day' ? 'дневные смены' : 'ночные смены'}</em>
                    </span>
                    <span className="up-amt">{p.planned}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card" style={{ '--d': '230ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <h3>Как это работает</h3>
              <Icon name="camera" size={18} />
            </header>
            <p className="rp-text rv" style={{ '--i': 1 }}>
              Камера над ресепшеном узнаёт только администраторов, чьи фото загружены. Лица гостей не распознаются и не сохраняются.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
