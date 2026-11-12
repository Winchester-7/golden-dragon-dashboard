import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { SHIFT_KIND, liveShift, shiftNames } from '../data/shifts';

/** Синяя карточка внизу меню: кто сейчас на смене. */
export default function OnShiftMini() {
  const { go } = useApp();
  const s = liveShift;
  return (
    <section className="unlock">
      <div className="unlock-art" aria-hidden="true">
        <span className="ua-card ua-card--bars">
          <i style={{ '--h': '45%' }} />
          <i style={{ '--h': '80%' }} />
          <i style={{ '--h': '60%' }} />
          <i style={{ '--h': '95%' }} />
        </span>
        <span className="ua-card ua-card--line">
          <svg viewBox="0 0 60 30">
            <path d="M3 24 17 15l11 6 13-13 16 5" pathLength="1" />
          </svg>
        </span>
        <span className="ua-coin">★</span>
        <span className="ua-spark" />
        <span className="ua-spark ua-spark--2" />
      </div>
      <span className="unlock-key">
        <Icon name="camera" size={17} stroke={2} />
      </span>
      <h3>
        На смене:
        <br />
        {shiftNames(s)}
      </h3>
      <p>
        {SHIFT_KIND[s.kind].short} · до {SHIFT_KIND[s.kind].to}
      </p>
      <div className="unlock-cta">
        <button type="button" className="unlock-pill" onClick={() => go('shifts')}>
          Открыть смену
        </button>
        <button type="button" className="circle sm white go" onClick={() => go('shifts')} aria-label="Открыть смены">
          <Icon name="arrowUpRight" size={17} />
        </button>
      </div>
    </section>
  );
}
