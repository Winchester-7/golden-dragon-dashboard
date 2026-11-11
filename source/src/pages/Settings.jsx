import Icon from '../components/Icon'
import { CardHead, PageHead, Segmented, Toggle } from '../components/kit'
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
  { id: 'daily', label: 'Утренняя сводка', text: 'Каждый день в 8:00 присылать итог вчерашнего дня.' },
  { id: 'mail', label: 'Письма без ответа', text: 'Сообщать о письмах, на которые не ответили за 4 часа.' },
]

export default function Settings() {
  const { prefs, replayIntro, toast } = useApp()
  const [alerts, setAlerts] = useShared('settings.alerts', { bad: true, open: true, daily: true, mail: false })

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
      <p className="mock-note">Это макет. Цифры, разговоры и письма условные, чтобы показать, как будет выглядеть программа.</p>
    </div>
  )
}
