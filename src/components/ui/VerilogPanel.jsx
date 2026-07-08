/**
 * VerilogPanel.jsx
 *
 * Lives in the InfoPanel "Verilog" tab (Units II, III, IV). Compact, ALWAYS-
 * LIVE sibling to VerilogExportModal.jsx — same emitVerilog() call, same
 * live canvasStore.nodes/wires source, just rendered small enough to sit in
 * the 20vw side panel instead of a full-screen modal.
 *
 * Deliberately does NOT duplicate VerilogExportModal's copy/download UI —
 * it reuses that exact component for the "expand" action, so there's one
 * place that owns copy-to-clipboard and file-download behavior, not two.
 * This panel's only job is to be the quick glanceable view that updates as
 * you wire things, the same way TimingDiagram and StateDiagram do.
 */
import { useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useLessonStore } from '../../store/lessonStore'
import { emitVerilog } from '../../engine/VerilogEmitter'
import VerilogExportModal from './VerilogExportModal'

export default function VerilogPanel() {
  const nodes = useCanvasStore(s => s.nodes)
  const wires = useCanvasStore(s => s.wires)
  const { meta } = useLessonStore()
  const [expanded, setExpanded] = useState(false)

  if (nodes.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em', padding: '20px', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>VERILOG VIEW</span>
        <span>NO CIRCUIT LOADED</span>
      </div>
    )
  }

  // Same live source, same emitter the export modal uses — this panel is
  // just a smaller window onto the exact same netlist.
  const { code, warnings } = emitVerilog(nodes, wires, {
    moduleName:  meta?.title,
    lessonTitle: meta?.title,
    workOrder:   meta?.workOrder,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 12px 8px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent-text)' }}>
          ◈ VERILOG
        </span>
        <button
          onClick={() => setExpanded(true)}
          title="Open full export view (copy / download)"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.08em', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ⤢ EXPAND
        </button>
      </div>

      {warnings.length > 0 && (
        <div style={{ margin: '0 12px 8px', padding: '6px 8px', background: 'rgba(255,196,0,0.06)', border: '1px solid rgba(255,196,0,0.18)', borderRadius: '5px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: '8px', color: '#ffd84d', letterSpacing: '0.02em', lineHeight: 1.5 }}>
            ⚠ {warnings.length} unwired pin{warnings.length === 1 ? '' : 's'} → 1'bx
          </p>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
        <pre style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '9px', lineHeight: 1.6,
          color: 'var(--text)', whiteSpace: 'pre', tabSize: 2,
        }}>
          {code}
        </pre>
      </div>

      <p style={{
        fontFamily: 'var(--mono)', fontSize: '8.5px', lineHeight: 1.6, color: 'var(--text-muted)',
        letterSpacing: '0.02em', margin: '10px 12px 0', paddingTop: '8px', borderTop: '1px solid var(--border)',
      }}>
        Live structural netlist — regenerates as you wire the circuit. Feedback loops (latches, flip-flops) stay as real structural feedback, same as on the canvas.
      </p>

      {expanded && <VerilogExportModal onClose={() => setExpanded(false)} />}
    </div>
  )
}
