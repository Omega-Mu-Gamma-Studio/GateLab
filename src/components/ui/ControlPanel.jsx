import { useLessonStore, UNITS } from '../../store/lessonStore'
import PhaseIndicator from './PhaseIndicator'

export default function ControlPanel({ onOpenDrawer }) {
  const { activeUnitId, activeLessonIdx } = useLessonStore()
  const unit = UNITS.find(u => u.id === activeUnitId)
  const hasPanel = unit?.panels?.length > 0

  return (
    <div style={{
      height: '44px',
      background: 'var(--surface-2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      gap: '12px',
    }}>
      {/* Left: phase stepper */}
      <PhaseIndicator />

      {/* Right: drawer toggle */}
      <button
        onClick={onOpenDrawer}
        title={hasPanel ? 'Open panels' : 'Open trivia'}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', borderRadius: '7px',
          border: '1px solid var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent-border)'
          e.currentTarget.style.color = 'var(--accent-text)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        {hasPanel ? 'Panels' : '✦ Trivia'}
      </button>
    </div>
  )
}