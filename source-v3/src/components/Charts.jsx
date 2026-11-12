import { useState } from 'react';
import { compact, cx, niceMax, smooth } from '../lib/format';
import { useSize, useSvgId } from '../lib/hooks';

const PAD = { l: 46, r: 12, t: 16, b: 30 };

/**
 * Smooth multi-series area chart. Lines draw themselves in; hovering shows a crosshair + tooltip.
 * `height` is the minimum — the chart grows to fill a taller container.
 * series: [{ id, label, values, color }]
 */
export function AreaChart({ labels, series, height: minHeight = 250, format = compact, prefix = '', max: fixedMax }) {
  const [ref, size] = useSize();
  const { width } = size;
  const height = Math.max(minHeight, size.height);
  const [hover, setHover] = useState(null);
  const gid = useSvgId();

  const n = labels.length;
  const iw = Math.max(width - PAD.l - PAD.r, 10);
  const ih = height - PAD.t - PAD.b;
  const max = fixedMax ?? niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const x = (k) => PAD.l + (n === 1 ? iw / 2 : (k / (n - 1)) * iw);
  const y = (v) => PAD.t + ih - (v / max) * ih;
  const every = Math.ceil(n / Math.max(1, Math.floor(iw / 46)));

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.round(((e.clientX - r.left - PAD.l) / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, k)));
  };

  const tipTop = hover === null ? 0 : Math.min(...series.map((s) => y(s.values[hover])));

  return (
    <div ref={ref} className="chart" style={{ minHeight }}>
      {width > 0 && (
        <svg width={width} height={height} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={series.map((s) => s.label).join(' и ')}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.id} id={`${gid}${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: s.color, stopOpacity: 0.26 }} />
                <stop offset="1" style={{ stopColor: s.color, stopOpacity: 0 }} />
              </linearGradient>
            ))}
          </defs>

          {[0, 1, 2, 3, 4].map((t) => {
            const v = (max / 4) * t;
            return (
              <g key={t} className="chart-grid">
                <line x1={PAD.l} x2={PAD.l + iw} y1={y(v)} y2={y(v)} />
                <text x={PAD.l - 10} y={y(v) + 4} textAnchor="end">
                  {t === 0 ? '0' : `${prefix}${format(v)}`}
                </text>
              </g>
            );
          })}

          {series.map((s, j) => {
            const line = smooth(s.values.map((v, k) => [x(k), y(v)]));
            const area = `${line}L${x(n - 1)} ${PAD.t + ih}L${x(0)} ${PAD.t + ih}Z`;
            return (
              <g key={s.id} style={{ '--j': j }}>
                <path className="chart-area" d={area} fill={`url(#${gid}${s.id})`} />
                <path className="chart-line" d={line} pathLength="1" style={{ stroke: s.color }} />
              </g>
            );
          })}

          {labels.map((l, k) =>
            k % every === 0 || k === n - 1 ? (
              <text key={l + k} className={cx('chart-x', hover === k && 'on')} x={x(k)} y={height - 8} textAnchor="middle">
                {l}
              </text>
            ) : null,
          )}

          {hover !== null && (
            <g className="chart-hover">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} />
              {series.map((s) => (
                <circle key={s.id} cx={x(hover)} cy={y(s.values[hover])} r="5.5" style={{ stroke: s.color }} />
              ))}
            </g>
          )}
        </svg>
      )}

      {hover !== null && (
        <div className={cx('chart-tip', x(hover) > width - 150 && 'flip')} style={{ left: x(hover), top: tipTop }}>
          <strong>{labels[hover]}</strong>
          {series.map((s) => (
            <span key={s.id}>
              <i className="dot" style={{ '--c': s.color }} />
              {s.label}
              <b>
                {prefix}
                {format(s.values[hover])}
              </b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Donut whose segments sweep in one after another. Hover a segment (or pass `active`) to focus it.
 * items: [{ name, value, color }]
 */
export function Donut({ items, size = 200, stroke = 13, active, onActive, format = compact, label = 'Всего', prefix = '' }) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const r = 50 - stroke / 2 - 2;
  const focus = items.find((i) => i.name === active);
  /* each segment starts where the previous one ended (percent of the ring) */
  const segs = items.reduce((list, it) => {
    const start = list.length ? list[list.length - 1].end : 0;
    const len = (it.value / total) * 100;
    return [...list, { ...it, start, len, end: start + len }];
  }, []);

  return (
    <div className="donut" style={{ '--size': `${size}px` }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--soft)" strokeWidth={stroke} />
        {segs.map((s, j) => (
          <circle
            key={s.name}
            className={cx('donut-seg', focus && (focus.name === s.name ? 'on' : 'dim'))}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            pathLength="100"
            strokeWidth={stroke}
            style={{ stroke: s.color, strokeDasharray: `${Math.max(s.len - 0.8, 0.1)} ${100 - s.len + 0.8}`, strokeDashoffset: -s.start, '--j': j }}
            onPointerEnter={() => onActive?.(s.name)}
            onPointerLeave={() => onActive?.(null)}
          />
        ))}
      </svg>
      <div className="donut-center">
        <span>{focus ? focus.name : label}</span>
        <strong key={focus?.name ?? 'total'}>{prefix}{format(focus ? focus.value : total)}</strong>
        {focus && <em>{Math.round((focus.value / total) * 100)}%</em>}
      </div>
    </div>
  );
}

/** Tiny trend line with a soft fill. */
export function Sparkline({ values, color = 'var(--blue)', height = 46 }) {
  const gid = useSvgId();
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((v, k) => [(k / Math.max(values.length - 1, 1)) * 100, 4 + (1 - (v - min) / span) * 30]);
  const line = smooth(pts);
  return (
    <svg className="spark" viewBox="0 0 100 36" preserveAspectRatio="none" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: color, stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path className="spark-area" d={`${line}L100 36L0 36Z`} fill={`url(#${gid})`} />
      <path className="spark-line" d={line} style={{ stroke: color }} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
