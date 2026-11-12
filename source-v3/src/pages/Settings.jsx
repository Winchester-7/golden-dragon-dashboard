import { useState } from 'react';
import { useApp } from '../app/store';
import emblem from '../assets/gd-emblem.png';
import Icon from '../components/Icon';
import { Avatar, PageHead, Segmented, Toggle } from '../components/ui';
import { SHIFT_KIND, STAFF } from '../data/shifts';

const DENSITY = [
  { value: 'default', label: 'Обычный' },
  { value: 'compact', label: 'Компактный' },
  { value: 'focus', label: 'Фокус' },
];

const SOURCES = [
  { id: 's1', icon: 'phone', name: 'Телефоны ресепшена', note: 'Два аппарата Panasonic KX-T7633' },
  { id: 's2', icon: 'mic', name: 'Микрофоны на стойке', note: 'Беседы с гостями лицом к лицу' },
  { id: 's3', icon: 'message', name: 'WhatsApp', note: 'Служебный телефон ресепшена' },
  { id: 's4', icon: 'mail', name: 'Почта Outlook', note: 'Письма гостей и партнёров' },
  { id: 's5', icon: 'star', name: 'Booking', note: 'Отзывы и ответы на них' },
];

/** Настройки: смены и отчёты, распознавание по камере, администраторы, источники данных. */
export default function Settings() {
  const { prefs, updatePrefs, toast } = useApp();
  const [notify, setNotify] = useState({ r8: true, r20: true, alert: true, late: true });
  const [camera, setCamera] = useState(true);

  return (
    <>
      <PageHead title="Настройки" crumbs={['Главное', 'Настройки']} />

      <div className="split split--2-1">
        <section className="card acct-profile" style={{ '--d': '0ms' }}>
          <div className="acct-id rv" style={{ '--i': 0 }}>
            <img className="acct-logo" src={emblem} alt="" />
            <span>
              <strong>Golden Dragon</strong>
              <em>Отель и спа · Бишкек</em>
            </span>
            <span className="chip solid">Демо-данные</span>
          </div>

          <div className="acct-rows">
            {Object.entries(SHIFT_KIND).map(([id, k], i) => (
              <div key={id} className="acct-row rv" style={{ '--i': i + 1 }}>
                <span>
                  <strong>{k.label}</strong>
                  <em>Администратор работает 12 часов</em>
                </span>
                <span className="chip blue">{k.hours}</span>
              </div>
            ))}
            {[
              ['r8', 'Отчёт в 08:00', 'Итоги ночной смены: кто работал и как справился'],
              ['r20', 'Отчёт в 20:00', 'Итоги дневной смены: кто работал и как справился'],
              ['alert', 'Сразу сообщать о проблемном разговоре', 'Жалоба, грубость или нерешённая просьба'],
              ['late', 'Сообщать, если администратор не пришёл', 'Камера не увидела сотрудника в течение 15 минут после начала смены'],
            ].map(([key, title, text], k) => (
              <div key={key} className="acct-row rv" style={{ '--i': k + 3 }}>
                <span>
                  <strong>{title}</strong>
                  <em>{text}</em>
                </span>
                <Toggle on={notify[key]} onChange={(v) => setNotify((n) => ({ ...n, [key]: v }))} label={title} />
              </div>
            ))}
          </div>
        </section>

        <div className="acct-side">
          <section className="card acct-plan on" style={{ '--d': '90ms' }}>
            <span className="klass-glow" aria-hidden="true" />
            <span className="acct-plan-icon rv" style={{ '--i': 0 }}>
              <Icon name="camera" size={20} />
            </span>
            <h3 className="rv" style={{ '--i': 1 }}>
              Кто на смене: по камере
            </h3>
            <p className="rv" style={{ '--i': 2 }}>
              Камера над ресепшеном узнаёт администратора по лицу и записывает, кто работал. Распознаются только сотрудники из списка, лица гостей не сохраняются.
            </p>
            <button type="button" className="btn sm white rv" style={{ '--i': 3 }} onClick={() => toast({ title: 'Подключим после установки', text: 'Сейчас на экранах показаны демо-данные', icon: 'camera' })}>
              Статус подключения
            </button>
          </section>

          <section className="card" style={{ '--d': '160ms' }}>
            <header className="card-head rv" style={{ '--i': 0 }}>
              <h3>Вид</h3>
            </header>
            <div className="acct-rows">
              <div className="acct-row rv" style={{ '--i': 1 }}>
                <span>
                  <strong>Плотность</strong>
                  <em>«Фокус» приглушает меню</em>
                </span>
                <Segmented size="sm" label="Плотность" items={DENSITY} value={prefs.density} onChange={(density) => updatePrefs({ density })} />
              </div>
              <div className="acct-row rv" style={{ '--i': 2 }}>
                <span>
                  <strong>Меньше анимации</strong>
                  <em>Без анимации появления</em>
                </span>
                <Toggle on={prefs.reduced} onChange={(reduced) => updatePrefs({ reduced })} label="Меньше анимации" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="split split--3 acct-bottom">
        <section className="card" style={{ '--d': '230ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <h3>Администраторы</h3>
            <span className="chip">{STAFF.length}</span>
          </header>
          <ul className="sessions">
            {STAFF.map((p, k) => (
              <li key={p.id} className="rv" style={{ '--i': k + 1 }}>
                <Avatar name={p.name} size={36} />
                <span>
                  <strong>{p.name}</strong>
                  <em>{p.kind === 'day' ? 'Дневные смены' : 'Ночные смены'} · фото загружено</em>
                </span>
                <span className="chip green">Узнаётся</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn sm outline acct-link rv" style={{ '--i': 5 }} onClick={() => toast({ title: 'Добавление сотрудника', text: 'В рабочей программе: имя и 3–5 фото лица', icon: 'user' })}>
            <Icon name="plus" size={15} stroke={2.2} /> Добавить администратора
          </button>
        </section>

        <section className="card" style={{ '--d': '300ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <h3>Камера</h3>
            <span className={camera ? 'chip green' : 'chip amber'}>{camera ? 'Включено' : 'Выключено'}</span>
          </header>
          <div className="acct-rows">
            <div className="acct-row rv" style={{ '--i': 1 }}>
              <span>
                <strong>Распознавание сотрудников</strong>
                <em>Камера Hikvision над ресепшеном</em>
              </span>
              <Toggle on={camera} onChange={setCamera} label="Распознавание сотрудников" />
            </div>
          </div>
          <ul className="sessions">
            <li className="rv" style={{ '--i': 2 }}>
              <span className="sess-icon">
                <Icon name="shield" size={17} />
              </span>
              <span>
                <strong>Только свои</strong>
                <em>Лица гостей не распознаются и не хранятся</em>
              </span>
            </li>
            <li className="rv" style={{ '--i': 3 }}>
              <span className="sess-icon">
                <Icon name="edit" size={17} />
              </span>
              <span>
                <strong>Запасной способ</strong>
                <em>Кнопка «Я на смене» на компьютере ресепшена</em>
              </span>
            </li>
          </ul>
        </section>

        <section className="card" style={{ '--d': '370ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <h3>Что анализирует ИИ</h3>
          </header>
          <ul className="sessions">
            {SOURCES.map((l, k) => (
              <li key={l.id} className="rv" style={{ '--i': k + 1 }}>
                <span className="sess-icon">
                  <Icon name={l.icon} size={17} />
                </span>
                <span>
                  <strong>{l.name}</strong>
                  <em>{l.note}</em>
                </span>
                <Icon name="check" size={16} className="up" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
