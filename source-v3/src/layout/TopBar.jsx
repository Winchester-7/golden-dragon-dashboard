import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { Avatar, Menu, Popover, Segmented, Toggle } from '../components/ui';
import { TABS } from '../data/nav';
import { cx } from '../lib/format';
import { useToggle } from '../lib/hooks';

/** Pill tabs with a sliding blue indicator (like Glassy v2), then settings, notifications and the user. */
export default function TopBar({ onMenu }) {
  const { view, go, user, prefs, updatePrefs, notifications, markRead, markAllRead, toast, openModal } = useApp();
  const nav = useRef(null);
  const ind = useRef(null);
  const settings = useToggle();
  const bell = useToggle();
  const me = useToggle();
  const unread = notifications.filter((n) => n.unread).length;

  useLayoutEffect(() => {
    const place = () => {
      const btn = nav.current?.querySelector(`[data-tab="${view}"]`);
      const el = ind.current;
      if (!el) return;
      if (!btn) {
        el.style.opacity = '0';
        return;
      }
      el.style.opacity = '1';
      el.style.width = `${btn.offsetWidth}px`;
      el.style.transform = `translateX(${btn.offsetLeft}px)`;
      const n = nav.current;
      if (n.scrollWidth > n.clientWidth) n.scrollTo({ left: btn.offsetLeft - 20, behavior: 'smooth' });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav.current);
    return () => ro.disconnect();
  }, [view]);

  return (
    <header className="top">
      <button type="button" className="circle soft top-menu" onClick={onMenu} aria-label="Открыть меню">
        <Icon name="menu" size={20} />
      </button>

      <nav className="tabs" ref={nav} aria-label="Разделы">
        <span className="tabs-ind" ref={ind} aria-hidden="true" />
        {TABS.map((t, i) => (
          <button key={t.id} type="button" data-tab={t.id} className={cx(view === t.id && 'on')} style={{ '--i': i }} aria-current={view === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="tools">
        <div className="anchor">
          <button type="button" className={cx('circle soft tool', settings.open && 'is-open')} onClick={settings.toggle} aria-label="Настройки вида" style={{ '--i': 0 }}>
            <Icon name="settings" size={20} />
          </button>
          <Popover open={settings.open} onClose={settings.close} className="pop-settings">
            <h4>Вид</h4>
            <Segmented
              size="sm"
              label="Плотность"
              items={[
                { value: 'default', label: 'Обычный' },
                { value: 'compact', label: 'Компактный' },
              ]}
              value={prefs.density === 'compact' ? 'compact' : 'default'}
              onChange={(density) => updatePrefs({ density })}
            />
            <div className="pop-row">
              <span>
                <strong>Меньше анимации</strong>
                <em>Отключает анимацию появления</em>
              </span>
              <Toggle on={prefs.reduced} onChange={(reduced) => updatePrefs({ reduced })} label="Меньше анимации" />
            </div>
            <button
              type="button"
              className="btn sm soft pop-wide"
              onClick={() => {
                settings.close();
                go('settings');
              }}
            >
              <Icon name="settings" size={16} /> Все настройки
            </button>
          </Popover>
        </div>

        <div className="anchor">
          <button type="button" className={cx('circle soft tool', bell.open && 'is-open', unread > 0 && 'has-unread')} onClick={bell.toggle} aria-label={unread ? `Уведомления, непрочитанных: ${unread}` : 'Уведомления'} style={{ '--i': 1 }}>
            <Icon name="bell" size={20} />
            {unread > 0 && <span className="badge">{unread}</span>}
          </button>
          <Popover open={bell.open} onClose={bell.close} className="pop-notes">
            <div className="pop-title">
              <h4>Уведомления</h4>
              {unread > 0 && (
                <button type="button" onClick={markAllRead}>
                  Прочитать все
                </button>
              )}
            </div>
            <ul>
              {notifications.map((n, j) => (
                <li key={n.id} style={{ '--i': j }}>
                  <button
                    type="button"
                    className={cx('note', n.unread && 'unread')}
                    onClick={() => {
                      markRead(n.id);
                      bell.close();
                      if (n.modal) openModal(...n.modal);
                      else go(n.go, n.param);
                    }}
                  >
                    <span className="note-icon">
                      <Icon name={n.icon} size={17} />
                    </span>
                    <span className="note-text">
                      <strong>{n.title}</strong>
                      <span>{n.text}</span>
                    </span>
                    <em>{n.time}</em>
                  </button>
                </li>
              ))}
            </ul>
          </Popover>
        </div>

        <div className="anchor">
          <button type="button" className={cx('who', me.open && 'is-open')} onClick={me.toggle} aria-label="Меню руководителя">
            <Avatar name={user.name} size={46} />
            <span className="who-text">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </span>
          </button>
          <Popover open={me.open} onClose={me.close}>
            <Menu
              onDone={me.close}
              items={[
                { label: 'Отчёты за смену', icon: 'statement', onClick: () => go('reports') },
                { label: 'График смен', icon: 'calendar', onClick: () => go('calendar') },
                { label: 'Настройки', icon: 'settings', onClick: () => go('settings') },
                { divider: true },
                { label: 'Выйти', icon: 'logout', danger: true, onClick: () => toast({ title: 'Это демо-версия', text: 'Вход по паролю появится в рабочей программе', icon: 'logout' }) },
              ]}
            />
          </Popover>
        </div>
      </div>
    </header>
  );
}
