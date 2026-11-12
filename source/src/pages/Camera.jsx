import LiveCamera from '../components/LiveCamera'
import { PageHead } from '../components/kit'
import { liveShift, shiftNames } from '../data/shifts'

/** Камера: живой просмотр веб-камеры ресепшена. */
export default function Camera() {
  return (
    <div className="page">
      <PageHead title="Камера ресепшена" sub="Прямой эфир с веб-камеры у стойки. По этой же камере программа будет узнавать администратора по лицу." />
      <LiveCamera staff={shiftNames(liveShift)} />
    </div>
  )
}
