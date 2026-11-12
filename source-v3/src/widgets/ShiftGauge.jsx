import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { CountUp } from '../components/ui';
import { grade, lastShift, shiftNames } from '../data/shifts';
import { cx, num1 } from '../lib/format';

const TICKS = 26;
const FROM = [47, 107, 255];
const TO = [185, 205, 255];
const shade = (t) => `rgb(${FROM.map((c, i) => Math.round(c + (TO[i] - c) * t)).join(' ')})`;

/* средняя по критерию среди тех, кто работал в смену */
const crit = (k) => lastShift.staff.reduce((a, p) => a + p.crit[k], 0) / lastShift.staff.length;

const MODES = [
  { id: 'total', label: 'Оценка', color: 'var(--blue-soft)', value: lastShift.score, note: grade(lastShift.score).toLowerCase() },
  { id: 'polite', label: 'Вежливость', color: 'var(--blue)', value: crit(1), note: 'вежливость' },
  { id: 'solve', label: 'Решение', color: 'var(--soft-2)', value: crit(2), note: 'решение вопроса' },
];

/** Полукруг из делений: оценка последней закрытой смены. */
export default function ShiftGauge({ d }) {
  const { openModal } = useApp();
  const [mode, setMode] = useState('total');
  const m = MODES.find((x) => x.id === mode);
  const lit = Math.round((m.value / 10) * TICKS);

  return (
    <section className="card balance lift" style={{ '--d': d }}>
      <header className="card-head rv" style={{ '--i': 0 }}>
        <h3>Прошлая смена</h3>
        <button type="button" className="circle go" onClick={() => openModal('shift', { id: lastShift.id })} aria-label="Открыть отчёт смены">
          <Icon name="arrowUpRight" size={19} />
        </button>
      </header>

      <div className="balance-legend rv" style={{ '--i': 1 }} role="tablist" aria-label="Что показывает шкала">
        {MODES.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={mode === x.id} className={cx(mode === x.id && 'on', x.id === 'solve' && 'right')} onClick={() => setMode(x.id)}>
            <i className="dot" style={{ '--c': x.color }} />
            {x.label}
          </button>
        ))}
      </div>

      <div className="gauge rv" style={{ '--i': 2 }}>
        <svg key={mode} viewBox="0 0 220 120" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, k) => {
            const a = Math.PI - (k / (TICKS - 1)) * Math.PI;
            const x = 110 + Math.cos(a) * 88;
            const y = 108 - Math.sin(a) * 88;
            const on = k < lit;
            const deg = 90 - (a * 180) / Math.PI;
            return (
              <g key={k} transform={`rotate(${deg} ${x} ${y})`}>
                <rect className={cx('tick', on && 'on')} x={x - 5} y={y - 15} width="10" height="30" rx="5" style={{ '--k': k, fill: on ? shade(k / Math.max(lit - 1, 1)) : undefined }} />
              </g>
            );
          })}
        </svg>
        <div className="gauge-center">
          <strong>
            <CountUp key={mode} value={m.value} format={num1} />
          </strong>
          <span>{m.note}</span>
        </div>
      </div>

      <p className="balance-foot rv" style={{ '--i': 3 }}>
        {shiftNames(lastShift)}, день {lastShift.date}
        <span className="chip blue">{lastShift.talks} разг.</span>
      </p>
    </section>
  );
}
