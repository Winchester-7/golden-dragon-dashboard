import { useState } from 'react'
import { DIR, PHONE, PHONE_CONCLUSIONS, PHONE_KPIS, SIM_CALLS, WA_CALLS } from '../data/phone'
import './phonehub.css'

const tone = (v) => (v >= 8 ? 'green' : v >= 5 ? 'amber' : 'red')

/**
 * Служебный телефон: звонки с SIM-карты, аудиозвонки WhatsApp и переписки WhatsApp.
 * ИИ записывает, разбирает каждый разговор и делает общие выводы.
 * chats: переписки из data/hotel (CHATS).
 */
export default function PhoneHub({ chats = [] }) {
  const [tab, setTab] = useState('sim')
  const [open, setOpen] = useState(null)
  const tabs = [
    { id: 'sim', label: 'Звонки с SIM', n: SIM_CALLS.length },
    { id: 'wa', label: 'Звонки WhatsApp', n: WA_CALLS.length },
    { id: 'chat', label: 'Переписки WhatsApp', n: chats.length },
  ]
  const rows = tab === 'sim' ? SIM_CALLS : tab === 'wa' ? WA_CALLS
    : chats.map((c) => ({ id: c.id, time: c.time, dir: 'chat', who: c.who, admin: '', dur: c.wait, score: c.score, topic: c.flag || 'Переписка', summary: c.summary, ai: c.ai, flag: c.flag }))

  return (
    <div className="ph">
      <div className="ph-kpis">
        {PHONE_KPIS.map((k) => (
          <div key={k.id} className={`ph-card ph-kpi ph-t-${k.tone}`}>
            <span>{k.label}</span>
            <b>{k.value}</b>
            <small>{k.sub}</small>
          </div>
        ))}
      </div>

      <div className="ph-card ph-ai">
        <div className="ph-ai-head">
          <b>Выводы ИИ по служебному телефону</b>
          <span>{PHONE.model} · за сутки 10 ноября</span>
        </div>
        <div className="ph-ai-grid">
          {PHONE_CONCLUSIONS.map((c) => (
            <div key={c.title} className={`ph-concl ph-t-${c.tone}`}>
              <b>{c.title}</b>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ph-card ph-listcard">
        <div className="ph-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => { setTab(t.id); setOpen(null) }}>
              {t.label}<i>{t.n}</i>
            </button>
          ))}
        </div>
        <div className="ph-list">
          {rows.map((r) => {
            const on = open === r.id
            const d = DIR[r.dir]
            return (
              <div key={r.id} className={`ph-row${on ? ' is-open' : ''}`}>
                <button className="ph-row-head" onClick={() => setOpen(on ? null : r.id)} aria-expanded={on}>
                  <span className={`ph-score ph-t-${tone(r.score)}`}>{r.score}</span>
                  <span className="ph-row-main">
                    <b>{r.topic}{r.flag && r.flag !== r.topic && <em>{r.flag}</em>}</b>
                    <span>{r.time} · {d ? `${d.sign} ${d.label}` : 'Чат'} · {r.who}{r.admin ? ` · ${r.admin}` : ''}{r.dur ? ` · ${r.dur}` : ''}</span>
                  </span>
                  <span className="ph-chev" aria-hidden="true">{on ? '−' : '+'}</span>
                </button>
                {on && (
                  <div className="ph-row-body">
                    <p>{r.summary}</p>
                    <p className="ph-advice"><b>Вывод ИИ:</b> {r.ai}</p>
                    <small>{r.dir === 'chat' ? 'Текст переписки сохранён.' : r.dir === 'missed' ? 'Разговора не было, записи нет.' : 'Запись разговора и текст сохранены.'}</small>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="ph-note">Как это будет работать: звонки с SIM записывает приложение на телефоне, WhatsApp читается через WhatsApp Web на компьютере ресепшена. ИИ переводит записи в текст, оценивает каждый разговор и раз в смену делает выводы. Сейчас здесь условные данные.</p>
    </div>
  )
}
