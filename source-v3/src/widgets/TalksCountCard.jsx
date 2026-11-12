import { useState } from 'react';
import Icon from '../components/Icon';
import { CountUp } from '../components/ui';
import { lastShift, liveShift } from '../data/shifts';

const ITEMS = [
  { label: 'Разговоров в эту смену', value: liveShift.talks, note: `${liveShift.bad} проблемных` },
  { label: 'Разговоров в прошлую смену', value: lastShift.talks, note: `${lastShift.bad} проблемных` },
  { label: 'Разговоров за сутки', value: liveShift.talks + lastShift.talks + 9, note: '6 проблемных' },
];

/** Сколько разговоров записано: стрелки переключают эту смену / прошлую / сутки. */
export default function TalksCountCard({ d }) {
  const [k, setK] = useState(0);
  const item = ITEMS[k];
  const step = (n) => setK((cur) => (cur + n + ITEMS.length) % ITEMS.length);
  const [first, ...rest] = item.label.split(' ');

  return (
    <section className="card recv lift" style={{ '--d': d }}>
      <div className="recv-top rv" style={{ '--i': 0 }}>
        <button type="button" className="circle sm" onClick={() => step(1)} aria-label="Следующий период">
          <Icon name="chevronDown" size={18} />
        </button>
        <span key={k} className="recv-label">
          {first}
          <br />
          {rest.join(' ')}
        </span>
      </div>
      <strong className="big rv" style={{ '--i': 1 }}>
        <CountUp value={item.value} />
      </strong>
      <div className="recv-foot rv" style={{ '--i': 2 }}>
        <span className="recv-delta recv-note">{item.note}</span>
        <button type="button" className="circle sm recv-prev" onClick={() => step(-1)} aria-label="Предыдущий период">
          <Icon name="chevronDown" size={18} />
        </button>
      </div>
    </section>
  );
}
