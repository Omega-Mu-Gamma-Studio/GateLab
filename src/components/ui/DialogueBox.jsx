/**
 * DialogueBox.jsx
 *
 * The narrative / hint readout, now a real HTML panel instead of a
 * Konva Rect+Text baked into the canvas. This fixes two problems with
 * the old in-canvas DispatchTerminal:
 *
 *   1. Contrast — work/break text used --text-muted (#4a5248) at 12px
 *      over a semi-transparent black strip sitting on top of the
 *      circuit grid, which made it nearly invisible in those phases.
 *      Here it's always --text-h on a solid --surface-2 panel.
 *
 *   2. Size — it was a fixed 44/56px overlay clipped to whatever was
 *      left of the canvas. Now it's a real flex row sized by the
 *      page's 5:75:20 vertical rhythm (top bar : canvas : dialogue),
 *      so long dispatch text actually has room to breathe and wrap.
 *
 * Features added while resizing it (see chat for rationale):
 *   - Phase badge (icon + label + colour) so the box's role is legible
 *     at a glance even before reading the text.
 *   - Work-order metadata moved here from the thin ControlPanel strip,
 *     since there's finally room for it without truncation.
 *   - Scrollable body — protects against any future lesson writing a
 *     longer dispatch than the box's fixed height can show at once.
 */
import { useLessonStore } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'

const PHASE_META = {
  work:  { icon: '📋', label: 'Briefing',  color: 'var(--accent)',  glow: 'var(--accent-glow)' },
  break: { icon: '⚠',  label: 'Incident',  color: '#ff3b3b',        glow: 'rgba(255,59,59,0.25)' },
  try:   { icon: '🔧', label: 'Dispatch',  color: '#f5c400',        glow: 'rgba(245,196,0,0.25)' },
}

export default function DialogueBox() {
  const { phase, narrative, meta, activeUnitId } = useLessonStore()
  const hint = useCanvasStore(s => s.hint)

  if (!activeUnitId) return null

  let displayText = hint
  if (narrative) {
    if (phase === 'work'  && narrative.briefing) displayText = narrative.briefing
    if (phase === 'break' && narrative.fault)    displayText = narrative.fault
    if (phase === 'try'   && narrative.dispatch) displayText = narrative.dispatch
  }
  if (!displayText) return null

  const pm = PHASE_META[phase] || PHASE_META.work

  return (
    <div style={{
      flex: '0 0 20%',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-2)',
      borderTop: '1px solid var(--border-strong)',
      overflow: 'hidden',
    }}>
      {/* Header row — phase badge + work order metadata */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px 0 24px',
        flexShrink: 0,
        gap: '12px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '4px 11px', borderRadius: '999px',
          fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          background: pm.glow, border: `1px solid ${pm.color}`,
          color: pm.color, flexShrink: 0,
        }}>
          <span aria-hidden>{pm.icon}</span> {pm.label}
        </span>

        {meta && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'var(--text-muted)', letterSpacing: '0.06em',
            minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>{meta.workOrder}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{meta.location}</span>
            {meta.shift && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{meta.shift}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Body — the actual narrative/hint text, scrollable if it overflows */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 24px 18px 24px' }}>
        <p style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--text-h)',
          maxWidth: '900px',
        }}>
          <span style={{ color: pm.color, marginRight: '8px' }}>▸</span>
          {displayText}
        </p>
      </div>
    </div>
  )
}