import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Icon, { Logo } from './Icon'
import { Avatar } from './ui'
import { useDismiss, useSize } from '../lib/hooks'
import { MENU, NOTIFICATIONS } from '../data/hotel'
import { useApp } from '../lib/store'

export default function Sidebar({ collapsed, canCollapse, onToggle, active, onNavigate, counts, me, onSignOut }) {
  const { openTalk } = useApp()
  const navRef = useRef(null)
  const pillRef = useRef(null)
  const footRef = useRef(null)
  const { h: navH } = useSize(navRef)
  const [pop, setPop] = useState(null)
  const [notifs, setNotifs] = useState(() => NOTIFICATIONS.map((n) => ({ ...n, unread: true })))
  const unread = notifs.filter((n) => n.unread).length
  const close = useCallback(() => setPop(null), [])
  useDismiss(footRef, close, pop !== null)

  /* the white active pill slides between items (Settings lives in the footer, so it has no pill) */
  useLayoutEffect(() => {
    const item = navRef.current?.querySelector(`[data-nav="${active}"]`)
    const pill = pillRef.current
    if (!pill) return
    if (!item) {
      pill.style.opacity = '0'
      return
    }
    pill.style.opacity = '1'
    pill.style.transform = `translateY(${item.offsetTop}px)`
    pill.style.height = `${item.offsetHeight}px`
  }, [active, collapsed, navH])

  const toggle = (id) => setPop((p) => (p === id ? null : id))
  const go = (id, params) => {
    setPop(null)
    onNavigate(id, params)
  }

  return (
    <aside className="side" aria-label="Разделы">
      {canCollapse && (
        <button className="side-toggle" onClick={onToggle} aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}>
          <Icon name="chevronLeft" />
        </button>
      )}

      <button className="brand" onClick={() => go('dashboard')} data-tip="Golden Dragon">
        <Logo className="brand-mark" />
        <span className="brand-text fade-label">
          <strong>Golden Dragon</strong>
          <span>ИИ-контроль ресепшена</span>
        </span>
      </button>

      <nav className="nav" ref={navRef}>
        <span className="nav-pill" ref={pillRef} aria-hidden="true" />
        {MENU.map((group, g) => (
          <div className="nav-group" key={group.group}>
            <p className="nav-caption" style={{ '--i': g * 5 }}>
              <span className="fade-label">{group.group}</span>
            </p>
            {group.items.map((it, i) => {
              const badge = typeof it.badge === 'string' ? counts[it.badge] : it.badge
              return (
                <button
                  key={it.id}
                  data-nav={it.id}
                  data-tip={it.label}
                  className={`nav-item ${active === it.id ? 'is-active' : ''}`}
                  style={{ '--i': g * 5 + i + 1 }}
                  onClick={() => go(it.id)}
                  aria-current={active === it.id ? 'page' : undefined}
                >
                  <Icon name={it.icon} />
                  <span className="nav-label">{it.label}</span>
                  {it.tag && <span className="nav-badge is-tag">{it.tag}</span>}
                  {badge != null && badge !== 0 && <span className={`nav-badge ${it.hot ? 'is-hot' : ''}`}>{badge}</span>}
                  {it.hot && badge > 0 && <i className="nav-dot" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="side-foot" ref={footRef} style={{ '--i': 16 }}>
        <button className="goal" onClick={() => go('problems')}>
          <div className="goal-top">
            <span>Оценка дня от ИИ</span>
            <b>7.8</b>
          </div>
          <div className="goal-bar">
            <i style={{ width: '78%' }} />
          </div>
          <p>{counts.problems} разговоров требуют внимания</p>
        </button>

        <div className="pop-anchor">
          <button
            className={`nav-item ${pop === 'notifs' ? 'is-open' : ''}`}
            data-tip="Уведомления"
            onClick={() => toggle('notifs')}
            aria-expanded={pop === 'notifs'}
          >
            <span className="bell">
              <Icon name="bell" />
              {unread > 0 && <i className="bell-dot">{unread}</i>}
            </span>
            <span className="nav-label">Уведомления</span>
            {unread > 0 && <span className="nav-badge is-hot">{unread}</span>}
          </button>
          {pop === 'notifs' && (
            <div className="pop pop--side pop--notifs" role="dialog" aria-label="Уведомления">
              <div className="pop-head">
                <h4>Уведомления</h4>
                <button className="link" disabled={!unread} onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false })))}>
                  Прочитать все
                </button>
              </div>
              <ul className="notif-list">
                {notifs.map((n) => (
                  <li key={n.id}>
                    <button
                      className={`notif ${n.unread ? 'is-unread' : ''}`}
                      onClick={() => {
                        setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
                        setPop(null)
                        if (n.talk) openTalk(n.talk)
                        else if (n.page) onNavigate(n.page)
                      }}
                    >
                      <span className={`notif-ic tone-${n.tone}`}>
                        <Icon name={n.icon} />
                      </span>
                      <span className="notif-text">
                        <b>{n.who}</b> {n.text}
                        <em>{n.time}</em>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button className="pop-foot-link" onClick={() => go('problems')}>
                Все проблемные разговоры <Icon name="arrowRight" />
              </button>
            </div>
          )}
        </div>

        <button
          className={`nav-item ${active === 'settings' ? 'is-current' : ''}`}
          data-tip="Настройки"
          onClick={() => go('settings')}
          aria-current={active === 'settings' ? 'page' : undefined}
        >
          <Icon name="sliders" />
          <span className="nav-label">Настройки</span>
        </button>

        <div className="profile pop-anchor">
          <button className="profile-btn" onClick={() => toggle('profile')} aria-expanded={pop === 'profile'} data-tip={me.name}>
            <Avatar person={me} className="profile-avatar" />
            <span className="profile-text">
              <strong>{me.name}</strong>
              <span>{me.role}</span>
            </span>
            <Icon name="dots" className="profile-more" />
          </button>
          <p className="profile-vertical" aria-hidden="true">
            <b>{me.name}</b>
            <span>{me.role}</span>
          </p>
          {pop === 'profile' && (
            <div className="pop pop--side pop--profile" role="menu">
              <div className="pop-user">
                <Avatar person={me} className="pop-user-avatar" />
                <div>
                  <strong>{me.name}</strong>
                  <span>{me.email}</span>
                </div>
              </div>
              <button className="menu-item" role="menuitem" onClick={() => go('reports')}>
                <Icon name="report" /> Отчёты за смену
              </button>
              <button className="menu-item" role="menuitem" onClick={() => go('settings')}>
                <Icon name="settings" /> Настройки
              </button>
              <button
                className="menu-item is-danger"
                role="menuitem"
                onClick={() => {
                  setPop(null)
                  onSignOut()
                }}
              >
                <Icon name="logout" /> Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
