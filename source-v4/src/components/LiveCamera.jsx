import { useCallback, useEffect, useRef, useState } from 'react'
import './livecam.css'

const ERRORS = {
  NotAllowedError: 'Браузер не получил разрешение. Нажмите на значок камеры в адресной строке и выберите «Разрешить».',
  NotFoundError: 'Камера не найдена. Проверьте, что веб-камера подключена по USB.',
  NotReadableError: 'Камера занята другой программой. Закройте её и попробуйте снова.',
  OverconstrainedError: 'Эта камера не поддерживает выбранный режим. Выберите другую камеру.',
  insecure: 'Камера работает только на защищённой странице (https). Откройте дашборд по ссылке с https.',
}

const clock = () => new Date().toLocaleTimeString('ru-RU')

/**
 * Живой просмотр веб-камеры ресепшена прямо в дашборде.
 * Показывает камеру, подключённую к этому компьютеру (USB), и уровень звука с её микрофона.
 */
export default function LiveCamera({ staff = 'Нургуль' }) {
  const videoRef = useRef(null)
  const boxRef = useRef(null)
  const streamRef = useRef(null)
  const audioRef = useRef(null)
  const [state, setState] = useState('idle') // idle | asking | live | error
  const [error, setError] = useState('')
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [info, setInfo] = useState(null)
  const [level, setLevel] = useState(0)
  const [time, setTime] = useState(clock)
  const [shot, setShot] = useState(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (audioRef.current) {
      cancelAnimationFrame(audioRef.current.raf)
      audioRef.current.ctx.close().catch(() => {})
      audioRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setLevel(0)
    setInfo(null)
    setState('idle')
  }, [])

  const start = useCallback(async (id) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(ERRORS.insecure)
      setState('error')
      return
    }
    stop()
    setState('asking')
    setError('')
    const video = { width: { ideal: 3840 }, height: { ideal: 2160 }, ...(id ? { deviceId: { exact: id } } : {}) }
    try {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video, audio: true })
      } catch (e) {
        if (e.name === 'NotAllowedError') throw e
        stream = await navigator.mediaDevices.getUserMedia({ video, audio: false })
      }
      streamRef.current = stream
      const el = videoRef.current
      el.srcObject = stream
      await el.play().catch(() => {})
      const vt = stream.getVideoTracks()[0]
      const st = vt.getSettings()
      setInfo({ name: vt.label || 'Веб-камера', size: st.width ? `${st.width}×${st.height}` : '', mic: stream.getAudioTracks().length > 0 })
      setDeviceId(st.deviceId || id || '')
      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter((d) => d.kind === 'videoinput'))
      if (stream.getAudioTracks().length) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        const ctx = new Ctx()
        const an = ctx.createAnalyser()
        an.fftSize = 256
        ctx.createMediaStreamSource(stream).connect(an)
        const buf = new Uint8Array(an.fftSize)
        const a = { ctx, raf: 0 }
        const tick = () => {
          an.getByteTimeDomainData(buf)
          let peak = 0
          for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128))
          setLevel(Math.min(1, peak / 60))
          a.raf = requestAnimationFrame(tick)
        }
        tick()
        audioRef.current = a
      }
      setState('live')
    } catch (e) {
      setError(ERRORS[e.name] || 'Не получилось подключиться к камере. Попробуйте ещё раз.')
      setState('error')
    }
  }, [stop])

  useEffect(() => stop, [stop])
  useEffect(() => {
    const t = setInterval(() => setTime(clock()), 1000)
    return () => clearInterval(t)
  }, [])

  const snapshot = () => {
    const v = videoRef.current
    if (!v?.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    setShot({ url: c.toDataURL('image/jpeg', 0.9), time: clock() })
  }
  const full = () => boxRef.current?.requestFullscreen?.()
  const live = state === 'live'

  return (
    <div className="lc">
      <div className="lc-stage" ref={boxRef}>
        <video ref={videoRef} className="lc-video" autoPlay muted playsInline style={{ opacity: live ? 1 : 0 }} />
        {live && (
          <>
            <div className="lc-top">
              <span className="lc-live"><i />Прямой эфир</span>
              <span className="lc-clock">{time}</span>
            </div>
            <div className="lc-bottom">
              <span>{info?.name}{info?.size ? ` · ${info.size}` : ''}</span>
              <span className="lc-mic" title="Уровень звука с микрофона камеры">
                {info?.mic ? 'Микрофон' : 'Микрофон не найден'}
                {info?.mic && <b><i style={{ width: `${Math.round(level * 100)}%` }} /></b>}
              </span>
            </div>
          </>
        )}
        {!live && (
          <div className="lc-empty">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 10l5-3v10l-5-3z" /><rect x="3" y="6" width="12" height="12" rx="3" />
            </svg>
            <b>{state === 'asking' ? 'Подключаюсь к камере…' : 'Камера ресепшена'}</b>
            <span>{state === 'error' ? error : 'Нажмите кнопку, и браузер спросит разрешение на камеру и микрофон.'}</span>
            <button className="lc-btn lc-btn--main" onClick={() => start(deviceId)} disabled={state === 'asking'}>
              {state === 'error' ? 'Попробовать снова' : 'Подключить камеру'}
            </button>
          </div>
        )}
      </div>

      <div className="lc-side">
        <div className="lc-card">
          <span className="lc-label">Управление</span>
          {devices.length > 1 && (
            <select className="lc-select" value={deviceId} onChange={(e) => start(e.target.value)} aria-label="Выбор камеры">
              {devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Камера ${i + 1}`}</option>)}
            </select>
          )}
          <div className="lc-row">
            <button className="lc-btn" onClick={snapshot} disabled={!live}>Сделать снимок</button>
            <button className="lc-btn" onClick={full} disabled={!live}>На весь экран</button>
            <button className="lc-btn" onClick={stop} disabled={!live}>Выключить</button>
          </div>
          {shot && (
            <a className="lc-shot" href={shot.url} download={`reception-${shot.time.replaceAll(':', '-')}.jpg`}>
              <img src={shot.url} alt="Снимок с камеры" />
              <span>Снимок в {shot.time}. Нажмите, чтобы сохранить.</span>
            </a>
          )}
        </div>
        <div className="lc-card">
          <span className="lc-label">Кто у стойки</span>
          <b className="lc-who">{staff}</b>
          <span className="lc-note">Имя пока из графика смен. Когда подключим распознавание лица, оно будет определяться по этой камере автоматически.</span>
        </div>
        <div className="lc-card">
          <span className="lc-label">Как это работает</span>
          <span className="lc-note">Сейчас видно камеру, которая подключена к этому компьютеру по USB. Видео никуда не отправляется и не записывается.</span>
          <span className="lc-note">Смотреть ресепшен с телефона или из дома можно будет после установки программы на компьютер ресепшена.</span>
        </div>
      </div>
    </div>
  )
}
