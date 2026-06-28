/**
 * PDA.jsx
 *
 * The modal shell. Renders the phone frame as a full-screen overlay,
 * manages tab navigation, and mounts the four content tabs.
 *
 * Phone anatomy:
 *   - Status bar: time, signal, battery (cosmetic)
 *   - Tab bar: Messages · Photos · Contacts · Notes
 *   - Content area: the active tab component
 *   - Home indicator at bottom
 *
 * Opens from the TopBar PDA button or from anywhere via pdaStore.openPda().
 * Closes on backdrop click or the X button.
 *
 * Unread badges come from pdaStore.unread — shown on the Messages tab icon
 * and on the TopBar trigger button.
 */
import { useEffect } from 'react'
import usePdaStore from '../../store/pdaStore'
import MessagesTab   from './MessagesTab'
import PhotosTab     from './PhotosTab'
import ContactsTab   from './ContactsTab'
import NotesTab      from './NotesTab'

const TABS = [
  { id: 'messages',  label: 'Messages',  icon: MessageIcon  },
  { id: 'photos',    label: 'Photos',    icon: PhotoIcon    },
  { id: 'contacts',  label: 'Contacts',  icon: ContactIcon  },
  { id: 'notes',     label: 'Notes',     icon: NotesIcon    },
]

// ── SVG tab icons ─────────────────────────────────────────────────────────
function MessageIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#ff4d5e' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function PhotoIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#ff4d5e' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function ContactIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#ff4d5e' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function NotesIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#ff4d5e' : 'currentColor'} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

export default function PDA() {
  const { pdaOpen, activeTab, unread, closePda, setTab, totalUnread } = usePdaStore()
  const unreadCount = totalUnread()

  // Close on Escape
  useEffect(() => {
    if (!pdaOpen) return
    function handler(e) { if (e.key === 'Escape') closePda() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pdaOpen, closePda])

  if (!pdaOpen) return null

  // Current time for status bar
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false
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
            {/* Tiny camera dot */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a201a' }} />
            {/* Pill sensor */}
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

        {/* App header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 20px 10px 20px',
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
              fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600,
              color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em',
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

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const tabUnread = tab.id === 'messages' ? unreadCount : 0
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                style={{
                  flex: 1, padding: '10px 0 9px 0',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '3px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative',
                  borderBottom: `2px solid ${isActive ? '#ff4d5e' : 'transparent'}`,
                  transition: 'border-color 0.2s',
                }}
              >
                <tab.icon active={isActive} />
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: '9px',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: isActive ? '#ff4d5e' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.2s',
                }}>
                  {tab.label}
                </span>
                {tabUnread > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '18%',
                    background: '#ff4d5e',
                    color: '#0a0d0a',
                    fontFamily: 'var(--mono)',
                    fontSize: '8px', fontWeight: 700,
                    borderRadius: '99px',
                    padding: '1px 5px',
                    minWidth: '14px', textAlign: 'center',
                  }}>
                    {tabUnread > 9 ? '9+' : tabUnread}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content area — scrolls internally per tab */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'messages'  && <MessagesTab />}
          {activeTab === 'photos'    && <PhotosTab />}
          {activeTab === 'contacts'  && <ContactsTab />}
          {activeTab === 'notes'     && <NotesTab />}
        </div>

        {/* Home indicator */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '8px 0 10px 0', flexShrink: 0,
        }}>
          <div style={{
            width: '100px', height: '4px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.12)',
          }} />
        </div>
      </div>
    </>
  )
}