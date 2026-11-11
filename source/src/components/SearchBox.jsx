import { useEffect, useRef } from 'react'
import Icon from './Icon'

const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

export default function SearchBox({ value, onChange, results }) {
  const ref = useRef(null)
  useEffect(() => {
    const key = (e) => {
      if (e.key === '/' && !typing(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        ref.current?.focus()
        ref.current?.select()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  return (
    <div className="search rise" style={{ '--d': 1 }} onClick={() => ref.current?.focus()}>
      <Icon name="search" />
      <input
        ref={ref}
        value={value}
        placeholder="Поиск"
        aria-label="Поиск по задачам и каналам"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('')
            e.currentTarget.blur()
          }
        }}
      />
      {value ? (
        <>
          <span className="search-count">найдено: {results}</span>
          <button className="search-clear" onClick={() => onChange('')} aria-label="Очистить">
            <Icon name="x" />
          </button>
        </>
      ) : (
        <kbd>/</kbd>
      )}
    </div>
  )
}
