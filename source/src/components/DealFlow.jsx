import { useMemo } from 'react'
import { BarChart, Delta } from './kit'
import { useApp } from '../lib/store'
import { WEEK_FLOW as DEAL_FLOW } from '../data/hotel'

/** Home dashboard: deals closed per day this week, as rounded bars. */
export default function DealFlow() {
  const { go } = useApp()
  const total = DEAL_FLOW.values.reduce((a, b) => a + b, 0)
  const series = useMemo(() => [{ id: 'closed', label: 'Разговоров', color: 'var(--teal)', data: DEAL_FLOW.values }], [])
  return (
    <section className="flow sect rise" id="sec-flow" style={{ '--d': 5 }}>
      <div className="sec-head">
        <h2 className="sec-title">Разговоров за неделю</h2>
        <button className="link sec-link" onClick={() => go('talks')}>
          Все разговоры
        </button>
      </div>
      <div className="card flow-card">
        <div className="flow-top">
          <div>
            <b>{total}</b>
            <span>за 7 дней</span>
          </div>
          <Delta value={12.4} />
        </div>
        <BarChart labels={DEAL_FLOW.labels} series={series} height="6.8rem" yTicks={false} d={5} format={(v) => `${v}`} />
      </div>
    </section>
  )
}
