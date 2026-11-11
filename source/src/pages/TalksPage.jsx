import { useMemo } from 'react'
import Icon from '../components/Icon'
import Player from '../components/Player'
import Score from '../components/Score'
import { Empty, Kpi, PageHead, Pill, SearchInput, Segmented } from '../components/kit'
import { useApp } from '../lib/store'
import { useShared } from '../lib/shared'
import { SPARKS, TALKS, isBad, talkWhere } from '../data/hotel'

const MODES = {
  all: { title: 'Все разговоры', sub: 'Каждый звонок и беседа у стойки с оценкой ИИ. Нажмите на разговор, чтобы открыть разбор.' },
  desk: { title: 'Беседы у стойки', sub: 'Разговоры администраторов с гостями лицом к лицу. Каждую можно прослушать.' },
  bad: { title: 'Проблемные разговоры', sub: 'Жалобы, грубость и нерешённые просьбы собраны отдельно, чтобы ничего не пропустить.' },
}
const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'call', label: 'Звонки' },
  { id: 'desk', label: 'У стойки' },
]
const avg = (xs) => (xs.length ? xs.reduce((a, t) => a + t.score, 0) / xs.length : 0)

export default function TalksPage({ mode }) {
  const { openTalk, go } = useApp()
  const [kind, setKind] = useShared(`talks.${mode}.kind`, 'all')
  const [q, setQ] = useShared(`talks.${mode}.q`, '')
  const meta = MODES[mode]

  const base = useMemo(() => (mode === 'desk' ? TALKS.filter((t) => t.kind === 'desk') : mode === 'bad' ? TALKS.filter(isBad) : TALKS), [mode])
  const s = q.trim().toLowerCase()
  const rows = base.filter((t) => (kind === 'all' || t.kind === kind) && (!s || `${t.summary} ${t.place} ${t.admin}`.toLowerCase().includes(s)))
  const bad = base.filter(isBad)

  return (
    <div className="page">
      <PageHead title={meta.title} sub={meta.sub}>
        <SearchInput value={q} onChange={setQ} placeholder="Поиск по разговорам" width="16rem" />
        {mode !== 'bad' && (
          <button className="btn btn--white" onClick={() => go('problems')}>
            <Icon name="zap" />
            Проблемные
          </button>
        )}
      </PageHead>

      <div className="grid-kpi">
        <Kpi icon={mode === 'desk' ? 'users' : 'phone'} label={mode === 'bad' ? 'Проблемных за день' : 'Разговоров в примере'} value={base.length} tone={mode === 'bad' ? 'red' : 'green'} spark={SPARKS.wave} d={0} />
        <Kpi icon="star" label="Средняя оценка ИИ" value={avg(base)} decimals={1} tone="teal" spark={SPARKS.steady} d={1} foot="из 10" />
        <Kpi icon="zap" label={mode === 'bad' ? 'Жалоб' : 'С проблемами'} value={mode === 'bad' ? base.filter((t) => t.flags.includes('Жалоба')).length : bad.length} tone="orange" spark={SPARKS.down} d={2} onClick={mode === 'bad' ? undefined : () => go('problems')} />
        <Kpi icon="clock" label="Не решено" value={base.filter((t) => t.score < 6).length} tone="purple" spark={SPARKS.up} d={3} foot="нужно перезвонить гостям" />
      </div>

      {mode !== 'desk' && (
        <div className="toolbar card-in" style={{ '--d': 4 }}>
          <Segmented label="Тип разговора" options={FILTERS.map((f) => ({ ...f, count: f.id === 'all' ? base.length : base.filter((t) => t.kind === f.id).length }))} value={kind} onChange={setKind} />
        </div>
      )}

      <div className="rows">
        {rows.map((t, i) => (
          <article key={t.id} className="card row card-in" style={{ '--d': 5 + i }}>
            <button className="row-main" onClick={() => openTalk(t.id)}>
              <Score value={t.score} />
              <span className="row-text">
                <span className="row-meta">
                  {t.time} · {talkWhere(t)} · {t.admin}
                </span>
                <span className="row-title">{t.summary}</span>
                {t.flags.length > 0 && (
                  <span className="row-pills">
                    {t.flags.map((f) => (
                      <Pill key={f} tone="red">
                        {f}
                      </Pill>
                    ))}
                  </span>
                )}
              </span>
            </button>
            <div className="row-side">
              <Player id={t.id} dur={t.dur} compact />
              <button className="btn btn--white btn--sm" onClick={() => openTalk(t.id)}>
                Разбор ИИ
                <Icon name="arrowRight" />
              </button>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <div className="card card-pad">
            <Empty icon="search" title="Ничего не найдено" text="Попробуйте изменить поиск или фильтр." />
          </div>
        )}
      </div>
      <p className="mock-note">В макете звука нет: кнопка показывает, как будет идти прослушивание.</p>
    </div>
  )
}
