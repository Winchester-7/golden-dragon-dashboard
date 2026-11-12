import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { Dropdown, PageHead } from '../components/ui';
import { SHIFT_KIND, SHIFTS, shiftNames } from '../data/shifts';
import { downloadCsv } from '../lib/format';
import AdminScores from '../widgets/AdminScores';
import OnShiftCard from '../widgets/OnShiftCard';
import ReportCard from '../widgets/ReportCard';
import ShiftGauge from '../widgets/ShiftGauge';
import ShiftMatrix from '../widgets/ShiftMatrix';
import TalksCountCard from '../widgets/TalksCountCard';

const VIEWS = [
  { value: 'default', label: 'Обычный вид' },
  { value: 'compact', label: 'Компактный вид' },
  { value: 'focus', label: 'Фокус' },
];

/** Сводка ресепшена: главный экран. */
export default function Dashboard() {
  const { prefs, updatePrefs, toast } = useApp();

  const exportCsv = () => {
    downloadCsv('smeny-golden-dragon.csv', [['Дата', 'Смена', 'Кто работал', 'Разговоров', 'Проблемных', 'Оценка ИИ'], ...SHIFTS.map((s) => [s.date, SHIFT_KIND[s.kind].label, shiftNames(s), s.talks, s.bad, s.score])]);
    toast({ title: 'Сводка выгружена', text: 'Файл smeny-golden-dragon.csv', icon: 'download' });
  };

  return (
    <>
      <PageHead title="Сводка ресепшена" crumbs={['Golden Dragon', 'Все смены']}>
        <Dropdown split value={prefs.density} options={VIEWS} onChange={(density) => updatePrefs({ density })} label="Сменить вид" />
        <div className="drop drop--split">
          <button type="button" className="btn sm outline" onClick={exportCsv}>
            Выгрузить
          </button>
          <button type="button" className="circle" onClick={exportCsv} aria-label="Выгрузить в файл">
            <Icon name="share" size={18} />
          </button>
        </div>
      </PageHead>

      <div className="dash">
        <div className="dash-row dash-row--top">
          <ShiftMatrix d="0ms" />
          <div className="dash-stack">
            <OnShiftCard d="90ms" />
            <div className="dash-pair">
              <TalksCountCard d="180ms" />
              <ReportCard d="270ms" />
            </div>
          </div>
        </div>
        <div className="dash-row dash-row--bottom">
          <AdminScores d="360ms" />
          <ShiftGauge d="450ms" />
        </div>
      </div>
    </>
  );
}
