import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { CountUp, Dropdown } from '../components/ui';
import { STAFF } from '../data/shifts';
import { cx, num1 } from '../lib/format';

const STYLE = { Айгерим: 'blue', Бакыт: 'navy', Нургуль: 'solid', Жибек: 'light' };
const COLOR = { Айгерим: 'var(--blue)', Бакыт: 'var(--navy)', Нургуль: 'var(--solid)', Жибек: 'var(--blue-soft)' };
const ORDER = ['Бакыт', 'Айгерим', 'Нургуль', 'Жибек'];

const DATA = {
  week: { label: 'Неделя', chip: '7 дней', total: 7.6, delta: 0.3, period: 'прошлой недели', scores: { Нургуль: 8.7, Бакыт: 7.7, Айгерим: 6.9, Жибек: 7.2 } },
  month: { label: 'Месяц', chip: '30 дней', total: 7.5, delta: 0.2, period: 'прошлого месяца', scores: Object.fromEntries(STAFF.map((s) => [s.name, s.score])) },
};
const RANGES = Object.entries(DATA).map(([value, r]) => ({ value, label: `За ${r.label.toLowerCase().replace('я', 'ю')}` }));

/** Столбики: оценка ИИ по каждому администратору. Нажатие открывает разбор его работы. */
export default function AdminScores({ d }) {
  const { go, openModal } = useApp();
  const [range, setRange] = useState('week');
  const data = DATA[range];
  const bars = ORDER.map((name) => ({ name, value: data.scores[name], up: data.scores[name] >= STAFF.find((s) => s.name === name).prev }));
  const top = bars.reduce((a, b) => (b.value > a.value ? b : a));

  return (
    <section className="card income lift" style={{ '--d': d }}>
      <header className="card-head rv" style={{ '--i': 0 }}>
        <h3>Оценка ИИ по администраторам</h3>
        <div className="card-actions">
          <Dropdown value={range} options={RANGES} onChange={setRange} label="Период" />
          <button type="button" className="btn sm outline" onClick={() => go('shifts')}>
            Все смены
          </button>
        </div>
      </header>

      <div className="income-body">
        <div className="income-left">
          <span className="chip solid rv" style={{ '--i': 1 }}>
            {data.chip}
          </span>
          <strong className="big rv" style={{ '--i': 2 }}>
            <CountUp key={range} value={data.total} format={num1} />
          </strong>
          <p className="income-note rv" style={{ '--i': 3 }}>
            Средняя оценка
            <br />
            работы ресепшена
          </p>
          <ul className="income-legend rv" style={{ '--i': 4 }}>
            {ORDER.map((name) => (
              <li key={name}>
                <i className="dot" style={{ '--c': COLOR[name] }} />
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="income-chart">
          <div className="income-delta rv" style={{ '--i': 2 }}>
            <strong>
              +<CountUp key={range} value={data.delta} format={num1} />
            </strong>
            <span>лучше {data.period}</span>
          </div>
          <div key={range} className="income-bars">
            {bars.map((b, k) => (
              <div key={b.name} className="ibar-slot">
                <button
                  type="button"
                  className={cx('ibar', `is-${STYLE[b.name]}`, b === top && 'is-top')}
                  style={{ '--h': `${((b.value - 5.5) / (top.value - 5.5)) * 100}%`, '--k': k }}
                  aria-label={`${b.name}: оценка ${num1(b.value)}`}
                  data-tip={b.name}
                  onClick={() => openModal('staff', { name: b.name })}
                >
                  {b === top && <i className="ibar-pin" aria-hidden="true" />}
                  <span className="ibar-tag">
                    <Icon name={b.up ? 'arrowUpRight' : 'arrowDownLeft'} size={12} stroke={2.2} />
                    {num1(b.value)}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
