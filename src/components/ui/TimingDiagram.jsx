/**
 * TimingDiagram.jsx
 *
 * Lives in the InfoPanel "Timing" tab (Units III & IV). Renders the rolling
 * signal history kept in timingStore as a stacked strip-chart — one row
 * per tracked INPUT/CLOCK/OUTPUT node, classic digital step waveform.
 *
 * Deliberately labelled as an EVENT timeline rather than a real-time scope
 * trace — see timingStore.js for why. This widget draws whatever history
 * it's given; it does not know or care whether that history is "correct,"
 * so if a circuit is wired wrong, this will faithfully chart the wrongness.
 * That's the point — it's a debugging tool, not a reassurance blanket.
 */
import { useCanvasStore } from '../../store/canvasStore'
import useTimingStore from '../../store/timingStore'

const ROW_H   = 15   // vertical span of a single row's plot
const STEP_W  = 24   // px per tick
const PAD_Y   = 5    // top/bottom padding inside a row
const HIGH_Y  = PAD_Y
const LOW_Y   = PAD_Y + ROW_H
const MID_Y   = PAD_Y + ROW_H / 2
const VISIBLE_TICKS = 14   // how many ticks fit in the visible window

const TYPE_COLOR = {
  CLOCK:  '#3fa8d8',
  INPUT:  '#f5c400',
  OUTPUT: '#40c878',
}
const TYPE_GLYPH = {
  CLOCK:  '⏱',
  INPUT:  '▸',
  OUTPUT: '◆',
}

function valueLabel(v) {
  if (v === true)  return 'HIGH'
  if (v === false) return 'LOW'
  return 'FLOAT'
}

// One row's waveform as a list of drawable segments — flat runs at HIGH/
// LOW/MID height plus the vertical connector between differing levels.
// Built as discrete <line> pieces (not one long <path>) so floating ticks
// can render dashed without needing per-subpath dash-array gymnastics.
function buildSegments(values) {
  const segs = []
  let prevY = null
  values.forEach((v, i) => {
    const x0 = i * STEP_W
    const x1 = x0 + STEP_W
    const y  = v === true ? HIGH_Y : v === false ? LOW_Y : MID_Y
    if (prevY !== null && prevY !== y) {
      segs.push({ kind: 'v', x: x0, y0: prevY, y1: y, dashed: v === undefined || values[i - 1] === undefined })
    }
    segs.push({ kind: 'h', x0, x1, y, dashed: v === undefined })
    prevY = y
  })
  return segs
}

function WaveRow({ node, values }) {
  const color = TYPE_COLOR[node.type] || 'var(--text-muted)'
  const glyph = TYPE_GLYPH[node.type] || '·'
  const segs  = buildSegments(values)
  const width = values.length * STEP_W
  const current = values[values.length - 1]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }}>
      {/* Label column */}
      <div style={{
        width: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
        fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.04em',
        color, overflow: 'hidden', whiteSpace: 'nowrap',
      }} title={node.id}>
        <span style={{ opacity: 0.8 }}>{glyph}</span>
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{node.id}</span>
      </div>

      {/* Waveform */}
      <svg
        viewBox={`0 0 ${width} ${ROW_H + PAD_Y * 2}`}
        width={VISIBLE_TICKS * STEP_W} height={ROW_H + PAD_Y * 2}
        style={{ flexShrink: 0 }}
        preserveAspectRatio="xMaxYMid meet"
      >
        {segs.map((s, i) => s.kind === 'h' ? (
          <line key={i} x1={s.x0} y1={s.y} x2={s.x1} y2={s.y}
            stroke={color} strokeWidth={1.6}
            strokeDasharray={s.dashed ? '2 2' : undefined}
            opacity={s.dashed ? 0.55 : 1}
          />
        ) : (
          <line key={i} x1={s.x} y1={s.y0} x2={s.x} y2={s.y1}
            stroke={color} strokeWidth={1.6}
            strokeDasharray={s.dashed ? '2 2' : undefined}
            opacity={s.dashed ? 0.55 : 1}
          />
        ))}
      </svg>

      {/* Current-value chip */}
      <span style={{
        marginLeft: 'auto', flexShrink: 0, fontFamily: 'var(--mono)', fontSize: '8px',
        letterSpacing: '0.08em', padding: '1px 5px', borderRadius: '3px',
        color: current === undefined ? 'var(--text-muted)' : color,
        border: `0.5px solid ${current === undefined ? 'var(--border-strong)' : color}55`,
      }}>
        {valueLabel(current)}
      </span>
    </div>
  )
}

export default function TimingDiagram() {
  const nodes        = useCanvasStore(s => s.nodes)
  const trackedNodes = useTimingStore(s => s.trackedNodes)
  const history       = useTimingStore(s => s.history)
  const clearTrace    = useTimingStore(s => s.clearTrace)

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
  const visible = history.slice(-VISIBLE_TICKS)

  if (trackedNodes.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>TIMING DIAGRAM</span>
        <span>NO CHARTABLE SIGNALS IN THIS CIRCUIT</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ TIMING
        </span>
        <button
          onClick={clearTrace}
          title="Clear trace"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.08em', padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          CLEAR
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {trackedNodes.map(n => (
          <WaveRow
            key={n.id}
            node={nodeById[n.id] || n}
            values={visible.map(tick => tick.values[n.id])}
          />
        ))}
      </div>

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        Each step is an event — an input toggle, a clock edge, a wire changed — not a fixed unit of time. Dashed = floating / undriven.
      </p>
    </div>
  )
}
