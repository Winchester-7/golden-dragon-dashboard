import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import { CHANNEL_LINKS, HOME_LINKS, TABS } from '../data/nav';
import { cx } from '../lib/format';
import OnShiftMini from '../widgets/OnShiftMini';

const TAB_IDS = TABS.map((t) => t.id);

/** Заголовок, главное меню (Обзор раскрывает список вкладок), каналы и карточка «кто на смене». */
export default function Sidebar({ onNavigate }) {
  const { view, param, go } = useApp();
  const [open, setOpen] = useState(false);
  const hello = 'Контроль ресепшена'.split(' ');
  const overviewOn = TAB_IDS.includes(view);

  const nav = (id, p) => {
    go(id, p);
    onNavigate?.();
  };

  let k = 0;

  return (
    <aside className="side" aria-label="Меню">
      <div className="side-hello">
        <h2 aria-label={hello.join(' ')}>
          {hello.map((w, i) => (
            <span key={`${w}${i}`} className="word" style={{ '--i': i }} aria-hidden="true">
              {w}
              {i < hello.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>
        <p className="side-sub-text">Вторник, 10 ноября · 20:40</p>
      </div>

      <p className="side-label" style={{ '--k': k++ }}>
        ГЛАВНОЕ
      </p>
      <nav className="side-nav">
        <div className={cx('side-item side-overview', overviewOn && 'on')} style={{ '--k': k++ }}>
          <button type="button" className="side-overview__main" onClick={() => nav('dashboard')}>
            <Icon name="box" size={19} />
            Обзор
          </button>
          <button type="button" className={cx('side-overview__chev', open && 'is-open')} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Показать разделы обзора">
            <Icon name="chevronDown" size={18} />
          </button>
        </div>
        {open && (
          <ul className="side-tree">
            {TABS.map((t, j) => (
              <li key={t.id} style={{ '--j': j }}>
                <button type="button" className={cx(view === t.id && 'on')} onClick={() => nav(t.id)}>
                  <i />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {HOME_LINKS.map((l) => (
          <button key={l.id} type="button" className={cx('side-item', view === l.id && 'on')} style={{ '--k': k++ }} onClick={() => nav(l.id)}>
            <Icon name={l.icon} size={19} />
            {l.label}
          </button>
        ))}
      </nav>

      <p className="side-label" style={{ '--k': k++ }}>
        КАНАЛЫ
      </p>
      <nav className="side-nav">
        {CHANNEL_LINKS.map((c) => (
          <button key={c.id} type="button" className={cx('side-item', view === 'channel' && param === c.id && 'on')} style={{ '--k': k++ }} onClick={() => nav('channel', c.id)}>
            <Icon name={c.icon} size={19} />
            {c.label}
          </button>
        ))}
      </nav>

      <OnShiftMini />
    </aside>
  );
}
