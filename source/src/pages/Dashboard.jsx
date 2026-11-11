import { useState } from 'react'
import Tokenization from '../components/Tokenization'
import PortfolioDonut from '../components/PortfolioDonut'
import FileCards, { FileCard } from '../components/FileCards'
import Savings from '../components/Savings'
import Portfolios from '../components/Portfolios'
import Tasks from '../components/Tasks'
import Team from '../components/Team'
import DealFlow from '../components/DealFlow'
import SearchBox from '../components/SearchBox'
import Icon, { Logo } from '../components/Icon'
import { useApp } from '../lib/store'
import { CHANNELS, HOTEL, TALKS } from '../data/hotel'

/** Карточка-папка для разговора: те же поля, что у исходной карточки шаблона. */
const asCard = (id, status, tone) => {
  const t = TALKS.find((x) => x.id === id)
  return {
    id,
    scope: t.kind === 'call' ? 'Звонок' : 'У стойки',
    access: t.admin,
    icon: t.kind === 'call' ? 'phone' : 'users',
    address: t.kind === 'call' ? `${t.place}, ${t.time}` : `Беседа в ${t.time}`,
    lender: t.flags.join(' · ') || 'Без замечаний',
    status,
    done: t.score,
    total: 10,
    date: t.time,
    tone,
  }
}

/** Главная: та же доска, что в шаблоне, с данными ресепшена. */
export default function Dashboard() {
  const { tasks, setTasks, selected, setSelected, openTalk, go } = useApp()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const channels = q ? CHANNELS.filter((p) => p.name.toLowerCase().includes(q)) : CHANNELS
  const results = q ? channels.length + tasks.filter((t) => t.text.toLowerCase().includes(q)).length : 0
  const channel = CHANNELS.find((p) => p.id === selected) ?? CHANNELS[0]

  return (
    <div className="board">
      {/* ---------- column 1 ---------- */}
      <div className="col col-1">
        <header className="page-head page-head--board">
          <h1 aria-label="Главная">
            <span className="word" aria-hidden="true">
              Главная
            </span>
          </h1>
        </header>
        <Tokenization />
        <PortfolioDonut portfolio={channel} />
        <div className="col-foot rise" style={{ '--d': 6 }}>
          <button className="ws-chip" onClick={() => go('reports')}>
            <span className="ws-logo">
              <Logo />
            </span>
            Отчёт за {HOTEL.day}
            <Icon name="arrowRight" />
          </button>
          <button className="peek" onClick={() => openTalk('c6')} aria-label="Открыть разговор: номер 401">
            <FileCard file={asCard('c6', 'pending', 'cream')} />
          </button>
        </div>
      </div>

      {/* ---------- column 2 ---------- */}
      <div className="col col-2">
        <FileCards files={[asCard('c4', 'review', 'white'), asCard('c1', 'pending', 'white')]} onOpen={openTalk} />
        <Savings />
        <Portfolios items={channels} selected={selected} onSelect={setSelected} query={q} />
      </div>

      {/* ---------- column 3 ---------- */}
      <div className="col col-3">
        <SearchBox value={query} onChange={setQuery} results={results} />
        <Tasks tasks={tasks} setTasks={setTasks} query={q} />
        <Team />
        <DealFlow />
      </div>
    </div>
  )
}
