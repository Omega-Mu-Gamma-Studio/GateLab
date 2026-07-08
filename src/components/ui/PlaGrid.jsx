/**
 * PlaGrid.jsx
 *
 * Lives in the InfoPanel "PLA/PAL" tab (Unit V only). Renders the classic
 * textbook dot-matrix diagram for a programmable logic array: primary
 * inputs (and their complements) running down one axis, AND-array
 * product terms across the top, OR-array output terms feeding the final
 * OUTPUT nodes. A filled dot means "this link exists"; a live-lit dot
 * means "this link exists AND is currently carrying a 1".
 *
 * Same "structural detection, zero per-lesson authoring" policy as
 * FlipFlopModels / MemoryCellPanel: any Unit V lesson whose circuit is
 * shaped like INPUT(+NOT) → AND terms → OR terms → OUTPUT gets a working
 * grid for free.
 *
 *   05-pla.js → AND-array terms unlocked (fully programmable)
 *   06-pal.js → AND-array terms locked   (fixed at fabrication) —
 *               detected from each AND node's own `locked` flag, so this
 *               component never has to know "PLA" vs "PAL" by name.
 *
 * ROM / EPROM / SRAM / DRAM / Hamming don't match this AND→OR shape and
 * fall through to the empty state.
 */
import { useMemo } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useLessonStore } from '../../store/lessonStore'

const DOT_ON  = '#40c878'   // live/connected — same green used elsewhere for active state
const DOT_OFF = 'var(--border-strong)'

// Lesson concepts (meta.concept, authored per-lesson) whose AND array is
// fixed at fabrication — PAL and both ROM-family parts all share that
// "fixed decoder/AND stage" property, unlike PLA where it's programmable.
const AND_FIXED_CONCEPTS = new Set(['PAL', 'ROM', 'EPROM_FLASH'])

/**
 * detectPlaShape(nodes, concept) — best-guess read of a Unit V PLA/PAL/ROM
 * lesson. Returns null if this circuit doesn't match the AND-array →
 * OR-array shape. `concept` is the active lesson's meta.concept, used only
 * to label the AND array as fixed vs programmable — falls back to each
 * term node's own `locked` flag when concept isn't available (e.g. a
 * circuit built from scratch with no lesson meta attached).
 */
function detectPlaShape(nodes, concept) {
  const inputs  = nodes.filter(n => n.type === 'INPUT')
  const nots    = nodes.filter(n => n.type === 'NOT')
  const terms   = nodes.filter(n => n.type === 'AND').sort((a, b) => a.id.localeCompare(b.id))
  const outs    = nodes.filter(n => n.type === 'OR').sort((a, b) => a.id.localeCompare(b.id))
  const outputs = nodes.filter(n => n.type === 'OUTPUT')

  if (terms.length === 0 || outs.length === 0 || inputs.length === 0) return null

  // Literal columns: every primary input, plus every NOT-derived
  // complement (notA, notB, ...), in a stable, readable order — primary
  // inputs first, then their complements, matching how a textbook PLA
  // diagram lists true/complement pairs together isn't required, but
  // primaries-then-complements is the simplest stable rule.
  const literals = [
    ...inputs.map(n => ({ id: n.id, label: n.id, source: n.id })),
    ...nots.map(n => ({ id: n.id, label: `¬${n.id.replace(/^not/i, '')}`, source: n.id })),
  ]

  const andFixed = concept
    ? AND_FIXED_CONCEPTS.has(concept)
    : terms.every(t => t.locked === true)

  return { literals, terms, outs, outputs, andFixed }
}

function wireExists(wires, fromId, toId) {
  return wires.some(w => !w.broken && w.from.nodeId === fromId && w.to.nodeId === toId)
}

function Dot({ cx, cy, filled, live, brokenHere }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={5.5}
        fill={live ? DOT_ON : (filled ? 'var(--text)' : 'none')}
        stroke={brokenHere ? '#ff3b3b' : (filled ? (live ? DOT_ON : 'var(--text)') : DOT_OFF)}
        strokeWidth={brokenHere ? 2 : 1.2}
        opacity={filled ? 1 : 0.35}
      />
      {brokenHere && (
        <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke="#ff3b3b" strokeWidth="1.6" />
      )}
    </g>
  )
}

