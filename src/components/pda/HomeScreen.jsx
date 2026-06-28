/**
 * HomeScreen.jsx
 *
 * The PDA home screen. Renders the ship status strip, a 2×2 icon grid
 * with TASKS centered below, and one locked placeholder slot.
 *
 * App icons:
 *   COMM     — crew messages (Ada, Reyes, Voss, MAINT-SYS)
 *   TASKS    — active work order (replaces PlotBox)
 *   GALLERY  — photos received
 *   CREW     — contact cards
 *   LOGS     — auto-generated lesson notes
 *   [LOCKED] — future story content
 *
 * Icon aesthetic: dark pill bg, flat glyph in accent color,
 * monospace all-caps label, red unread dot top-right.
 */
import usePdaStore from '../../store/pdaStore'

// ── Ship status strip ────────────────────────────────────────────────────
function StatusStrip() {
  const now = new Date()
  const cycle = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  return (
    <div style={{
      margin: '10px 16px 18px 16px',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
      fontFamily: 'var(--mono)', fontSize: '9px',
      color: 'rgba(255,255,255,0.22)',
      letterSpacing: '0.05em',
      lineHeight: 1.8,
    }}>
      <div>VESSEL&nbsp;&nbsp;: AETHER-9</div>
      <div>ALERT&nbsp;&nbsp;&nbsp;: <span style={{ color: '#44cc88' }}>NOMINAL</span></div>
      <div>CYCLE&nbsp;&nbsp;&nbsp;: {cycle}</div>
    </div>
  )
}

// ── App icon ─────────────────────────────────────────────────────────────
function AppIcon({ appId, label, color, glyph, unread = 0, locked = false, onClick }) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      title={locked ? 'LOCKED' : label}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '7px',
        padding: '14px 8px 10px 8px',
        borderRadius: '14px',
        background: locked
          ? 'rgba(255,255,255,0.02)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${locked
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.07)'}`,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all 0.18s',
        opacity: locked ? 0.45 : 1,
        minWidth: 0,
      }}
      onMouseEnter={e => {
        if (locked) return
        e.currentTarget.style.background = `rgba(${hexToRgb(color)}, 0.08)`
        e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)}, 0.25)`
      }}
      onMouseLeave={e => {
        if (locked) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {/* Glyph */}
      <div style={{
        width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: locked ? 'rgba(255,255,255,0.15)' : color,
        filter: locked ? 'none' : `drop-shadow(0 0 5px ${color}44)`,
      }}>
        {glyph}
      </div>

      {/* Label */}
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '8px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: locked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)',
      }}>
        {locked ? '[LOCKED]' : label}
      </span>

      {/* Unread dot */}
      {unread > 0 && !locked && (
        <div style={{
          position: 'absolute', top: '8px', right: '10px',
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#ff4d5e',
          boxShadow: '0 0 6px rgba(255,77,94,0.7)',
        }}/>
      )}
    </button>
  )
}

// Convert #rrggbb to "r, g, b" for rgba()
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

// ── Glyphs ────────────────────────────────────────────────────────────────
const CommGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const TasksGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)
const GalleryGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const CrewGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const LogsGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const LockedGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

// ── HomeScreen ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { openApp, unread, currentTask } = usePdaStore()
  const commUnread = Object.values(unread).reduce((a, b) => a + b, 0)
  const hasTask = !!currentTask

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusStrip />

      {/* Icon grid */}
      <div style={{ padding: '0 16px', flex: 1 }}>

        {/* Row 1: COMM + GALLERY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <AppIcon
            appId="comm" label="COMM" color="#ff4d5e"
            glyph={<CommGlyph />} unread={commUnread}
            onClick={() => openApp('comm')}
          />
          <AppIcon
            appId="gallery" label="GALLERY" color="rgba(200,200,220,0.9)"
            glyph={<GalleryGlyph />}
            onClick={() => openApp('gallery')}
          />
        </div>

        {/* Row 2: CREW + LOGS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <AppIcon
            appId="crew" label="CREW" color="#6699ff"
            glyph={<CrewGlyph />}
            onClick={() => openApp('crew')}
          />
          <AppIcon
            appId="logs" label="LOGS" color="#44cc88"
            glyph={<LogsGlyph />}
            onClick={() => openApp('logs')}
          />
        </div>

        {/* Row 3: TASKS centered + LOCKED */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <AppIcon
            appId="tasks" label="TASKS" color="#f5c400"
            glyph={<TasksGlyph />}
            unread={hasTask ? 1 : 0}
            onClick={() => openApp('tasks')}
          />
          <AppIcon
            appId="locked" label="" color="#555"
            glyph={<LockedGlyph />}
            locked={true}
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{
        padding: '12px 0 6px 0',
        textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.1)',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        DECK-7 PDA · AETHER-9
      </div>
    </div>
  )
}