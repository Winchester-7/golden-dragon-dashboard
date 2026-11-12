import { useState } from 'react';
import { useApp } from '../app/store';
import Icon from '../components/Icon';
import Player from '../components/Player';
import { Avatar, Dropdown, Empty, PageHead, Segmented } from '../components/ui';
import { TALKS, isBad, talkWhere } from '../data/hotel';
import { cx, downloadCsv, num1 } from '../lib/format';
import StatCard from '../widgets/StatCard';

const FILTERS = [
  { id: 'all', label: 'Все', test: () => true },
  { id: 'call', label: 'Звонки', test: (t) => t.kind === 'call' },
  { id: 'desk', label: 'Беседы у стойки', test: (t) => t.kind === 'desk' },
  { id: 'bad', label: 'Проблемные', test: isBad },
];
const SORTS = [
  { value: 'time', label: 'Сначала новые' },
  { value: 'low', label: 'Сначала низкая оценка' },
  { value: 'high', label: 'Сначала высокая оценка' },
];
const SORT_BY = { time: (a, b) => b.time.localeCompare(a.time), low: (a, b) => a.score - b.score, high: (a, b) => b.score - a.score };

/** Разговоры: звонки из номеров и беседы у стойки с записью и оценкой ИИ. */
export default function Talks() {
  const { openModal, toast } = useApp();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('time');

  const f = FILTERS.find((x) => x.id === filter);
  const q = query.trim().toLowerCase();
  const rows = TALKS.filter((t) => f.test(t) && (!q || `${t.admin} ${t.place} ${t.summary}`.toLowerCase().includes(q))).sort(SORT_BY[sort]);
  const bad = TALKS.filter(isBad);
  const avg = TALKS.reduce((a, t) => a + t.score, 0) / TALKS.length;

  const exportCsv = () => {
    downloadCsv('razgovory.csv', [['Время', 'Где', 'Администратор', 'Оценка', 'Длительность', 'Суть'], ...rows.map((t) => [t.time, talkWhere(t), t.admin, t.score, t.dur, t.summary])]);
    toast({ title: 'Список выгружен', text: `${rows.length} разговоров · razgovory.csv`, icon: 'download' });
  };

  return (
    <>
      <PageHead title="Разговоры с гостями" crumbs={['Обзор', 'Разговоры']}>
        <button type="button" className="btn sm outline" onClick={exportCsv}>
          <Icon name="download" size={16} /> Выгрузить
        </button>
        <button type="button" className="btn sm blue shine" onClick={() => setFilter('bad')}>
          <Icon name="alert" size={16} /> Проблемные
        </button>
      </PageHead>

      <div className="page">
        <div className="stats">
          <StatCard d="0ms" icon="phone" label="Разговоров за сутки" value={57} note="31 звонок из номеров и 26 бесед у стойки" tone="dark" />
          <StatCard d="70ms" icon="alert" label="Проблемные" value={bad.length} note="Жалобы, грубость, нерешённые просьбы" />
          <StatCard d="140ms" icon="sparkle" label="Средняя оценка ИИ" value={avg} format={num1} note="по 10-балльной шкале" />
          <StatCard d="210ms" icon="mic" label="Записей" value={57} note="Каждый разговор можно прослушать" />
        </div>

        <section className="card" style={{ '--d': '280ms' }}>
          <header className="card-head rv" style={{ '--i': 0 }}>
            <Segmented size="sm" label="Вид разговора" items={FILTERS.map((x) => ({ value: x.id, label: `${x.label} ${TALKS.filter(x.test).length}` }))} value={filter} onChange={setFilter} />
            <div className="card-actions">
              <label className="search search--sm">
                <Icon name="search" size={16} />
                <input className="input" type="search" placeholder="Поиск: номер, имя, тема…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Поиск по разговорам" />
              </label>
              <Dropdown value={sort} options={SORTS} onChange={setSort} label="Порядок" />
            </div>
          </header>

          <div className="inv-table tk-table" role="table" aria-label="Разговоры">
            <div className="inv-row inv-headrow rv" role="row" style={{ '--i': 1 }}>
              <span role="columnheader">Администратор</span>
              <span role="columnheader">Разговор</span>
              <span role="columnheader">Запись</span>
              <span role="columnheader">Гость</span>
              <span role="columnheader">Оценка</span>
              <span role="columnheader">Итог</span>
              <span />
            </div>
            <div key={`${filter}/${sort}/${q}`}>
              {rows.map((t, k) => (
                <div key={t.id} className="inv-row rv" role="row" tabIndex={0} style={{ '--i': Math.min(k, 8) + 2 }} onClick={() => openModal('talk', { id: t.id })} onKeyDown={(e) => e.key === 'Enter' && openModal('talk', { id: t.id })}>
                  <span className="inv-client" role="cell">
                    <Avatar name={t.admin} size={38} />
                    <span>
                      <strong>{t.admin}</strong>
                      <em>
                        {t.time} · {t.time >= '08:00' && t.time < '20:00' ? 'дневная смена' : 'ночная смена'}
                      </em>
                    </span>
                  </span>
                  <span className="inv-id" role="cell">
                    <strong>{talkWhere(t)}</strong>
                    <em>{t.summary}</em>
                  </span>
                  <span role="cell">
                    <Player id={t.id} dur={t.dur} compact />
                  </span>
                  <span role="cell" className={cx('inv-due', isBad(t) && t.score < 5 && 'late')}>
                    {t.mood}
                  </span>
                  <strong role="cell" className={cx('inv-amt', t.score < 5 && 'low')}>
                    {t.score} из 10
                  </strong>
                  <span role="cell">
                    <span className={cx('chip', isBad(t) ? 'red' : 'green')}>
                      <i className="dot" style={{ '--c': 'currentColor' }} />
                      {isBad(t) ? t.flags[0] : 'Хорошо'}
                    </span>
                  </span>
                  <span role="cell" className="inv-act">
                    <Icon name="chevronRight" size={16} />
                  </span>
                </div>
              ))}
            </div>
          </div>
          {rows.length === 0 && <Empty icon="phone" title="Ничего не найдено" text="Измените фильтр или строку поиска." />}
        </section>
      </div>
    </>
  );
}
