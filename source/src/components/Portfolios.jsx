import { useCallback, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { Highlight } from './ui'
import { useDismiss, useFlip } from '../lib/hooks'

const SORTS = [
  { id: 'default', label: 'По порядку' },
  { id: 'name', label: 'По названию' },
  { id: 'age', label: 'По оценке' },
  { id: 'loans', label: 'По числу проблем' },
]

const sorters = {
  default: () => 0,
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  age: (a, b) => b.score - a.score,
  loans: (a, b) => b.bad - a.bad,
}

export default function Portfolios({ items, selected, onSelect, query }) {
  const [sort, setSort] = useState('default')
  const [menu, setMenu] = useState(false)
  const [all, setAll] = useState(false)
  const sortRef = useRef(null)
  const bodyRef = useRef(null)
  const closeMenu = useCallback(() => setMenu(false), [])
  useDismiss(sortRef, closeMenu, menu)

  const rows = useMemo(() => [...items].sort(sorters[sort]), [items, sort])
  const shown = all || query ? rows : rows.slice(0, 4)
  useFlip(bodyRef, shown.map((r) => r.id).join('|'))

  return (
    <section className="pf sect rise" id="sec-portfolios" style={{ '--d': 5 }}>
      <div className="pf-head">
        <h2 className="sec-title">Каналы</h2>
        <button className="link" onClick={() => setAll((a) => !a)}>
          {all ? 'Свернуть' : 'Все каналы'}
        </button>
        <div className="pop-anchor pf-sort" ref={sortRef}>
          <button className="sort-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
            <Icon name="sort" />
            Порядок
            <Icon name="chevronDown" className={`chev ${menu ? 'is-up' : ''}`} />
          </button>
          {menu && (
            <div className="pop pop--menu" role="menu">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  role="menuitemradio"
                  aria-checked={sort === s.id}
                  className={`menu-item ${sort === s.id ? 'is-on' : ''}`}
                  onClick={() => {
                    setSort(s.id)
                    setMenu(false)
                  }}
                >
                  <Icon name={sort === s.id ? 'check' : 'sort'} />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pf-table" role="table" aria-label="Каналы">
        <div className="pf-row pf-row--head" role="row">
          <span role="columnheader">Канал</span>
          <span role="columnheader">оценка ИИ</span>
          <span role="columnheader">с проблемами</span>
        </div>
        <div className="pf-body" ref={bodyRef} role="rowgroup">
          {shown.map((r, i) => (
            <button
              key={r.id}
              data-flip={r.id}
              role="row"
              style={{ '--i': i }}
              className={`pf-row ${i % 2 === 0 ? 'is-green' : 'is-grey'} ${selected === r.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(r.id)}
              aria-pressed={selected === r.id}
            >
              <span className="pf-name" role="cell">
                <Highlight text={r.name} q={query} />
              </span>
              <span role="cell">{r.score.toFixed(1)} / 10</span>
              <span role="cell">{r.bad} / {r.total}</span>
            </button>
          ))}
          {shown.length === 0 && <p className="empty">Ничего не найдено по запросу «{query}».</p>}
        </div>
      </div>
    </section>
  )
}
