/**
 * StateDiagram.jsx
 *
 * Lives in the InfoPanel "State" tab (Unit III only). Two rendering modes,
 * both driven by stateDiagramStore + FlipFlopModels:
 *
 *   SINGLE FLIP-FLOP (SR latch, SR/JK/D/T flip-flop) — the classic
 *   textbook 2-state diagram: a RESET circle and a SET circle, with edges
 *   built generically from FlipFlopModels.STATE_LEGEND rather than
 *   hardcoded per type (see edgesFor() below). The circle matching the
 *   live Q value is filled solid; the edge matching the live transition
 *   is drawn in the accent color. Everything else is dimmed reference.
 *
 *   COUNTER (ripple/mod-N/ring/Johnson) — there's no single 2-state
 *   textbook diagram for a multi-bit counter, so this mode draws the
 *   actual sequence of bit-patterns the player has driven the circuit
 *   through, same "it's an honest trace, not a prediction" spirit as
 *   TimingDiagram.jsx.
 *
 * Matches TimingDiagram.jsx's visual language (mono labels, same accent /
 * muted color tokens) so the two panels feel like siblings.
 */
import { useCanvasStore } from '../../store/canvasStore'
import useStateDiagramStore from '../../store/stateDiagramStore'
import { FF_TYPES, TYPE_LABELS, STATE_LEGEND } from '../../engine/FlipFlopModels'

const SET_COLOR    = '#40c878'   // same green TimingDiagram uses for OUTPUT
const RESET_COLOR  = '#3fa8d8'   // same blue TimingDiagram uses for CLOCK
const WARN_COLOR   = '#ff3b3b'   // same red GateShape.jsx uses for fault/error glow
const MUTED        = 'var(--text-muted)'

/* ── Single flip-flop diagram ──────────────────────────────────────────── */

// Layout constants for the 220×160 two-circle diagram
const CX_RESET = 60, CX_SET = 160, CY = 82, R = 28

// Build the generic edge set from STATE_LEGEND — same legend entries work
// for every FF type, no per-type drawing code needed.
function edgesFor(ffType) {
  const legend = STATE_LEGEND[ffType] || []
  const holds     = legend.filter(e => e.kind === 'HOLD')
  const sets      = legend.filter(e => e.kind === 'SET')
  const resets    = legend.filter(e => e.kind === 'RESET')
  const toggles   = legend.filter(e => e.kind === 'TOGGLE')
  const forbidden = legend.filter(e => e.kind === 'FORBIDDEN')
  return { holds, sets, resets, toggles, forbidden }
}

function StateCircle({ cx, cy, active, color, label, sublabel }) {
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={R}
        fill={active ? `${color}22` : 'var(--surface)'}
        stroke={active ? color : 'var(--border-strong)'}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--mono)" fontSize="13" fontWeight="600"
        fill={active ? color : 'var(--text-h)'}>
        {label}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" letterSpacing="0.06em"
        fill={active ? color : MUTED}>
        {sublabel}
      </text>
    </g>
  )
}

// Curved edge between the two main circles (top = RESET→SET, bottom = SET→RESET)
function CurveEdge({ direction, active, color, labels }) {
  const y0 = direction === 'down' ? CY - R + 4 : CY + R - 4
  const ctrlY = direction === 'down' ? 16 : 148
  const [x1, x2] = direction === 'down' ? [CX_RESET, CX_SET] : [CX_SET, CX_RESET]
  const path = `M ${x1} ${y0} Q 110 ${ctrlY} ${x2} ${y0}`
  const stroke = active ? color : 'var(--border-strong)'
  return (
    <g opacity={active ? 1 : 0.55}>
      <path d={path} fill="none" stroke={stroke} strokeWidth={active ? 2 : 1.2}
        markerEnd={`url(#sd-arrow-${active ? 'active' : 'muted'})`} />
      <text x={110} y={direction === 'down' ? 12 : 158} textAnchor="middle"
        fontFamily="var(--mono)" fontSize="8" fill={active ? color : MUTED}>
        {labels.join(' / ')}
      </text>
    </g>
  )
}

