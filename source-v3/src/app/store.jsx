/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { NOTIFICATIONS, USER } from '../data/nav';
import { uid } from '../lib/format';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const PAGE_IDS = ['dashboard', 'shifts', 'camera', 'talks', 'analytics', 'calendar', 'reports', 'settings', 'channel'];

/* "#/channel/mail" → { view: 'channel', param: 'mail' } */
const readHash = () => {
  const [view, param = ''] = window.location.hash.replace(/^#\/?/, '').split('/');
  return PAGE_IDS.includes(view) ? { view, param } : { view: 'dashboard', param: '' };
};

const PREFS_KEY = 'gd3:prefs';
const loadPrefs = () => {
  try {
    return { density: 'default', reduced: false, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') };
  } catch {
    return { density: 'default', reduced: false };
  }
};

const patch = (list, id, p) => list.map((x) => (x.id === id ? { ...x, ...p } : x));

export function AppProvider({ children }) {
  /* ---------- Маршруты (через #, чтобы на страницу можно было дать ссылку) ---------- */
  const [route, setRoute] = useState(readHash);
  const go = useCallback((view, param = '') => {
    setRoute({ view, param });
    const hash = `#/${view}${param ? `/${param}` : ''}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(readHash());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ---------- Заставка: при первой загрузке анимация появления длиннее ---------- */
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 3200);
    return () => clearTimeout(t);
  }, []);

  /* ---------- Настройки вида ---------- */
  const [prefs, setPrefs] = useState(loadPrefs);
  const updatePrefs = useCallback((p) => setPrefs((cur) => ({ ...cur, ...p })), []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.density = prefs.density;
    root.dataset.motion = prefs.reduced ? 'reduced' : 'full';
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* хранилище недоступно: настройки просто не сохранятся */
    }
  }, [prefs]);

  /* ---------- Окна и всплывающие сообщения ---------- */
  const [modal, setModal] = useState({ id: 0, type: null, open: false, props: {} });
  const openModal = useCallback((type, props = {}) => setModal((m) => ({ id: m.id + 1, type, open: true, props })), []);
  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 320);
  }, []);
  const toast = useCallback(
    (t) => {
      const id = uid();
      setToasts((list) => [...list.slice(-2), { id, icon: 'check', ...(typeof t === 'string' ? { title: t } : t) }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const markRead = useCallback((id) => setNotifications((list) => patch(list, id, { unread: false })), []);
  const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, unread: false }))), []);

  const [reportHidden, setReportHidden] = useState(false);
  /* какая запись сейчас играет (одна на всё приложение) */
  const [playing, setPlaying] = useState(null);

  const value = useMemo(
    () => ({
      view: route.view, param: route.param, go, booting,
      prefs, updatePrefs,
      modal, openModal, closeModal,
      toasts, toast, dismiss,
      user: USER,
      notifications, markRead, markAllRead,
      reportHidden, setReportHidden,
      playing, setPlaying,
    }),
    [route, go, booting, prefs, updatePrefs, modal, openModal, closeModal, toasts, toast, dismiss, notifications, markRead, markAllRead, reportHidden, playing],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
