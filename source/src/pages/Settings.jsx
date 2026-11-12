import Icon from '../components/Icon'
import { CardHead, PageHead, Pill, Segmented, Toggle } from '../components/kit'
import { SHIFT_KIND, STAFF } from '../data/shifts'
import { useApp } from '../lib/store'
import { useShared } from '../lib/shared'

const SIZES = [
  { id: 'compact', label: 'Мелко' },
  { id: 'default', label: 'Обычно' },
  { id: 'large', label: 'Крупно' },
]
const ALERTS = [
  { id: 'bad', label: 'Грубость и жалобы', text: 'Сразу писать в Telegram, если оценка разговора ниже 5.' },
  { id: 'open', label: 'Нерешённые просьбы', text: 'Напоминать, если гостю не перезвонили.' },
  { id: 'daily', label: 'Отчёт за смену', text: 'В 08:00 и в 20:00, при пересменке: кто работал и как справился.' },
  { id: 'late', label: 'Администратор не пришёл', text: 'Сообщать, если камера не увидела сотрудника через 15 минут после начала смены.' },
  { id: 'mail', label: 'Письма без ответа', text: 'Сообщать о письмах, на которые не ответили за 4 часа.' },
]

export default function Settings() {
  const { prefs, replayIntro, toast } = useApp()
  const [alerts, setAlerts] = useShared('settings.alerts', { bad: true, open: true, daily: true, late: true, mail: false })

  return (
    <div className="page">
      <PageHead title="Настройки" sub="Внешний вид панели и уведомления в Telegram." />

      <div className="split split--even">
        <section className="card card-pad card-in" style={{ '--d': 0 }}>
          <CardHead title="Внешний вид" sub="Сохраняется на этом устройстве" icon="monitor" />
          <ul className="set-list">
            <li className="rv" style={{ '--i': 0 }}>
              <div>
                <b>Размер текста</b>
                <span>Крупнее удобнее на телевизоре и большом мониторе.</span>
              </div>
              <Segmented size="sm" label="Размер" options={SIZES} value={prefs.density} onChange={prefs.setDensity} />
            </li>
            <li className="rv" style={{ '--i': 1 }}>
              <div>
                <b>Анимация</b>
                <span>Плавное появление карточек и графиков.</span>
              </div>
              <Toggle on={prefs.motion === 'full'} onChange={(on) => prefs.setMotion(on ? 'full' : 'reduced')} label="Анимация" />
            </li>
            <li className="rv" style={{ '--i': 2 }}>
              <div>
                <b>Заставка</b>
                <span>Показать вступление с логотипом ещё раз.</span>
              </div>
              <button className="btn btn--white btn--sm" onClick={replayIntro}>
                <Icon name="sparkle" />
                Показать
              </button>
            </li>
          </ul>
        </section>

        <section className="card card-pad card-in" style={{ '--d': 1 }}>
          <CardHead title="Уведомления в Telegram" sub="О чём бот пишет руководителю" icon="send" />
          <ul className="set-list">
            {ALERTS.map((a, i) => (
              <li key={a.id} className="rv" style={{ '--i': i }}>
                <div>
                  <b>{a.label}</b>
                  <span>{a.text}</span>
                </div>
                <Toggle
                  on={alerts[a.id]}
                  label={a.label}
                  onChange={(on) => {
                    setAlerts((v) => ({ ...v, [a.id]: on }))
                    toast({ text: on ? `Включено: ${a.label}` : `Выключено: ${a.label}`, icon: on ? 'check' : 'minus', tone: 'teal' })
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="card card-pad card-in" style={{ '--d': 2 }}>
        <CardHead title="Смены и камера" sub="Кто работал, определяется по камере над ресепшеном" icon="camera" />
        <ul className="set-list">
          {Object.values(SHIFT_KIND).map((k, i) => (
            <li key={k.label} className="rv" style={{ '--i': i }}>
              <div>
                <b>{k.label}</b>
                <span>Администратор работает 12 часов. Отчёт ИИ готов в {k.to}.</span>
              </div>
              <Pill tone="teal" dot={false}>
                {k.hours}
              </Pill>
            </li>
          ))}
          <li className="rv" style={{ '--i': 2 }}>
            <div>
              <b>Распознавание сотрудников</b>
              <span>Узнаются только администраторы, чьи фото загружены: {STAFF.map((p) => p.name).join(', ')}. Лица гостей не сохраняются.</span>
            </div>
            <Pill tone="green">Включено</Pill>
          </li>
        </ul>
      </section>
      <p className="mock-note">Это макет. Цифры, разговоры и письма условные, чтобы показать, как будет выглядеть программа.</p>
    </div>
  )
}
