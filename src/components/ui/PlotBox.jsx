/**
 * PlotBox.jsx
 *
 * Retired as a standalone overlay. The work order content now lives in
 * the PDA's TASKS app (TasksApp.jsx), fed by pdaStore.currentTask.
 *
 * This file now renders only a persistent canvas-corner shortcut button
 * that opens the PDA directly to TASKS — so the player always has a
 * one-tap path to their current work order from the circuit canvas.
 *
 * Shows a yellow pulse dot when there's an active task.
 * Hidden when no lesson is loaded.
 */
import usePdaStore from '../../store/pdaStore'

export default function PlotBox() {
  const { currentTask, openApp } = usePdaStore()

  if (!currentTask) return null

  return (
    <button
      onClick={() => openApp('tasks')}
      title="Open work order"
      style={{
        position: 'absolute', top: '16px', left: '16px', zIndex: 60,
        width: '38px', height: '38px', borderRadius: '10px',
        background: 'rgba(10,13,10,0.85)',
        border: '1px solid rgba(245,196,0,0.35)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px rgba(245,196,0,0.12)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(245,196,0,0.65)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,196,0,0.22)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(245,196,0,0.35)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,196,0,0.12)'
      }}
    >
      {/* Clipboard / task icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="#f5c400" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>

      {/* Active pulse dot */}
      <div style={{
        position: 'absolute', top: '7px', right: '7px',
        width: '5px', height: '5px', borderRadius: '50%',
        background: '#f5c400',
        boxShadow: '0 0 5px #f5c400',
        animation: 'pda-pulse 2s ease-in-out infinite',
      }}/>

      <style>{`
        @keyframes pda-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </button>
  )
}