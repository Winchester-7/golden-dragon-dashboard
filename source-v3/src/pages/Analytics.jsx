import { useState } from 'react';
import { useApp } from '../app/store';
import { AreaChart, Donut } from '../components/Charts';
import Icon from '../components/Icon';
import { PageHead, Segmented } from '../components/ui';
import { CRITERIA, TOPICS } from '../data/hotel';
import { WEEKS } from '../data/shifts';
import { cx, num1 } from '../lib/format';
import StatCard from '../widgets/StatCard';

const RANGES = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
];
const LINES = [
  { id: 'day', label: 'Дневная смена', color: 'var(--blue)' },
  { id: 'night', label: 'Ночная смена', color: 'var(--solid)' },
];
const TOPIC_COLORS = ['var(--navy)', 'var(--blue)', 'var(--blue-soft)', 'var(--solid)', '#9db4e8', '#d5d9e4'];
const ITEMS = TOPICS.map((t, k) => ({ name: t.label, value: t.value, color: TOPIC_COLORS[k] }));

/* две недели подряд; у идущей смены оценки ещё нет, берём предварительную */
const ALL = {
  labels: [...WEEKS.prev.dates, ...WEEKS.this.dates].map((d, k) => `${d} ${k < 4 ? 'окт' : 'ноя'}`),
  day: [...WEEKS.prev.day, ...WEEKS.this.day],
  night: [...WEEKS.prev.night, ...WEEKS.this.night].map((v) => v ?? 9),
};
const mean = (list) => list.reduce((a, b) => a + b, 0) / list.length;
const change = (vals) => ((vals.at(-1) - vals[0]) / vals[0]) * 100;

/** Аналитика: как меняется качество по сменам, о чём спрашивают гости, сильные и слабые стороны. */
export default function Analytics() {
  const { go } = useApp();
  const [days, setDays] = useState(14);
  const [lines, setLines] = useState(() => new Set(LINES.map((l) => l.id)));
  const [active, setActive] = useState(null);

  const labels = ALL.labels.slice(-days);
  const values = { day: ALL.day.slice(-days), night: ALL.night.slice(-days) };
  const series = LINES.filter((l) => lines.has(l.id)).map((l) => ({ ...l, values: values[l.id] }));
  const total = ITEMS.reduce((a, s) => a + s.value, 0);
  const talks = [44, 47, 52, 41, 47, 50, 42, 49, 51, 58, 55, 52, 61, 57].slice(-days);
  const bad = [7, 6, 9, 5, 6, 7, 4, 6, 8, 5, 3, 6, 5, 6].slice(-days);

  const toggleLine = (id) =>
    setLines((s) => {
      if (s.has(id) && s.size === 1) return s;
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <PageHead title="Аналитика" crumbs={['Обзор', 'Аналитика']}>
        <Segmented size="sm" label="Период" items={RANGES} value={days} onChange={setDays} />
      </PageHead>

      <div className="page">
        <div className="stats">
          <StatCard d="0ms" icon="sun" label="Дневные смены" value={mean(values.day)} format={num1} delta={change(values.day)} spark={values.day} />
          <StatCard d="70ms" icon="moon" label="Ночные смены" value={mean(values.night)} format={num1} delta={change(values.night)} spark={values.night} color="var(--solid)" />
          <StatCard d="140ms" icon="phone" label="Разговоров" value={talks.reduce((a, b) => a + b, 0)} delta={change(talks)} spark={talks} color="var(--navy)" />
          <StatCard d="210ms" icon="alert" label="Проблемных" value={bad.reduce((a, b) => a + b, 0)} delta={change(bad)} invert tone="dark" spark={bad} />
        </div>

        <div className="split split--2-1">
          <section className="card lift chart-card" style={{ '--d': '280ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <div>
                <h3>Оценка ИИ по сменам</h3>
                <p>День и ночь · последние {days} дней</p>
              </div>
              <div className="toggles">
                {LINES.map((l) => (
                  <button key={l.id} type="button" className={cx('toggle-pill', lines.has(l.id) && 'on')} aria-pressed={lines.has(l.id)} onClick={() => toggleLine(l.id)}>
                    <i className="dot" style={{ '--c': l.color }} />
                    {l.label}
                  </button>
                ))}
              </div>
            </header>
            <div className="rv chart-fill" style={{ '--i': 1 }}>
              <AreaChart key={days} labels={labels} series={series} height={270} format={num1} max={10} />
            </div>
          </section>

          <section className="card lift" style={{ '--d': '350ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <div>
                <h3>О чём спрашивают</h3>
                <p>Темы разговоров за сутки</p>
              </div>
              <button type="button" className="circle sm go" onClick={() => go('talks')} aria-label="Открыть разговоры">
                <Icon name="arrowUpRight" size={17} />
              </button>
            </header>
            <div className="spend">
              <div className="rv" style={{ '--i': 1 }}>
                <Donut items={ITEMS} active={active} onActive={setActive} label="Разговоров" size={186} format={(v) => String(v)} />
              </div>
              <ul className="spend-list">
                {ITEMS.map((s, k) => (
                  <li key={s.name} className={cx('rv', active === s.name && 'on')} style={{ '--i': k + 2 }} onPointerEnter={() => setActive(s.name)} onPointerLeave={() => setActive(null)}>
                    <i className="dot" style={{ '--c': s.color }} />
                    <span>{s.name}</span>
                    <b>{s.value}</b>
                    <em>{Math.round((s.value / total) * 100)}%</em>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section className="card" style={{ '--d': '420ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <div>
              <h3>Сильные и слабые стороны ресепшена</h3>
              <p>Средняя оценка ИИ по каждому правилу общения</p>
            </div>
          </header>
          <ul className="rp-bars crit-wide">
            {CRITERIA.map((c, k) => (
              <li key={c.label} className="rv" style={{ '--i': k + 1, '--k': k, '--c': c.value >= 8 ? 'var(--blue)' : c.value >= 6.5 ? 'var(--navy)' : 'var(--red)', '--w': `${c.value * 10}%` }}>
                <span>{c.label}</span>
                <i />
                <b>{num1(c.value)}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
