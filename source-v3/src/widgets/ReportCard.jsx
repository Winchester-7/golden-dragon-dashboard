import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { lastShift } from '../data/shifts';

/** Чёрная карточка «Отчёт за смену»: × скрывает её, документ открывает последний отчёт, ↗ ведёт ко всем отчётам. */
export default function ReportCard({ d }) {
  const { openModal, go, reportHidden, setReportHidden, toast } = useApp();

  if (reportHidden) {
    return (
      <button type="button" className="card report-ghost" style={{ '--d': '0ms' }} onClick={() => setReportHidden(false)}>
        <Icon name="plus" size={18} />
        Показать карточку отчёта
      </button>
    );
  }

  return (
    <section className="card report" style={{ '--d': d }}>
      <div className="report-top rv" style={{ '--i': 0 }}>
        <button
          type="button"
          className="circle report-x"
          onClick={() => {
            setReportHidden(true);
            toast({ title: 'Карточка скрыта', text: 'Вернуть её можно нажатием на пустое место', icon: 'eye' });
          }}
          aria-label="Скрыть карточку отчёта"
        >
          <Icon name="x" size={18} />
        </button>
        <span className="report-pair">
          <button type="button" className="circle white" onClick={() => openModal('shift', { id: lastShift.id })} aria-label="Открыть последний отчёт" data-tip="Последний отчёт">
            <Icon name="doc" size={18} />
          </button>
          <button type="button" className="circle white go" onClick={() => go('reports')} aria-label="Все отчёты">
            <Icon name="arrowUpRight" size={18} />
          </button>
        </span>
      </div>
      <div className="report-bottom rv" style={{ '--i': 1 }}>
        <span className="report-chip">Каждые 12 часов: в 08:00 и 20:00</span>
        <h3>Отчёт за смену</h3>
      </div>
    </section>
  );
}
