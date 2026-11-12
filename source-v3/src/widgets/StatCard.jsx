import Icon from '../components/Icon';
import { Sparkline } from '../components/Charts';
import { CountUp } from '../components/ui';
import { cx, pct } from '../lib/format';

/**
 * KPI tile: icon, label, counting value, delta chip and an optional sparkline.
 * `invert` = a rise is bad (expenses). `tone` = 'dark' | 'blue' for the accent tiles.
 */
export default function StatCard({ d, icon, label, value, format, delta, spark, color = 'var(--blue)', tone, invert = false, note }) {
  const good = invert ? delta <= 0 : delta >= 0;
  return (
    <section className={cx('card stat lift', tone && `stat--${tone}`)} style={{ '--d': d }}>
      <div className="stat-top rv" style={{ '--i': 0 }}>
        <span className="stat-icon">
          <Icon name={icon} size={19} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-mid rv" style={{ '--i': 1 }}>
        <strong className="stat-value">
          <CountUp value={value} format={format} />
        </strong>
        {delta !== undefined && (
          <span className={cx('chip', good ? 'green' : 'red')}>
            <Icon name={delta >= 0 ? 'arrowUpRight' : 'arrowDownLeft'} size={12} stroke={2.2} />
            {pct(Math.abs(delta))}
          </span>
        )}
      </div>
      {note && (
        <p className="stat-note rv" style={{ '--i': 2 }}>
          {note}
        </p>
      )}
      {spark && (
        <div className="stat-spark rv" style={{ '--i': 2 }}>
          <Sparkline values={spark} color={tone ? '#fff' : color} />
        </div>
      )}
    </section>
  );
}