function PlaDiagram({ shape, wires, signals }) {
  const { literals, terms, outs } = shape
  const colW = 26, rowH = 22
  const gridLeft = 90, gridTop = 34
  const gridW = literals.length * colW
  const termsGridH = terms.length * rowH
  const outGridTop = gridTop + termsGridH + 30

  const width  = Math.max(220, gridLeft + gridW + 20)
  const height = outGridTop + outs.length * rowH + 30

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* Literal column labels */}
      {literals.map((lit, i) => (
        <text key={lit.id} x={gridLeft + i * colW + colW / 2} y={gridTop - 10}
          textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--text-h)">
          {lit.label}
        </text>
      ))}

      {/* AND-array: term rows x literal columns */}
      {terms.map((term, ri) => {
        const y = gridTop + ri * rowH + rowH / 2
        const termLive = !!signals?.[term.id]?.output
        return (
          <g key={term.id}>
            <text x={gridLeft - 12} y={y + 3} textAnchor="end" fontFamily="var(--mono)" fontSize="9"
              fill={termLive ? DOT_ON : 'var(--text-h)'} fontWeight={termLive ? 700 : 400}>
              {term.id}{term.locked ? ' 🔒' : ''}
            </text>
            {literals.map((lit, ci) => {
              const filled = wireExists(wires, lit.source, term.id)
              const brokenHere = wires.some(w => w.broken && w.from.nodeId === lit.source && w.to.nodeId === term.id)
              const live = filled && termLive && !!signals?.[lit.source]?.output
              return (
                <Dot key={lit.id} cx={gridLeft + ci * colW + colW / 2} cy={y}
                  filled={filled} live={live} brokenHere={brokenHere} />
              )
            })}
          </g>
        )
      })}

      {/* Divider between AND array and OR array */}
      <line x1={gridLeft - 30} y1={outGridTop - 16} x2={gridLeft + gridW} y2={outGridTop - 16}
        stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
      <text x={gridLeft - 30} y={outGridTop - 20} fontFamily="var(--mono)" fontSize="7.5" fill="var(--text-muted)" letterSpacing="0.04em">
        OR ARRAY
      </text>

      {/* Term column labels for the OR array */}
      {terms.map((term, i) => (
        <text key={term.id} x={gridLeft + i * colW + colW / 2} y={outGridTop - 4}
          textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--text-h)">
          {term.id}
        </text>
      ))}

      {/* OR-array: output rows x term columns */}
      {outs.map((out, ri) => {
        const y = outGridTop + ri * rowH + rowH / 2
        const outLive = !!signals?.[out.id]?.output
        return (
          <g key={out.id}>
            <text x={gridLeft - 12} y={y + 3} textAnchor="end" fontFamily="var(--mono)" fontSize="9"
              fill={outLive ? DOT_ON : 'var(--text-h)'} fontWeight={outLive ? 700 : 400}>
              {out.id}
            </text>
            {terms.map((term, ci) => {
              const filled = wireExists(wires, term.id, out.id)
              const brokenHere = wires.some(w => w.broken && w.from.nodeId === term.id && w.to.nodeId === out.id)
              const live = filled && outLive && !!signals?.[term.id]?.output
              return (
                <Dot key={term.id} cx={gridLeft + ci * colW + colW / 2} cy={y}
                  filled={filled} live={live} brokenHere={brokenHere} />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
      <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>PLA / PAL</span>
      <span>NO PROGRAMMABLE ARRAY IN THIS CIRCUIT</span>
    </div>
  )
}

const GRID_LABELS = {
  PLA: 'PLA GRID',
  PAL: 'PAL GRID',
  ROM: 'ROM GRID',
  EPROM_FLASH: 'EPROM GRID',
}

export default function PlaGrid() {
  const nodes   = useCanvasStore(s => s.nodes)
  const wires   = useCanvasStore(s => s.wires)
  const signals = useCanvasStore(s => s.signals)
  const concept = useLessonStore(s => s.meta?.concept)

  const shape = useMemo(() => detectPlaShape(nodes, concept), [nodes, concept])

  if (!shape) return <EmptyState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ {GRID_LABELS[concept] || (shape.andFixed ? 'ARRAY GRID (FIXED AND)' : 'ARRAY GRID')}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {shape.andFixed ? 'AND FIXED' : 'AND PROGRAMMABLE'}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <PlaDiagram shape={shape} wires={wires} signals={signals} />
      </div>

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        {shape.andFixed
          ? 'Fixed AND array (🔒), programmable OR array. A dot is a link that exists; a bright green dot is a link currently carrying a 1. A red X marks a broken link.'
          : 'Both the AND array and the OR array are programmable here. A dot is a link that exists; a bright green dot is a link currently carrying a 1. A red X marks a broken link.'}
      </p>
    </div>
  )
}
