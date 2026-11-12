import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Boot from './components/Boot'
import CommandPalette from './components/CommandPalette'
import TalkDetails from './components/TalkDetails'
import ShiftDetails from './components/ShiftDetails'
import { Logo } from './components/Icon'
import { Drawer, FormModal } from './components/kit'
import { Modal, Toasts } from './components/ui'
import { AppContext, IntroContext, uid } from './lib/store'
import { useMedia, useStored } from './lib/hooks'
import { BOOT_BASE, BOOT_MS, prefersReduced } from './lib/motion'
import { CHATS, MAILS, ME, PAGES, TALKS, isBad, seedTasks } from './data/hotel'
import { shiftById } from './data/shifts'

import Dashboard from './pages/Dashboard'
import TalksPage from './pages/TalksPage'
import Records from './pages/Records'
import WhatsApp from './pages/WhatsApp'
import MailPage from './pages/MailPage'
import Booking from './pages/Booking'
import Reports from './pages/Reports'
import Shifts from './pages/Shifts'
import Camera from './pages/Camera'
import Phone from './pages/Phone'
import Settings from './pages/Settings'

const AllTalks = () => <TalksPage mode="all" />
const DeskTalks = () => <TalksPage mode="desk" />
const Problems = () => <TalksPage mode="bad" />

/** One page per sidebar tab. */
const ROUTES = {
  dashboard: Dashboard,
  shifts: Shifts,
  camera: Camera,
  phone: Phone,
  reports: Reports,
  talks: AllTalks,
  desk: DeskTalks,
  problems: Problems,
  records: Records,
  whatsapp: WhatsApp,
  mail: MailPage,
  booking: Booking,
  settings: Settings,
}

const pageFromHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return id in ROUTES ? id : 'dashboard'
}

/**
 * One page. It remounts on every tab change, so its cards land again.
 * It remembers whether it mounted during the intro, so the intro styles never swap mid-way.
 */
function Main({ page: Page, booting, params }) {
  const [boot] = useState(booting)
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), boot ? BOOT_MS : 1700)
    return () => window.clearTimeout(t)
  }, [boot])
  return (
    <main className={`main ${settled ? 'settled' : ''} ${boot ? 'is-boot' : ''}`} style={{ '--base': boot ? `${BOOT_BASE}ms` : '0ms' }}>
      <IntroContext.Provider value={boot}>
        <Page params={params} />
      </IntroContext.Provider>
    </main>
  )
}

