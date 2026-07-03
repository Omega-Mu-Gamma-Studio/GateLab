/**
 * VerilogExportModal.jsx
 *
 * Reads the LIVE circuit off canvasStore (not a lesson's static template —
 * this exports whatever the player has actually wired on the canvas right
 * now, fault-injected gaps and all) and renders it through VerilogEmitter.
 *
 * Opens from a TopBar button. Closes on backdrop click, X, or Escape.
 * Follows the same fixed-backdrop/centered-panel convention as PDA.jsx,
 * but themed with the app's CSS variable tokens rather than PDA's hardcoded
 * phone-skin colors, since this is a dev-tool surface, not an in-universe
 * device.
 */
import { useEffect, useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useLessonStore } from '../../store/lessonStore'
import { emitVerilog } from '../../engine/VerilogEmitter'

export default function VerilogExportModal({ onClose }) {
  const nodes = useCanvasStore(s => s.nodes)
  const wires = useCanvasStore(s => s.wires)
  const { meta } = useLessonStore()
  const [copied, setCopied] = useState(false)

  const { code, warnings } = emitVerilog(nodes, wires, {
    moduleName:  meta?.title,
    lessonTitle: meta?.title,
    workOrder:   meta?.workOrder,
  })

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API can fail on insecure origins / permissions — the
      // code is still fully visible and selectable, so this is a soft
      // failure, not a blocker.
    }
  }

  function handleDownload() {
    const filename = `${(meta?.title || 'gatelab_circuit').replace(/\s+/g, '_').toLowerCase()}.v`
    const blob = new Blob([code], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 401,
          width: 'min(92vw, 720px)',
          height: 'min(86vh, 680px)',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '16px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              margin: 0, fontFamily: 'var(--mono)', fontSize: '14px',
              fontWeight: 500, color: 'var(--text-h)', letterSpacing: '0.02em',
            }}>
              Verilog Export
            </h2>
            <p style={{
              margin: '3px 0 0', fontFamily: 'var(--mono)', fontSize: '10.5px',
              color: 'var(--text-muted)', letterSpacing: '0.04em',
            }}>
              Structural netlist · {nodes.length} nodes · {wires.length} wires
              {meta?.title ? ` · ${meta.title}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Warnings banner */}
        {warnings.length > 0 && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(255,196,0,0.06)',
            borderBottom: '1px solid rgba(255,196,0,0.18)',
            flexShrink: 0,
          }}>
            <p style={{
              margin: 0, fontFamily: 'var(--mono)', fontSize: '10.5px',
              color: '#ffd84d', letterSpacing: '0.03em', lineHeight: 1.6,
            }}>
              ⚠ {warnings.length} unwired pin{warnings.length === 1 ? '' : 's'} — tied to 1'bx in the export.
              {' '}This circuit isn't fully wired yet.
            </p>
          </div>
        )}

        {/* Code */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <pre style={{
            margin: 0, padding: '18px 20px',
            fontFamily: 'var(--mono)', fontSize: '11.5px', lineHeight: 1.7,
            color: 'var(--text)', whiteSpace: 'pre', tabSize: 2,
          }}>
            {code}
          </pre>
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <button
            onClick={handleCopy}
            style={{
              fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '7px',
              border: '1px solid var(--border)', background: 'transparent',
              color: copied ? 'var(--accent-text)' : 'var(--text)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            style={{
              fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.05em', padding: '8px 16px', borderRadius: '7px',
              border: '1px solid var(--accent-border)', background: 'var(--accent-dim)',
              color: 'var(--accent-text)', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Download .v
          </button>
        </div>
      </div>
    </>
  )
}
