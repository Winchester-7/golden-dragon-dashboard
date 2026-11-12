import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../app/store';
import { cx, full } from '../lib/format';
import { useCountUp, usePresence, useToggle } from '../lib/hooks';
import Icon from './Icon';

/** A number that counts up to `value`. */
export function CountUp({ value, format = full, duration, delay, className }) {
  const shown = useCountUp(value, { duration, delay });
  return <span className={className}>{format(shown)}</span>;
}

/**
 * Dropdown panel anchored inside a `.anchor` wrapper (the trigger's parent).
 * Closes on outside click and Escape.
 * @param align 'left' | 'right' · @param up open upwards
 */
export function Popover({ open, onClose, align = 'right', up = false, className, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.parentElement?.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className={cx('pop', `pop--${align}`, up && 'pop--up', className)} role="dialog">
      {children}
    </div>
  );
}

/** items: [{ label, icon, onClick, selected, danger, hint } | { divider: true } | { heading }] */
export function Menu({ items, onDone }) {
  return (
    <ul className="menu" role="menu">
      {items.map((it, j) => {
        if (it.divider) return <li key={`d${j}`} className="menu-div" role="separator" />;
        if (it.heading)
          return (
            <li key={`h${j}`} className="menu-head">
              {it.heading}
            </li>
          );
        return (
          <li key={it.label} style={{ '--i': j }}>
            <button
              type="button"
              role="menuitem"
              className={cx('menu-item', it.danger && 'danger', it.selected && 'on')}
              onClick={() => {
                it.onClick?.();
                onDone?.();
              }}
            >
              {it.icon && <Icon name={it.icon} size={17} />}
              <span>{it.label}</span>
              {it.hint && <kbd>{it.hint}</kbd>}
              {it.selected && <Icon name="check" size={16} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** "Weekly ⌄" style picker: a pill (or pill + chevron circle) that opens a menu. */
export function Dropdown({ value, options, onChange, split = false, size = 'sm', align = 'right', label, className }) {
  const d = useToggle();
  const current = options.find((o) => o.value === value) ?? options[0];
  const items = options.map((o) => ({ label: o.label, selected: o.value === value, onClick: () => onChange(o.value) }));
  return (
    <div className={cx('anchor', 'drop', split && 'drop--split', className)}>
      <button type="button" className={cx('btn', size, 'outline', d.open && 'is-open')} onClick={d.toggle} aria-haspopup="menu" aria-expanded={d.open} aria-label={label}>
        {current.label}
        {!split && <Icon name="chevronDown" size={15} className="drop-chev" />}
      </button>
      {split && (
        <button type="button" className={cx('circle', 'drop-circle', d.open && 'is-open')} onClick={d.toggle} aria-label={label ?? 'Открыть список'}>
          <Icon name="chevronDown" size={18} />
        </button>
      )}
      <Popover open={d.open} onClose={d.close} align={align}>
        <Menu items={items} onDone={d.close} />
      </Popover>
    </div>
  );
}

/** Centered dialog with scrim; closes on Escape / scrim click. */
export function Modal({ open, onClose, title, sub, icon, width = 480, footer, bare = false, className, children }) {
  const { mounted, leaving } = usePresence(open, 300);
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = panel.current;
      if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
    }, 40);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={cx('modal', leaving && 'is-leaving')}>
      <div className="modal-scrim" onClick={onClose} />
      <div ref={panel} className={cx('modal-panel', className)} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} tabIndex={-1} style={{ '--w': `${width}px` }}>
        {!bare && (
          <header className="modal-head">
            {icon && (
              <span className="modal-icon">
                <Icon name={icon} size={20} />
              </span>
            )}
            <div>
              <h2>{title}</h2>
              {sub && <p>{sub}</p>}
            </div>
            <button type="button" className="circle sm soft" onClick={onClose} aria-label="Закрыть">
              <Icon name="x" size={16} />
            </button>
          </header>
        )}
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/** Toast stack (bottom-right). */
export function Toasts() {
  const { toasts, dismiss } = useApp();
  return createPortal(
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.leaving && 'is-leaving')}>
          <span className="toast-icon">
            <Icon name={t.icon} size={16} stroke={2} />
          </span>
          <div>
            <strong>{t.title}</strong>
            {t.text && <span>{t.text}</span>}
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Скрыть">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

/** Segmented control with a sliding indicator. items: [{ value, label }] */
export function Segmented({ items, value, onChange, label, size = 'md' }) {
  const ref = useRef(null);
  const ind = useRef(null);
  useLayoutEffect(() => {
    const btn = ref.current?.querySelector('[aria-selected="true"]');
    if (!ind.current) return;
    ind.current.style.opacity = btn ? '1' : '0';
    if (!btn) return;
    ind.current.style.width = `${btn.offsetWidth}px`;
    ind.current.style.transform = `translateX(${btn.offsetLeft}px)`;
  }, [value, items]);
  return (
    <div ref={ref} className={cx('seg', `seg--${size}`)} role="tablist" aria-label={label}>
      <span ref={ind} className="seg-ind" aria-hidden="true" />
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={it.value === value} className={cx(it.value === value && 'on')} onClick={() => onChange(it.value)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={cx('toggle', on && 'on')} onClick={() => onChange(!on)} />;
}

export function Checkbox({ checked, onChange, label, children }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="check-box">
        <Icon name="check" size={13} stroke={2.6} />
      </span>
      {children}
    </label>
  );
}

/** Page title that lands word by word, plus breadcrumb and actions. */
export function PageHead({ title, crumbs = [], children }) {
  const words = title.split(' ');
  return (
    <header className="page-head">
      <div>
        <h1 aria-label={title}>
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="word" style={{ '--i': i }} aria-hidden="true">
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        {crumbs.length > 0 && (
          <p className="crumbs rv" style={{ '--i': words.length }}>
            {crumbs.map((c, i) => (
              <span key={c}>
                {i > 0 && <Icon name="chevronRight" size={12} />}
                {c}
              </span>
            ))}
          </p>
        )}
      </div>
      {children && (
        <div className="page-actions rv" style={{ '--i': words.length + 1 }}>
          {children}
        </div>
      )}
    </header>
  );
}

/** Progress ring (value 0–1). Draws itself in. */
export function Ring({ value, size = 96, stroke = 10, color = 'var(--blue)', track = 'var(--soft-2)', children }) {
  const r = 50 - stroke / 2;
  const v = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div className="ring" style={{ '--size': `${size}px` }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle className="ring-arc" cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength="100" style={{ '--v': v }} />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

const PALETTE = ['#2f6bff', '#1b2c78', '#161616', '#5b8cff', '#7c8db8'];
const FIXED = { Айгерим: '#2f6bff', Бакыт: '#1b2c78', Нургуль: '#161616', Жибек: '#5b8cff', ИИ: '#a67d4b' };

export function Avatar({ name, size = 44, className }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  const color = FIXED[name] ?? PALETTE[[...name].reduce((h, ch) => h + ch.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span className={cx('avatar', className)} style={{ '--s': `${size}px`, '--c': color }} title={name}>
      {initials}
    </span>
  );
}

export function Empty({ icon = 'search', title, text }) {
  return (
    <div className="empty rv">
      <span>
        <Icon name={icon} size={22} />
      </span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}
