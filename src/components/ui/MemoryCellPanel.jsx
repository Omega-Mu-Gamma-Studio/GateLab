/**
 * MemoryCellPanel.jsx
 *
 * Lives in the InfoPanel "Memory" tab (Unit V only). Sibling to
 * StateDiagram.jsx (Unit III) but scoped to memory-cell semantics instead
 * of flip-flop semantics: rather than SET/RESET/HOLD/TOGGLE transitions on
 * a clock edge, a memory cell's whole story is WRITE vs HOLD, gated by a
 * write-enable line instead of a CLK edge.
 *
 * Same "structural detection, zero per-lesson authoring" policy as
 * FlipFlopModels.detectFlipFlopType — any Unit V lesson whose INPUT nodes
 * match the SRAM/DRAM naming convention (D, WE, optional REFRESH) gets a
 * working panel for free:
 *
 *   01-sram.js  → D, WE            → gated D-latch, holds forever on WE=0
 *   02-dram.js  → D, WE, REFRESH   → same, plus a decay/refresh readout
 *
 * ROM / EPROM / PLA / PAL / Hamming don't match this shape (no WE input)
 * and fall through to the empty state — those lessons use the PLA/PAL
 * grid panel or the Truth Table instead, whichever applies.
 */
import { useMemo } from 'react'
import { useCanvasStore } from '../../store/canvasStore'

const HOLD_COLOR  = '#3fa8d8'   // same blue StateDiagram uses for RESET/hold-adjacent state
const WRITE_COLOR = '#40c878'   // same green StateDiagram/TimingDiagram use for active/output
const WARN_COLOR  = '#ff3b3b'
const MUTED       = 'var(--text-muted)'

/**
 * detectMemoryCell(nodes) — best-guess read of a Unit V memory-cell lesson.
 * Returns null if this circuit doesn't match the convention.
 */
function detectMemoryCell(nodes) {
  const inputIds = nodes.filter(n => n.type === 'INPUT').map(n => n.id)
  const set = new Set(inputIds)
  if (!set.has('D') || !set.has('WE')) return null

  const hasQ    = nodes.some(n => n.type === 'OUTPUT' && n.id === 'Q')
  const hasQbar = nodes.some(n => n.type === 'OUTPUT' && n.id === 'Qbar')
  if (!hasQ) return null

  return {
    kind: set.has('REFRESH') ? 'dram' : 'sram',
    hasQbar,
  }
}

function MemoryCellDiagram({ we, d, q, kind }) {
  const writing = we === true
  const cellColor = writing ? WRITE_COLOR : HOLD_COLOR
  const cellFill  = writing ? `${WRITE_COLOR}22` : `${HOLD_COLOR}18`

  return (
    <svg viewBox="0 0 220 160" width="100%" style={{ display: 'block' }}>
      {/* D input line, flowing in from the left */}
      <line x1="10" y1="50" x2="70" y2="50" stroke={writing ? MUTED : 'var(--border-strong)'} strokeWidth="1.4" opacity={writing ? 1 : 0.4} />
      <text x="16" y="42" fontFamily="var(--mono)" fontSize="9" fill={MUTED}>D = {d ? '1' : '0'}</text>

      {/* Gate symbol — open when writing, closed when holding */}
      <g opacity={writing ? 1 : 0.5}>
        <path d={writing ? 'M 70 38 L 90 50 L 70 62' : 'M 70 38 L 70 62 L 90 50 Z'}
          fill="none" stroke={writing ? WRITE_COLOR : 'var(--border-strong)'} strokeWidth="1.6" strokeLinejoin="round" />
        <text x="80" y="80" textAnchor="middle" fontFamily="var(--mono)" fontSize="7.5" letterSpacing="0.04em"
          fill={writing ? WRITE_COLOR : MUTED}>
          WE={we ? '1' : '0'}
        </text>
      </g>

      {/* The cell itself — cross-coupled latch, drawn as a single storage box */}
      <rect x="100" y="20" width="70" height="60" rx="6"
        fill={cellFill} stroke={cellColor} strokeWidth={writing ? 2.4 : 1.6} />
      <text x="135" y="46" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fontWeight="700" fill={cellColor}>
        Q = {q === undefined ? '?' : (q ? '1' : '0')}
      </text>
      <text x="135" y="62" textAnchor="middle" fontFamily="var(--mono)" fontSize="7.5" letterSpacing="0.06em" fill={cellColor}>
        {writing ? 'WRITING' : 'HOLDING'}
      </text>

      {/* Output line to Q */}
      <line x1="170" y1="50" x2="205" y2="50" stroke={cellColor} strokeWidth="1.6" />
      <text x="208" y="53" fontFamily="var(--mono)" fontSize="9" fill={cellColor} textAnchor="end">Q</text>

      {/* DRAM only: decay/refresh strip underneath */}
      {kind === 'dram' && (
        <g>
          <rect x="30" y="112" width="160" height="6" rx="3" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1" />
          <rect x="30" y="112" width={writing ? 160 : 60} height="6" rx="3" fill={writing ? WRITE_COLOR : WARN_COLOR} opacity="0.75" />
          <text x="110" y="136" textAnchor="middle" fontFamily="var(--mono)" fontSize="7.5" fill={MUTED}>
            charge — decays without REFRESH
          </text>
        </g>
      )}
    </svg>
  )
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
      <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>MEMORY</span>
      <span>NO RECOGNIZED MEMORY CELL IN THIS CIRCUIT</span>
    </div>
  )
}

export default function MemoryCellPanel() {
  const nodes   = useCanvasStore(s => s.nodes)
  const inputs  = useCanvasStore(s => s.inputs)
  const signals = useCanvasStore(s => s.signals)

  const cell = useMemo(() => detectMemoryCell(nodes), [nodes])

  if (!cell) return <EmptyState />

  const we = !!inputs.WE
  const d  = !!inputs.D
  const q  = signals.Q?.output
  const refreshOn = cell.kind === 'dram' ? !!inputs.REFRESH : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ MEMORY
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {cell.kind === 'dram' ? 'DRAM CELL' : 'SRAM CELL'}
        </span>
      </div>

      <MemoryCellDiagram we={we} d={d} q={q} kind={cell.kind} />

      <p style={{ fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)', letterSpacing: '0.02em', margin: '8px 0 0', textAlign: 'center' }}>
        {we
          ? <>Live: <strong style={{ color: WRITE_COLOR }}>writing</strong> — Q is tracking D.</>
          : <>Live: <strong style={{ color: HOLD_COLOR }}>holding</strong> — Q is latched, ignoring D.</>}
      </p>

      {cell.kind === 'dram' && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: refreshOn ? WRITE_COLOR : WARN_COLOR, letterSpacing: '0.02em', margin: '4px 0 0', textAlign: 'center' }}>
          {refreshOn ? 'REFRESH active — charge topped up.' : 'REFRESH idle — stored charge is decaying.'}
        </p>
      )}

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        {cell.kind === 'dram'
          ? 'A DRAM cell is a single transistor and a leaking capacitor — it must be periodically refreshed or the stored bit decays to 0 regardless of WE.'
          : 'An SRAM cell is a cross-coupled latch — as long as power is applied, it holds its bit with zero refresh, at the cost of six transistors per bit.'}
      </p>
    </div>
  )
}
