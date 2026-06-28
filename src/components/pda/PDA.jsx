/**
 * PDA.jsx
 *
 * The modal shell. Phone frame, status bar, home indicator.
 * Routes between HomeScreen and the five app screens.
 *
 * Navigation model:
 *   pdaView === 'home'  → HomeScreen (icon grid)
 *   pdaView === 'app'   → AppShell wrapping the active app component
 *
 * Apps:
 *   comm    → MessagesTab  (crew messages, Ada rapport)
 *   tasks   → TasksApp     (active work order — replaces PlotBox)
 *   gallery → PhotosTab
 *   crew    → ContactsTab
 *   logs    → NotesTab
 *
 * Opens from TopBar PDA button (lands on home) or via pdaStore.openApp(id).
 * Closes on backdrop click, X button, or Escape.
 */
import { useEffect } from 'react'
import usePdaStore from '../../store/pdaStore'
import HomeScreen  from './HomeScreen'
import TasksApp    from './TasksApp'
import AppShell    from './AppShell'
import MessagesTab from './MessagesTab'
import PhotosTab   from './PhotosTab'
import ContactsTab from './ContactsTab'
import NotesTab    from './NotesTab'

function AppRouter({ activeApp }) {
  switch (activeApp) {
    case 'comm':    return <AppShell appId="comm"><MessagesTab /></AppShell>
    case 'tasks':   return <TasksApp />
    case 'gallery': return <AppShell appId="gallery"><PhotosTab /></AppShell>
    case 'crew':    return <AppShell appId="crew"><ContactsTab /></AppShell>
    case 'logs':    return <AppShell appId="logs"><NotesTab /></AppShell>
    default:        return <TasksApp />
  }
}

export default function PDA() {
  const { pdaOpen, pdaView, activeApp, closePda } = usePdaStore()

  // Close on Escape
  useEffect(() => {
    if (!pdaOpen) return
    function handler(e) { if (e.key === 'Escape') closePda() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pdaOpen, closePda])

  if (!pdaOpen) return null

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePda}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Phone frame */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 301,
          width: 'min(88vw, 390px)',
          height: 'min(92vh, 780px)',
          background: '#080b08',
          border: '6px solid #1c221c',
          borderRadius: '44px',
          boxShadow: [
            '0 40px 100px rgba(0,0,0,0.8)',
            '0 0 0 1px rgba(255,77,94,0.15)',
            'inset 0 0 0 1px rgba(255,255,255,0.04)',
          ].join(', '),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top pill / notch */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          paddingTop: '10px', paddingBottom: '2px', flexShrink: 0,
        }}>
          <div style={{
            width: '120px', height: '30px', borderRadius: '20px',
            background: '#0e120e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a201a' }} />
            <div style={{ width: '36px', height: '6px', borderRadius: '3px', background: '#141814' }} />
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '4px 22px 6px 22px',
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          flexShrink: 0,
        }}>
          <span>{timeStr}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Signal bars */}
            <svg width="14" height="10" viewBox="0 0 14 10">
              {[0,1,2,3].map(i => (
                <rect key={i}
                  x={i * 3.5} y={10 - (i+1)*2.2 - 0.4}
                  width="2.4" height={(i+1)*2.2}
                  rx="0.6"
                  fill={i < 3 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}
                />
              ))}
            </svg>
            {/* Battery */}
            <svg width="20" height="11" viewBox="0 0 20 11">
              <rect x="0" y="1" width="16" height="9" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
              <rect x="16.5" y="3.5" width="2" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
              <rect x="1.5" y="2.5" width="9" height="6" rx="1" fill="rgba(255,255,255,0.35)"/>
            </svg>
          </div>
        </div>

        {/* App header row — only in app view */}
        {pdaView === 'app' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '2px 16px 6px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}>
            <button
              onClick={closePda}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', lineHeight: 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,77,94,0.15)'
                e.currentTarget.style.color = '#ff4d5e'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Home screen header — only in home view */}
        {pdaView === 'home' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 18px 8px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#ff4d5e',
                boxShadow: '0 0 8px rgba(255,77,94,0.6)',
              }}/>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em',
              }}>
                DECK-7 PDA
              </span>
            </div>
            <button
              onClick={closePda}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', lineHeight: 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,77,94,0.15)'
                e.currentTarget.style.color = '#ff4d5e'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pdaView === 'home'
            ? <HomeScreen />
            : <AppRouter activeApp={activeApp} />
          }
        </div>

        {/* Home indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '8px 0 10px 0', flexShrink: 0,
        }}>
          <div style={{
            width: '100px', height: '4px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.12)',
            cursor: pdaView === 'app' ? 'pointer' : 'default',
          }}
            onClick={() => {
              if (pdaView === 'app') usePdaStore.getState().goHome()
            }}
            title={pdaView === 'app' ? 'Home' : undefined}
          />
        </div>
      </div>
    </>
  )
}