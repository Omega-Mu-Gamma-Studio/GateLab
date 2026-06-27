/**
 * ControlPanel.jsx  →  WorkOrderBar
 *
 * The horizontal strip below the TopBar.
 * Layout (left → right):
 *   [ WO-0047 · Deck 7 · Bay 4 ]    ● ● ●    [ Next → ]
 *
 * - Left:   work order metadata from lessonStore.meta
 * - Centre: three-dot phase trail (read-only progress indicator)
 * - Right:  single CTA button — label changes per phase, glows on success
 */
import { useLessonStore } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'

const PHASES = ['work', 'break', 'try']

const CTA_LABELS = {
  work:  'See It Break →',
  break: 'You Try →',
  try:   'Next Lesson →',
}

export default function WorkOrderBar() {
  const { phase, meta, nextPhase, nextLesson, activeUnitId, activeLessonIdx } = useLessonStore()
  const lessonSolved = useCanvasStore(s => s.lessonSolved)

  if (!activeUnitId) return null

  const ctaLabel  = CTA_LABELS[phase]
  const isLastPhase = phase === 'try'
  const glowing   = isLastPhase && lessonSolved

  function handleCta() {
    if (isLastPhase) {
      nextLesson()
    } else {
      nextPhase()
    }
  }

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
      {/* Left: work order metadata */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        letterSpacing: '0.07em',
        minWidth: 0,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {meta ? (
          <>
            <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>{meta.workOrder}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{meta.location}</span>
            {meta.shift && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{meta.shift}</span>
              </>
            )}
          </>
        ) : (
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {/* Fallback if narrative not written yet */}
          </span>
        )}
      </div>

      {/* Centre: three-dot phase trail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {PHASES.map(p => {
          const isCurrent = p === phase
          const isPast    = PHASES.indexOf(p) < PHASES.indexOf(phase)
          return (
            <div
              key={p}
              style={{
                width: isCurrent ? '20px' : '7px',
                height: '7px',
                borderRadius: '999px',
                background: isCurrent
                  ? 'var(--accent)'
                  : isPast
                    ? 'var(--accent-border)'
                    : 'var(--border-strong)',
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? '0 0 8px var(--accent-glow)' : 'none',
              }}
            />
          )
        })}
      </div>

      {/* Right: CTA button */}
      <button
        onClick={handleCta}
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          padding: '6px 14px',
          borderRadius: '7px',
          border: '1px solid',
          cursor: 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
          background: glowing ? 'var(--accent)' : 'var(--accent-dim)',
          borderColor: glowing ? 'var(--accent)' : 'var(--accent-border)',
          color: glowing ? 'var(--bg)' : 'var(--accent-text)',
          boxShadow: glowing ? '0 0 18px var(--accent-glow)' : 'none',
        }}
      >
        {glowing ? '✓ ' : ''}{ctaLabel}
      </button>
    </div>
  )
}