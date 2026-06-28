/**
 * AppShell.jsx
 *
 * Shared wrapper for every PDA app screen.
 * Renders the app header (back chevron + app name) and slots the
 * app content beneath it. Keeps each app's JSX clean — no boilerplate.
 */
import usePdaStore from '../../store/pdaStore'

const APP_LABELS = {
  comm:    'COMM',
  tasks:   'TASKS',
  gallery: 'GALLERY',
  crew:    'CREW',
  logs:    'LOGS',
}

const APP_COLORS = {
  comm:    '#ff4d5e',
  tasks:   '#f5c400',
  gallery: 'rgba(255,255,255,0.6)',
  crew:    '#6699ff',
  logs:    '#44cc88',
}

export default function AppShell({ appId, children }) {
  const { goHome } = usePdaStore()
  const label = APP_LABELS[appId] || appId.toUpperCase()
  const color = APP_COLORS[appId] || 'var(--text-muted)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 18px 10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {/* Back chevron */}
        <button
          onClick={goHome}
          style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,1 2,5 6,9"/>
          </svg>
        </button>

        {/* Accent dot + app name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            flexShrink: 0,
          }}/>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
            color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em',
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* App content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}