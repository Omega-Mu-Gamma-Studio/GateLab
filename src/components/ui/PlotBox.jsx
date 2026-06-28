/**
 * PlotBox.jsx
 *
 * Canvas-corner PDA trigger button. Always visible when a lesson is active.
 * Opens the full PDA home screen (not just TASKS) — the PDA is the primary
 * way to access work orders, messages, and crew comms.
 *
 * Positioned top-left of the canvas area. zIndex 100 ensures it sits above
 * the Konva Stage which captures pointer events across its full surface.
 *
 * Shows a red unread badge when there are unread messages.
 * Pulses when there are unread messages or a new task is loaded.
 */
import usePdaStore from '../../store/pdaStore'
import { useLessonStore } from '../../store/lessonStore'

export default function PlotBox() {
  const { openPda, totalUnread, currentTask } = usePdaStore()
  const { activeUnitId } = useLessonStore()
  const unread = totalUnread()
  const hasActivity = unread > 0 || !!currentTask

  // Only show when inside a lesson
  if (!activeUnitId) return null

  return (
    <button
      onClick={() => openPda()}
      title="Open PDA"
      style={{
        position: 'absolute', top: '16px', left: '16px', zIndex: 100,
        width: '44px', height: '44px', borderRadius: '12px',
        background: 'rgba(10,13,10,0.90)',
        border: '1px solid rgba(255,77,94,0.45)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(255,77,94,0.18), 0 0 0 1px rgba(255,255,255,0.03)',
        transition: 'all 0.2s',
        // Force above Konva canvas
        pointerEvents: 'all',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,77,94,0.8)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,77,94,0.32), 0 0 0 1px rgba(255,255,255,0.05)'
        e.currentTarget.style.background = 'rgba(255,77,94,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,77,94,0.45)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,77,94,0.18), 0 0 0 1px rgba(255,255,255,0.03)'
        e.currentTarget.style.background = 'rgba(10,13,10,0.90)'
      }}
    >
      {/* Phone icon */}
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="#ff4d5e" strokeWidth="1.9"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 5px rgba(255,77,94,0.5))' }}
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>

      {/* Unread badge */}
      {unread > 0 && (
        <div style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#ff4d5e',
          boxShadow: '0 0 7px rgba(255,77,94,0.9)',
          animation: 'pda-btn-pulse 1.8s ease-in-out infinite',
        }}/>
      )}

      {/* Pulse ring when active but no unread */}
      {unread === 0 && hasActivity && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#f5c400',
          boxShadow: '0 0 5px rgba(245,196,0,0.7)',
          animation: 'pda-btn-pulse 2.4s ease-in-out infinite',
        }}/>
      )}

      <style>{`
        @keyframes pda-btn-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </button>
  )
}