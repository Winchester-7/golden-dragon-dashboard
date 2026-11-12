import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { CountUp, Dropdown } from '../components/ui';
import { WEEKS, shiftById } from '../data/shifts';
import { num1 } from '../lib/format';

const RANGES = Object.entries(WEEKS).map(([value, r]) => ({ value, label: r.label }));
const LEGEND = [
  { label: 'Отлично, от 8', color: 'var(--blue)' },
  { label: 'Есть замечания', color: 'var(--solid)' },
  { label: 'Хорошо, 7–8', color: 'var(--navy)' },
  { label: 'Смена идёт', color: 'var(--blue-soft)' },
];
/* оценка смены → вид точки (классы шаблона) */
const code = (v) => (v === null ? 'mh' : v >= 8 ? 'm' : v >= 7 ? 'l' : 's');
const avg = (list) => {
  const done = list.filter((v) => v !== null);
  return done.reduce((a, b) => a + b, 0) / done.length;
};

/** Точки: оценка ИИ за каждую смену недели (день и ночь). Нажатие открывает отчёт смены. */
export default function ShiftMatrix({ d }) {
  const { go, openModal, toast } = useApp();
  const [range, setRange] = useState('this');
  const w = WEEKS[range];
  const rows = [
    { name: 'День', kind: 'd', label: 'Дневная смена', vals: w.day, who: w.dayWho },
    { name: 'Ночь', kind: 'n', label: 'Ночная смена', vals: w.night, who: w.nightWho },
    { name: 'Сутки', kind: 'd', label: 'За сутки', vals: w.day.map((v, k) => (w.night[k] === null ? null : (v + w.night[k]) / 2)), who: w.day.map(() => 'обе смены') },
  ];
  const open = (kind, k) => {
    const id = `${kind}${String(w.dates[k]).padStart(2, '0')}`;
    if (range === 'this' && shiftById(id)) openModal('shift', { id });
    else toast({ title: 'Отчёт в архиве', text: 'В демо открываются смены за последние четыре дня', icon: 'statement' });
  };

  return (
    <section className="card exp lift" style={{ '--d': d }}>
      <header className="card-head rv" style={{ '--i': 0 }}>
        <h3>Оценки смен</h3>
        <div className="card-actions">
          <Dropdown value={range} options={RANGES} onChange={setRange} label="Неделя" />
          <button type="button" className="circle go" onClick={() => go('shifts')} aria-label="Открыть смены">
            <Icon name="arrowUpRight" size={19} />
          </button>
        </div>
      </header>

      <div className="exp-top rv" style={{ '--i': 1 }}>
        <strong className="big">
          <CountUp key={range} value={avg([...w.day, ...w.night])} format={num1} />
          <small className="big-unit"> из 10</small>
        </strong>
        <ul className="exp-legend">
          {LEGEND.map((l) => (
            <li key={l.label}>
              <i className="dot" style={{ '--c': l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div key={range} className="exp-grid" role="table" aria-label="Оценки ИИ по сменам за неделю">
        {rows.map((row, r) => (
          <div key={row.name} className="exp-row" role="row">
            <span className="exp-cat" role="rowheader">
              {row.name}
            </span>
            {row.vals.map((v, k) => {
              const tip = `${w.days[k]}, ${w.dates[k]} · ${row.who[k]} · ${v === null ? 'смена идёт' : num1(v)}`;
              return <button type="button" key={k} role="cell" className={`exp-dot is-${code(v)}`} style={{ '--w': r + k }} data-tip={tip} aria-label={`${row.label}: ${tip}`} onClick={() => open(row.kind, k)} />;
            })}
          </div>
        ))}
        <div className="exp-row exp-days" aria-hidden="true">
          <span />
          {w.days.map((x, k) => (
            <span key={k}>{x}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