// Small self-loop above a circle, for HOLD conditions
function SelfLoop({ cx, active, color, label }) {
  const path = `M ${cx - 12} ${CY - R + 2} Q ${cx} ${CY - R - 26} ${cx + 12} ${CY - R + 2}`
  const stroke = active ? color : 'var(--border-strong)'
  return (
    <g opacity={active ? 1 : 0.5}>
      <path d={path} fill="none" stroke={stroke} strokeWidth={active ? 2 : 1.2}
        markerEnd={`url(#sd-arrow-${active ? 'active' : 'muted'})`} />
      <text x={cx} y={CY - R - 30} textAnchor="middle" fontFamily="var(--mono)" fontSize="8"
        fill={active ? color : MUTED}>
        {label}
      </text>
    </g>
  )
}

function SingleFlipFlopDiagram({ ffType, currentQ, transition }) {
  const { holds, sets, resets, toggles, forbidden } = edgesFor(ffType)

  const setActive   = currentQ === true
  const resetActive = currentQ === false
  const kind = transition?.kind

  // Which specific edge is "live" right now — direction depends on where
  // we currently are, since TOGGLE/HOLD are symmetric conditions that mean
  // different things depending on the departure state.
  const downActive = kind === 'SET' || (kind === 'TOGGLE' && resetActive)   // RESET → SET
  const upActive    = kind === 'RESET' || (kind === 'TOGGLE' && setActive)  // SET → RESET
  const loopResetActive = kind === 'HOLD' && resetActive
  const loopSetActive   = kind === 'HOLD' && setActive
  const forbiddenActive = kind === 'FORBIDDEN'

  const downLabels = [...sets, ...toggles].map(e => e.label)
  const upLabels   = [...resets, ...toggles].map(e => e.label)
  const holdLabel  = holds[0]?.label

  return (
    <svg viewBox="0 0 220 172" width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="sd-arrow-muted" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--border-strong)" />
        </marker>
        <marker id="sd-arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--accent-text)" />
        </marker>
      </defs>

      {holdLabel && <SelfLoop cx={CX_RESET} active={loopResetActive} color={RESET_COLOR} label={holdLabel} />}
      {holdLabel && <SelfLoop cx={CX_SET}   active={loopSetActive}   color={SET_COLOR}   label={holdLabel} />}

      {downLabels.length > 0 && (
        <CurveEdge direction="down" active={downActive} color={downActive ? SET_COLOR : MUTED} labels={downLabels} />
      )}
      {upLabels.length > 0 && (
        <CurveEdge direction="up" active={upActive} color={upActive ? RESET_COLOR : MUTED} labels={upLabels} />
      )}

      <StateCircle cx={CX_RESET} cy={CY} active={resetActive} color={RESET_COLOR} label="Q = 0" sublabel="RESET" />
      <StateCircle cx={CX_SET}   cy={CY} active={setActive}   color={SET_COLOR}   label="Q = 1" sublabel="SET" />

      {forbidden.length > 0 && (
        <g opacity={forbiddenActive ? 1 : 0.4}>
          <path d={`M ${CX_RESET + 14} ${CY + R - 2} L 110 165 L ${CX_SET - 14} ${CY + R - 2}`}
            fill="none" stroke={WARN_COLOR} strokeDasharray="3 2" strokeWidth={forbiddenActive ? 2 : 1} />
          <text x={110} y={172} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fontWeight={forbiddenActive ? 700 : 400}
            fill={WARN_COLOR}>
            \u26a0 {forbidden[0].label} \u2014 FORBIDDEN
          </text>
        </g>
      )}
    </svg>
  )
}

/* ── Counter diagram ───────────────────────────────────────────────────── */

