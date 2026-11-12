import { useEffect, useState } from 'react';
import { useApp } from '../app/store';
import { mmss, secs } from '../data/hotel';
import { cx } from '../lib/format';
import Icon from './Icon';

/** Плеер записи разговора. В демо звука нет: показана только работа кнопок и перемотки. */
export default function Player({ id, dur, compact = false }) {
  const { playing, setPlaying } = useApp();
  const total = secs(dur);
  const [pos, setPos] = useState(0);
  const on = playing === id;

  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => {
      setPos((p) => {
        if (p + 1.5 >= total) {
          setPlaying(null);
          return 0;
        }
        return p + 1.5;
      });
    }, 250);
    return () => clearInterval(t);
  }, [on, total, setPlaying]);

  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(Math.min(total, Math.max(0, ((e.clientX - r.left) / r.width) * total)));
  };

  return (
    <div className={cx('player', compact && 'player--sm', on && 'is-on')} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="player-btn" onClick={() => setPlaying(on ? null : id)} aria-label={on ? 'Пауза' : 'Слушать запись'}>
        <Icon name={on ? 'pause' : 'play'} size={compact ? 14 : 17} stroke={2.2} />
      </button>
      <div className="player-track" onClick={seek} role="slider" aria-label="Перемотка" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.round(pos)} tabIndex={0}>
        <i style={{ width: `${(pos / total) * 100}%` }} />
      </div>
      <span className="player-time">
        {mmss(pos)} / {dur}
      </span>
    </div>
  );
}
