import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './app/store';
import { Toasts } from './components/ui';
import Brand from './layout/Brand';
import TopBar from './layout/TopBar';
import Sidebar from './layout/Sidebar';
import ModalHost from './modals/ModalHost';
import { PAGES } from './pages';
import { cx } from './lib/format';
import './styles/dashboard.css';
import './styles/pages.css';
import './styles/gd.css';

/** One page. Marks itself "settled" once its entrance has played, so later additions animate in quickly. */
function Main({ view, param, booting }) {
  const [settled, setSettled] = useState(!booting);
  useEffect(() => {
    if (!booting) return;
    const t = setTimeout(() => setSettled(true), 3000);
    return () => clearTimeout(t);
  }, [booting]);
  const Page = PAGES[view] ?? PAGES.dashboard;
  return (
    <main className={cx('main', settled && 'settled', booting && 'boot')} data-view={view} style={{ '--base': booting ? '560ms' : '0ms' }}>
      <Page param={param} />
    </main>
  );
}

function Shell() {
  const { view, param, booting } = useApp();
  const [drawer, setDrawer] = useState(false);
  return (
    <div className={cx('shell', drawer && 'drawer-open')}>
      <Brand />
      <TopBar onMenu={() => setDrawer(true)} />
      <Sidebar onNavigate={() => setDrawer(false)} />
      {drawer && <div className="drawer-scrim" onClick={() => setDrawer(false)} />}
      <Main key={`${view}/${param}`} view={view} param={param} booting={booting} />
      <ModalHost />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
