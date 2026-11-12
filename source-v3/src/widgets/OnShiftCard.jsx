import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { SHIFT_KIND, liveShift, shiftNames } from '../data/shifts';

/** Чёрная карточка: кто сейчас на смене (по камере ресепшена). */
export default function OnShiftCard({ d }) {
  const { go } = useApp();
  const s = liveShift;
  return (
    <section className="card klass" style={{ '--d': d }}>
      <span className="klass-glow" aria-hidden="true" />
      <span className="klass-glow klass-glow--2" aria-hidden="true" />
      <h3 className="rv" style={{ '--i': 0 }}>
        Сейчас на смене
        <br />
        <b>{shiftNames(s)}</b>
      </h3>
      <div className="klass-foot rv" style={{ '--i': 1 }}>
        <span className="klass-deal">
          <span className="chip green">{s.staff[0].seen}</span>
          {SHIFT_KIND[s.kind].label.toLowerCase()} · {SHIFT_KIND[s.kind].hours}
        </span>
        <span className="klass-cta">
          <button type="button" className="btn blue shine" onClick={() => go('shifts')}>
            Открыть смену
          </button>
          <button type="button" className="circle blue go" onClick={() => go('shifts')} aria-label="Открыть смены">
            <Icon name="arrowUpRight" size={19} />
          </button>
        </span>
      </div>
    </section>
  );
}
