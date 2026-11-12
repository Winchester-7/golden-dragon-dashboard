import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { CountUp, Empty, PageHead, Segmented } from '../components/ui';
import { SHIFT_KIND, SHIFTS, grade, gradeTone, shiftNames } from '../data/shifts';
import { cx, downloadCsv, num1 } from '../lib/format';

const KINDS = [
  { value: 'all', label: 'Все смены' },
  { value: 'day', label: 'Дневные' },
  { value: 'night', label: 'Ночные' },
];

/** Отчёты за смену: ИИ готовит отчёт при каждой пересменке, в 08:00 и в 20:00. */
export default function Reports() {
  const { openModal, toast } = useApp();
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');

  const done = SHIFTS.filter((s) => s.status === 'done');
  const talks = done.reduce((a, s) => a + s.talks, 0);
  const bad = done.reduce((a, s) => a + s.bad, 0);
  const avg = done.reduce((a, s) => a + s.score, 0) / done.length;

  const q = query.trim().toLowerCase();
  const rows = SHIFTS.filter((s) => (kind === 'all' || s.kind === kind) && (!q || `${shiftNames(s)} ${s.summary} ${s.date}`.toLowerCase().includes(q)));
  const groups = rows.reduce((map, s) => map.set(s.date, [...(map.get(s.date) ?? []), s]), new Map());
  const order = Object.fromEntries(rows.map((s, k) => [s.id, Math.min(k, 9) + 1]));

  const exportCsv = () => {
    downloadCsv('otchety-za-smeny.csv', [['Дата', 'Смена', 'Кто работал', 'Разговоров', 'Проблемных', 'Оценка ИИ', 'Вывод'], ...SHIFTS.map((s) => [s.date, SHIFT_KIND[s.kind].label, shiftNames(s), s.talks, s.bad, s.score, s.summary])]);
    toast({ title: 'Отчёты выгружены', text: 'otchety-za-smeny.csv', icon: 'download' });
  };

  return (
    <>
      <PageHead title="Отчёты за смену" crumbs={['Главное', 'Отчёты за смену']}>
        <button type="button" className="btn sm outline" onClick={exportCsv}>
          <Icon name="download" size={16} /> Выгрузить
        </button>
        <button type="button" className="btn sm solid" onClick={() => openModal('shift', { id: done[0].id })}>
          <Icon name="printer" size={16} /> Последний отчёт
        </button>
      </PageHead>

      <div className="page">
        <section className="card stmt-sum" style={{ '--d': '0ms' }}>
          <div className="stmt-acct rv" style={{ '--i': 0 }}>
            <span className="stmt-card">
              <Icon name="clock" size={22} />
            </span>
            <span>
              <strong>Отчёт каждые 12 часов</strong>
              <em>В 08:00 и в 20:00, когда администраторы сменяют друг друга</em>
            </span>
          </div>
          <dl className="stmt-figs">
            <div className="rv" style={{ '--i': 1 }}>
              <dt>Смен за 4 дня</dt>
              <dd>{done.length}</dd>
            </div>
            <div className="rv" style={{ '--i': 2 }}>
              <dt>Разговоров</dt>
              <dd className="up">{talks}</dd>
            </div>
            <div className="rv" style={{ '--i': 3 }}>
              <dt>Проблемных</dt>
              <dd className="down">{bad}</dd>
            </div>
            <div className="stmt-close rv" style={{ '--i': 4 }}>
              <dt>Средняя оценка ИИ</dt>
              <dd>
                <CountUp value={avg} format={num1} />
              </dd>
            </div>
          </dl>
          <div className="stmt-flow rv" style={{ '--i': 5 }} aria-hidden="true">
            <i className="in" style={{ '--w': `${((talks - bad) / talks) * 100}%` }} />
            <i className="out" />
          </div>
        </section>

        <section className="card" style={{ '--d': '90ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <Segmented size="sm" label="Вид смены" items={KINDS} value={kind} onChange={setKind} />
            <label className="search search--sm">
              <Icon name="search" size={16} />
              <input className="input" type="search" placeholder="Поиск по имени или тексту…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Поиск по отчётам" />
            </label>
          </header>

          <div className="stmt-days" key={`${kind}/${q}`}>
            {[...groups].map(([date, list]) => (
              <section key={date} className="stmt-day">
                <h4 className="rv" style={{ '--i': order[list[0].id] }}>
                  {date}
                  <span>{list[0].wd}</span>
                </h4>
                <ul className="tx-list">
                  {list.map((s) => (
                    <li key={s.id} className="tx tx--click rv" style={{ '--i': order[s.id] + 1 }} onClick={() => openModal('shift', { id: s.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openModal('shift', { id: s.id })}>
                      <span className={cx('tx-icon', s.kind === 'day' && 'in')}>
                        <Icon name={SHIFT_KIND[s.kind].icon} size={18} />
                      </span>
                      <span className="tx-main">
                        <strong>
                          {SHIFT_KIND[s.kind].label} · {shiftNames(s)}
                        </strong>
                        <span>{s.summary}</span>
                      </span>
                      <span className="tx-date">{s.status === 'live' ? `будет в ${s.report}` : `отчёт в ${s.report}`}</span>
                      <span className="tx-end">
                        <strong className="tx-amt">{num1(s.score)}</strong>
                        <span className={cx('chip', s.status === 'live' ? 'blue' : gradeTone(s.score))}>{s.status === 'live' ? 'идёт' : grade(s.score)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {rows.length === 0 && <Empty title="Ничего не найдено" text="Измените фильтр или строку поиска." />}
        </section>
      </div>
      <p className="stmt-foot muted">Отчёты также приходят руководителю в Telegram · Golden Dragon</p>
    </>
  );
}
