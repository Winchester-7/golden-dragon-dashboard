import PhoneHub from '../components/PhoneHub'
import { PageHead } from '../components/kit'
import { CHATS } from '../data/hotel'

/** Служебный телефон: звонки с SIM, звонки и переписки WhatsApp, выводы ИИ. */
export default function Phone() {
  return (
    <div className="page">
      <PageHead title="Служебный телефон" sub="Звонки с SIM-карты, аудиозвонки WhatsApp и переписки. ИИ записывает, разбирает каждый разговор и делает выводы." />
      <PhoneHub chats={CHATS} />
    </div>
  )
}