export default function App() {
  /* ---------- preferences ---------- */
  const [collapsedPref, setCollapsed] = useStored('v28-collapsed', false)
  const [density, setDensity] = useStored('v28-density', 'default')
  const [motion, setMotion] = useStored('v28-motion', 'full')
  const narrow = useMedia('(max-width: 860px)')
  const collapsed = narrow || collapsedPref
  useEffect(() => {
    document.documentElement.dataset.density = density
  }, [density])
  useEffect(() => {
    document.documentElement.dataset.motion = motion
  }, [motion])

  /* ---------- intro (plays on load, and again from Settings or after signing back in) ---------- */
  const [bootKey, setBootKey] = useState(0)
  const [booting, setBooting] = useState(() => !prefersReduced())
  useEffect(() => {
    if (!booting) return undefined
    const t = window.setTimeout(() => setBooting(false), BOOT_MS)
    return () => window.clearTimeout(t)
  }, [booting, bootKey])

  /* ---------- routing: #/talks, with back/forward support ---------- */
  const [route, setRoute] = useState(() => ({ page: pageFromHash(), params: {}, n: 0, intro: true }))
  const go = useCallback((page, params = {}) => {
    if (!(page in ROUTES)) return
    setRoute((r) => (r.page === page && !Object.keys(params).length ? r : { page, params, n: r.n + 1, intro: false }))
    if (window.location.hash !== `#/${page}`) window.history.pushState(null, '', `#/${page}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  useEffect(() => {
    const onPop = () => setRoute((r) => ({ page: pageFromHash(), params: {}, n: r.n + 1, intro: false }))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /* the browser tab follows the page */
  useEffect(() => {
    const label = PAGES.find((p) => p.id === route.page)?.label ?? 'Главная'
    document.title = `${label} · Golden Dragon`
  }, [route.page])

  const replayIntro = useCallback(() => {
    if (prefersReduced()) return
    window.scrollTo(0, 0)
    setBooting(true)
    setBootKey((k) => k + 1)
    setRoute((r) => ({ ...r, n: r.n + 1, intro: true }))
  }, [])

  /* ---------- toasts ---------- */
  const [toasts, setToasts] = useState([])
  const dismiss = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])
  const toast = useCallback(
    (t) => {
      const id = uid('toast')
      setToasts((ts) => [...ts.slice(-2), { id, ...(typeof t === 'string' ? { text: t } : t) }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  /* ---------- data shared across pages ---------- */
  const [tasks, setTasks] = useState(seedTasks)
  const [selected, setSelected] = useState('calls')
  const [openTalkId, setOpenTalkId] = useState(null)
  const [openShiftId, setOpenShiftId] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [shared, setShared] = useState({})

  /* ---------- command palette (Ctrl+K) ---------- */
  const [palette, setPalette] = useState(false)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---------- sign out ---------- */
  const [confirmOut, setConfirmOut] = useState(false)
  const [signedOut, setSignedOut] = useState(false)

  const counts = {
    talks: TALKS.length,
    desk: TALKS.filter((t) => t.kind === 'desk').length,
    problems: TALKS.filter(isBad).length,
    wa: CHATS.filter((c) => c.flag).length,
    mail: MAILS.filter((m) => m.flag).length,
  }

  const ctx = useMemo(
    () => ({
      go,
      page: route.page,
      booting,
      toast,
      replayIntro,
      openPalette: () => setPalette(true),
      prefs: { density, setDensity, motion, setMotion },
      collapsed,
      setCollapsed,
      me: ME,
      tasks,
      setTasks,
      selected,
      setSelected,
      openTalk: setOpenTalkId,
      openShift: setOpenShiftId,
      playing,
      setPlaying,
      shared,
      setShared,
    }),
    [go, route.page, booting, toast, replayIntro, density, setDensity, motion, setMotion, collapsed, setCollapsed, tasks, selected, playing, shared],
  )

  if (signedOut) {
    return (
      <div className="signed-out">
        <div className="so-card">
          <Logo />
          <h2>Вы вышли из панели</h2>
          <p>Данные в безопасности. Войти снова можно в любой момент.</p>
          <button
            className="btn btn--primary"
            onClick={() => {
              setSignedOut(false)
              go('dashboard')
              replayIntro()
            }}
          >
            Войти снова
          </button>
        </div>
      </div>
    )
  }

  const Page = ROUTES[route.page]

  return (
    <AppContext.Provider value={ctx}>
      {booting && <Boot key={`boot-${bootKey}`} />}
      <div className={`app ${booting ? 'is-booting' : ''}`} key={`app-${bootKey}`}>
        <div className={`frame ${collapsed ? 'is-collapsed' : ''}`}>
          <Sidebar
            collapsed={collapsed}
            canCollapse={!narrow}
            onToggle={() => setCollapsed((c) => !c)}
            active={route.page}
            onNavigate={go}
            counts={counts}
            me={ME}
            onSignOut={() => setConfirmOut(true)}
          />
          <div className="panel">
            <Main key={`${route.page}-${route.n}`} page={Page} booting={booting && route.intro} params={route.params} />
          </div>
        </div>
        <Toasts items={toasts} onDismiss={dismiss} />
      </div>

      {palette && <CommandPalette onClose={() => setPalette(false)} />}

      {openTalkId && (
        <Drawer
          label="Разбор разговора"
          width="36rem"
          onClose={() => {
            setOpenTalkId(null)
            setPlaying(null)
          }}
        >
          {(close) => <TalkDetails talk={TALKS.find((t) => t.id === openTalkId)} close={close} />}
        </Drawer>
      )}

      {openShiftId && (
        <Drawer label="Отчёт за смену" width="38rem" onClose={() => setOpenShiftId(null)}>
          {(close) => <ShiftDetails shift={shiftById(openShiftId)} close={close} />}
        </Drawer>
      )}

      {confirmOut && (
        <Modal label="Выход" onClose={() => setConfirmOut(false)}>
          {(close) => (
            <FormModal
              title="Выйти из панели?"
              sub="Войти снова можно в любой момент."
              icon="logout"
              danger
              submitLabel="Выйти"
              close={close}
              onSubmit={() => {
                close()
                window.setTimeout(() => setSignedOut(true), 220)
              }}
            />
          )}
        </Modal>
      )}
    </AppContext.Provider>
  )
}
