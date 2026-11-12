import Analytics from './Analytics';
import Calendar from './Calendar';
import Channel from './Channel';
import Dashboard from './Dashboard';
import Reports from './Reports';
import Settings from './Settings';
import Shifts from './Shifts';
import Talks from './Talks';

/* id страницы (см. PAGE_IDS в app/store) → компонент */
export const PAGES = {
  dashboard: Dashboard,
  shifts: Shifts,
  talks: Talks,
  analytics: Analytics,
  calendar: Calendar,
  reports: Reports,
  settings: Settings,
  channel: Channel,
};
