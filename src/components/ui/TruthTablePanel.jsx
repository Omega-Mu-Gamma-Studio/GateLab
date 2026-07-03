/**
 * TruthTablePanel.jsx
 *
 * Lives in the InfoPanel "Truth Table" tab — available in every unit, not
 * gated behind a unit's `panels` config, since any circuit with at least
 * one INPUT and one OUTPUT node can produce one. Sweeps the *whole* circuit
 * (every OUTPUT node at once, via generateTruthTableMulti) so multi-output
 * blocks like a full adder show SUM and CARRY side by side, the way a
 * textbook actually draws it — not as two separate tables you'd have to
 * mentally line back up.
 *
 * The sweep only depends on circuit TOPOLOGY (nodes + wires), not on which
 * values are currently toggled — so it's memoized on those and does NOT
 * recompute on every input toggle. What DOES update live on every toggle is
 * the "you are here" row highlight: the panel compares the live `inputs`
 * state against each swept row and glows the one that matches, so flipping
 * an INPUT node on the canvas visibly walks a highlighted row down the
 * table in real time. That live pointer is the whole point of this being a
 * panel instead of a one-shot copy button — you see where you are in the
 * space of possibilities, not just what you copied.
 */
import { useMemo, useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { generateTruthTableMulti, truthTableMultiToMarkdown } from '../../engine/TruthTable'

function EmptyState({ reason }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
      <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>TRUTH TABLE</span>
      <span>{reason}</span>
    </div>
  )
}

export default function TruthTablePanel() {
  const nodes  = useCanvasStore(s => s.nodes)
  const wires  = useCanvasStore(s => s.wires)
  const inputs = useCanvasStore(s => s.inputs)
  const [copied, setCopied] = useState(false)

  const outputIds = useMemo(
    () => nodes.filter(n => n.type === 'OUTPUT').map(n => n.id),
    [nodes]
  )

  // Recomputed only when the circuit's actual topology changes — adding or
  // removing a wire, adding/removing a node — never on a plain input toggle.
  const table = useMemo(
    () => (outputIds.length > 0 ? generateTruthTableMulti(nodes, wires, outputIds) : null),
    [nodes, wires, outputIds]
  )

  if (!table) return <EmptyState reason="NO OUTPUT NODE IN THIS CIRCUIT YET" />
  if (table.truncated) {
    return <EmptyState reason={`${table.inputNodes.length} INPUTS IS TOO MANY TO SWEEP (CAP: 10)`} />
  }

  const { inputNodes, outputNodes, rows, hasFeedback } = table

  // Which row (if any) matches the circuit's live, currently-toggled input
  // state? Only meaningful when every INPUT has actually been driven —
  // a freshly loaded phase with inputs still at their defaults still
  // matches row 0 correctly since toggleInput starts everyone at falsy.
  const liveRowIdx = rows.findIndex(row =>
    inputNodes.every((node, i) => !!inputs[node.id] === row.inputValues[i])
  )

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(truthTableMultiToMarkdown(table))
    } catch {
      // Soft failure — table is still fully visible/selectable on screen.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const cellStyle = {
    padding: '4px 6px',
    textAlign: 'center',
    fontFamily: 'var(--mono)',
    fontSize: '10.5px',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ TRUTH TABLE
        </span>
        <button
          onClick={handleCopy}
          title="Copy as markdown"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--accent-text)' : 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.08em', padding: '2px 4px' }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.color = 'var(--accent-text)' }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {inputNodes.map(n => (
                <th key={n.id} style={{ ...cellStyle, color: '#f5c400', borderBottom: '1px solid var(--border-strong)' }}>
                  {n.label || n.id.toUpperCase()}
                </th>
              ))}
              {outputNodes.map(n => (
                <th key={n.id} style={{ ...cellStyle, color: 'var(--accent-text)', borderBottom: '1px solid var(--border-strong)', borderLeft: '1px solid var(--border)' }}>
                  {n.label || n.id.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isLive = i === liveRowIdx
              return (
                <tr
                  key={i}
                  style={{
                    background: isLive ? 'var(--accent-dim)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {row.inputValues.map((v, ci) => (
                    <td key={ci} style={{ ...cellStyle, color: isLive ? 'var(--accent-text)' : 'var(--text)' }}>
                      {v ? '1' : '0'}
                    </td>
                  ))}
                  {row.outputValues.map((v, ci) => (
                    <td
                      key={ci}
                      style={{
                        ...cellStyle,
                        borderLeft: '1px solid var(--border)',
                        color: v === undefined ? 'var(--text-muted)' : (isLive ? 'var(--accent-text)' : 'var(--text)'),
                        fontWeight: isLive ? 600 : 400,
                      }}
                    >
                      {v === undefined ? '?' : (v ? '1' : '0')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 0 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        {liveRowIdx >= 0
          ? 'Highlighted row = the circuit\'s current input state, live.'
          : 'Toggle an INPUT node to see your current state highlighted here.'}
        {hasFeedback && ' This circuit has feedback (latch/flip-flop-style) — treat this as a snapshot, not full sequential behaviour.'}
      </p>
    </div>
  )
}
