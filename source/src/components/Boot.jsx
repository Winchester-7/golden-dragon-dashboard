import { useLayoutEffect, useRef } from 'react'
import { Logo } from './Icon'

/**
 * The intro (same choreography as Dashboard v22): the ring logo draws itself on deep
 * green, flies into its place in the sidebar, and the whole app opens out of it in
 * an expanding circle. Cards then land one after another (see BOOT_BASE).
 */
export default function Boot() {
  const mark = useRef(null)
  const word = useRef(null)

  useLayoutEffect(() => {
    const app = document.querySelector('.app')
    const dock = document.querySelector('.side .brand-mark')
    if (!app || !dock || !mark.current) return undefined
    const box = app.getBoundingClientRect()
    const d = dock.getBoundingClientRect()
    const m = mark.current.getBoundingClientRect()
    const cx = d.left + d.width / 2
    const cy = d.top + d.height / 2
    const dx = cx - (m.left + m.width / 2)
    const dy = cy - (m.top + m.height / 2)
    const scale = d.width / m.width
    const R = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 80
    const at = `${cx - box.left}px ${cy - box.top}px`

    const anims = [
      app.animate(
        { clipPath: [`circle(0px at ${at})`, `circle(${R}px at ${at})`] },
        { delay: 1020, duration: 1180, easing: 'cubic-bezier(.62,0,.18,1)', fill: 'both' },
      ),
      mark.current.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(360deg)` }], {
        delay: 760,
        duration: 720,
        easing: 'cubic-bezier(.65,0,.15,1)',
        fill: 'both',
      }),
      mark.current.animate({ opacity: [1, 0] }, { delay: 1500, duration: 140, fill: 'both' }),
      word.current.animate(
        { opacity: [1, 0], transform: ['translateY(0)', 'translateY(10px)'] },
        { delay: 660, duration: 260, easing: 'ease-in', fill: 'both' },
      ),
    ]
    anims[0].onfinish = () => anims[0].cancel()
    return () => anims.forEach((a) => a.cancel())
  }, [])

  return (
    <>
      <div className="boot-bg" aria-hidden="true" />
      <div className="boot" aria-hidden="true">
        <div className="boot-stage">
          <div className="boot-mark" ref={mark}>
            <Logo className="boot-logo" />
          </div>
          <p className="boot-word" ref={word}>
            <b>Golden Dragon</b>
            <span>ИИ-контроль ресепшена</span>
          </p>
        </div>
      </div>
    </>
  )
}