function CounterDiagram({ counterStates, counterEdges }) {
  const n = counterStates.length
  const radius = 55
  const centerX = 110, centerY = 82
  const pos = (i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
  }
  const currentKey = counterStates[counterStates.length - 1]?.key

  return (
    <svg viewBox="0 0 220 172" width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="sd-c-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--accent-text)" />
        </marker>
      </defs>
      {counterEdges.map((e, i) => {
        const fromIdx = counterStates.findIndex(s => s.key === e.from)
        const toIdx   = counterStates.findIndex(s => s.key === e.to)
        if (fromIdx < 0 || toIdx < 0) return null
        const p0 = pos(fromIdx), p1 = pos(toIdx)
        // Pull the line back off each circle's edge so the arrowhead doesn't hide under it
        const dx = p1.x - p0.x, dy = p1.y - p0.y
        const len = Math.hypot(dx, dy) || 1
        const x1 = p0.x + (dx / len) * 20, y1 = p0.y + (dy / len) * 20
        const x2 = p1.x - (dx / len) * 20, y2 = p1.y - (dy / len) * 20
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--accent-text)" strokeWidth={1.4} opacity={0.7} markerEnd="url(#sd-c-arrow)" />
        )
      })}
      {counterStates.map((s, i) => {
        const p = pos(i)
        const active = s.key === currentKey
        const decimal = parseInt(s.key, 2)
        return (
          <g key={s.key}>
            <circle cx={p.x} cy={p.y} r={18}
              fill={active ? 'var(--accent-text)22' : 'var(--surface)'}
              stroke={active ? 'var(--accent-text)' : 'var(--border-strong)'}
              strokeWidth={active ? 2.5 : 1.5} />
            <text x={p.x} y={p.y - 1} textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fontWeight="600"
              fill={active ? 'var(--accent-text)' : 'var(--text-h)'}>
              {s.key}
            </text>
            <text x={p.x} y={p.y + 10} textAnchor="middle" fontFamily="var(--mono)" fontSize="7"
              fill={active ? 'var(--accent-text)' : MUTED}>
              ({decimal})
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Panel shell ───────────────────────────────────────────────────────── */

export default function StateDiagram() {
  const nodes    = useCanvasStore(s => s.nodes)
  const ffType         = useStateDiagramStore(s => s.ffType)
  const qIds           = useStateDiagramStore(s => s.qIds)
  const currentQ       = useStateDiagramStore(s => s.currentQ)
  const transition     = useStateDiagramStore(s => s.transition)
  const counterStates  = useStateDiagramStore(s => s.counterStates)
  const counterEdges   = useStateDiagramStore(s => s.counterEdges)
  const clearTrace     = useStateDiagramStore(s => s.clearTrace)

  const isCounter = ffType === FF_TYPES.COUNTER
  const unknown   = ffType === FF_TYPES.UNKNOWN || nodes.length === 0

  if (unknown) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>STATE DIAGRAM</span>
        <span>NO RECOGNIZED FLIP-FLOP IN THIS CIRCUIT</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ STATE
        </span>
        {isCounter ? (
          <button
            onClick={clearTrace}
            title="Clear observed sequence"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.08em', padding: '2px 4px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            CLEAR
          </button>
        ) : (
          <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            {TYPE_LABELS[ffType]?.toUpperCase()}
          </span>
        )}
      </div>

      {isCounter ? (
        <>
          <CounterDiagram counterStates={counterStates} counterEdges={counterEdges} />
          <p style={{ fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)', letterSpacing: '0.02em', margin: '6px 0 0', textAlign: 'center' }}>
            {qIds.join(', ')} bit-pattern, MSB\u2192LSB left\u2192right. States and arrows appear as the clock drives the counter through them \u2014 toggle CLK to grow the sequence.
          </p>
        </>
      ) : (
        <>
          <SingleFlipFlopDiagram ffType={ffType} currentQ={currentQ} transition={transition} />
          <p style={{ fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)', letterSpacing: '0.02em', margin: '4px 0 0', textAlign: 'center' }}>
            {transition?.label
              ? <>Live: <strong style={{ color: 'var(--text-h)' }}>{transition.label}</strong> \u2192 {transition.kind}</>
              : 'Drive the inputs to see which transition is live.'}
          </p>
        </>
      )}

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        {isCounter
          ? 'This is an observed sequence, not a full state table \u2014 it only shows states you\u2019ve actually driven the circuit through.'
          : 'The bright circle is Q right now. The bright edge is what the current inputs say happens on the next clock edge.'}
      </p>
    </div>
  )
}
