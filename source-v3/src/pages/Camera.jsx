import LiveCamera from '../components/LiveCamera';
import { PageHead } from '../components/ui';
import { liveShift, shiftNames } from '../data/shifts';

/** Камера: живой просмотр веб-камеры ресепшена. */
export default function Camera() {
  return (
    <>
      <PageHead title="Камера ресепшена" crumbs={['Golden Dragon', 'Прямой эфир']} />
      <LiveCamera staff={shiftNames(liveShift)} />
    </>
  );
}
