import PhoneHub from '../components/PhoneHub';
import { PageHead } from '../components/ui';
import { CHATS } from '../data/hotel';

/** Служебный телефон: звонки с SIM, звонки и переписки WhatsApp, выводы ИИ. */
export default function Phone() {
  return (
    <>
      <PageHead title="Служебный телефон" crumbs={['Golden Dragon', 'Звонки и WhatsApp']} />
      <PhoneHub chats={CHATS} />
    </>
  );
}
