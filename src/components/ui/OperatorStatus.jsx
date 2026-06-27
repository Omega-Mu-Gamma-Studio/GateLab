/**
 * OperatorStatus.jsx
 *
 * A persistent footer pinned to the bottom of the InfoPanel, visible no
 * matter which tab (Trivia / Timing / State / Verilog) is active above it.
 *
 * Exists to fill the dead space that opened up at the bottom-right of the
 * screen once the InfoPanel became a tall 20vw column — short trivia text
 * or a "coming soon" placeholder no longer stretches to fill the height.
 *
 * Shows:
 *   - Operator level + XP progress bar (from progressStore)
 *   - Completion count for the active unit ("3 / 10 lessons")
 *   - Best speed-run time for the current lesson, if one's been set
 *
 * Ties back into the ship-dispatch theme already used elsewhere
 * (work orders, incident reports, dispatch terminal).
 */
import useProgressStore from '../../store/progressStore'
import { useLessonStore, UNITS } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'

function formatTime(ms) {
  const s = ms / 1000
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

export default function OperatorStatus() {
  const level            = useProgressStore(s => s.level)
  const getLevelProgress = useProgressStore(s => s.getLevelProgress)
  const getXPToNextLevel = useProgressStore(s => s.getXPToNextLevel)
  const completedLessons = useProgressStore(s => s.completedLessons)

  const activeUnitId = useLessonStore(s => s.activeUnitId)
  const meta          = useLessonStore(s => s.meta)
  const bestTimes      = useCanvasStore(s => s.bestTimes)

  const unit = UNITS.find(u => u.id === activeUnitId)
  const totalInUnit = unit?.lessons || 0
  const doneInUnit = Object.keys(completedLessons).filter(
    id => id.startsWith(`unit${activeUnitId}-`)
  ).length

  const unitProgressPct = totalInUnit > 0 ? Math.round((doneInUnit / totalInUnit) * 100) : 0
  const bestTime = meta?.id ? bestTimes?.[meta.id] : undefined

  return (
    <div style={{
      flexShrink: 0,
      borderTop: '1px solid var(--border)',
      padding: '14px 20px 16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* Operator level / XP */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--accent-text)',
          }}>
            Operator Lv.{level}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            {getXPToNextLevel()} XP to next
          </span>
        </div>
        <div style={{ height: '5px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${getLevelProgress()}%`,
            background: 'var(--accent)', borderRadius: '999px',
            boxShadow: '0 0 6px var(--accent-glow)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Unit completion */}
      {activeUnitId && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '11px',
              letterSpacing: '0.05em', color: 'var(--text-muted)',
            }}>
              Unit {unit?.roman} progress
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-h)' }}>
              {doneInUnit} / {totalInUnit}
            </span>
          </div>
          <div style={{ height: '5px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${unitProgressPct}%`,
              background: 'var(--text-muted)', borderRadius: '999px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Best speed-run time, only if one exists for this lesson */}
      {bestTime !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>
          <span>⚡ Best time</span>
          <span style={{ color: 'var(--accent-text)' }}>{formatTime(bestTime)}</span>
        </div>
      )}
    </div>
  )
}