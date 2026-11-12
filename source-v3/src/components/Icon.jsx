/* Thin 24×24 line icons (1.7 stroke) to match the reference. Add more to PATHS. */
const PATHS = {
  box: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </>
  ),
  statement: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="3" />
      <path d="M9 3.5V5h6V3.5M8.5 10h7M8.5 13.5h7M8.5 17h4" />
    </>
  ),
  projection: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M7.5 15.5 11 12l2.5 2.5 3.5-4.5M17 10v2.5M17 10h-2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c.8-3.9 3.9-6 7.5-6s6.7 2.1 7.5 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.6c1.7.8 2.8 2.6 3 5.4" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="14" r="6.5" />
      <path d="m9 3.5 3 3 3-3M9.5 3.5h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.4 3 7.7 7 9.5 4-1.8 7-5.1 7-9.5V6z" />
      <path d="M9.5 11.5h5M12 9v5" />
    </>
  ),
  piggy: (
    <>
      <path d="M5 11a6.5 5.5 0 0 1 11.5-3.4L19 6.5v3.4c.9.6 1.5 1.4 1.5 2.1v2h-2.2a6.6 6.6 0 0 1-2.3 2.3V20h-3v-1.6a8 8 0 0 1-3 0V20H7v-3.2A5.4 5.4 0 0 1 5 11z" />
      <circle cx="15.5" cy="10.5" r=".6" fill="currentColor" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  arrowDownLeft: <path d="M17 7 7 17M16 17H7V8" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 6.2 2.6 8 2.6 8H3.4S6 15.2 6 9" />
      <path d="M10.2 20.5a2 2 0 0 0 3.6 0" />
    </>
  ),
  share: (
    <>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
    </>
  ),
  export: (
    <>
      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5z" />
      <path d="M14 3.5v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5" />
    </>
  ),
  filter: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 4.5v5M10 14.5v5" />,
  doc: (
    <>
      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5z" />
      <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M16 3v4M8 3v4M3.5 10h17" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7.5V6a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h13a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H6" />
      <circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  trendDown: <path d="M3 7l6 6 4-4 8 8M15 17h6v-6" />,
  invoice: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 15.5h3.5" />
    </>
  ),
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />,
  printer: (
    <>
      <path d="M7 9V3.5h10V9M7 17.5H5a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1.5" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  trash: <path d="M4 6.5h16M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.2 6.5l.9 12.6A2 2 0 0 0 9.1 21h5.8a2 2 0 0 0 2-1.9l.9-12.6M10 11v5.5M14 11v5.5" />,
  edit: <path d="M4 20h4L19.3 8.7a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 7.5l2.9 2.9" />,
  logout: <path d="M14.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3.5M10 16.5 5.5 12 10 7.5M5.5 12H15" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  sparkle: <path d="M12 3.5 13.6 9a2 2 0 0 0 1.4 1.4l5.5 1.6-5.5 1.6a2 2 0 0 0-1.4 1.4L12 20.5l-1.6-5.5A2 2 0 0 0 9 13.6L3.5 12 9 10.4A2 2 0 0 0 10.4 9z" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  bolt: <path d="M13 2 3.5 14H12l-1 8 9.5-12H12z" />,
  cart: (
    <>
      <path d="M3 4h2.5l2.2 11.1A2 2 0 0 0 9.7 17h8.1a2 2 0 0 0 2-1.6L21 8H6.3" />
      <circle cx="10" cy="20.5" r="1.2" />
      <circle cx="17.5" cy="20.5" r="1.2" />
    </>
  ),
  shirt: <path d="M8 3.5 4 6l1.6 4 2.4-1V20.5h8V9l2.4 1L20 6l-4-2.5c-.6 1.4-2.2 2.4-4 2.4s-3.4-1-4-2.4z" />,
  laptop: (
    <>
      <rect x="4.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M2.5 19.5h19" />
    </>
  ),
  home: <path d="M3.5 10.4 12 3.6l8.5 6.8V19a2 2 0 0 1-2 2h-3.6v-6h-5.8v6H5.5a2 2 0 0 1-2-2z" />,
  car: (
    <>
      <path d="M5 16.5V12l2-5h10l2 5v4.5M3.5 12h17" />
      <circle cx="7.5" cy="16.5" r="1.8" />
      <circle cx="16.5" cy="16.5" r="1.8" />
    </>
  ),
  plane: <path d="M10.5 13.5 3 11l1.5-1.5 8 .5L17 5.5a2.1 2.1 0 0 1 3 3L15.5 13l.5 8L14.5 22.5 12 15" />,
  heart: <path d="M12 20.5s-7.3-4.4-9-9.1C1.8 8.1 3.9 4.8 7.3 4.8c2 0 3.5 1.1 4.7 2.9 1.2-1.8 2.7-2.9 4.7-2.9 3.4 0 5.5 3.3 4.3 6.6-1.7 4.7-9 9.1-9 9.1z" />,
  coffee: (
    <>
      <path d="M4 8.5h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2.5v3M12 2.5v3" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  bank: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.1" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
    </>
  ),
  moon: <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z" />,
  phone: <path d="M6.6 3.5h2.6l1.3 4-1.9 1.4a11 11 0 0 0 6.5 6.5l1.4-1.9 4 1.3v2.6a2 2 0 0 1-2.1 2A15.6 15.6 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" />,
  camera: (
    <>
      <rect x="3" y="7" width="13" height="10" rx="3" />
      <path d="m16 10.5 5-2.5v8l-5-2.5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3.5" />
      <path d="m4 8 8 5.5L20 8" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  message: <path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 3.5V17.5H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
};

export default function Icon({ name, size = 20, stroke = 1.7, className, style }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {PATHS[name] ?? PATHS.info}
    </svg>
  );
}
