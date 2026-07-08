/**
 * HazardCanvas.jsx
 *
 * Unit IV's delay-aware companion overlay, mounted alongside GateCanvas
 * (not instead of it — GateCanvas keeps rendering nodes/wires/instant
 * signals exactly as it does for every other unit). This is a plain HTML
 * absolute-positioned layer on top of the Konva Stage, same technique
 * GateCanvas already uses for its K-Map widget overlay.
 *
 * Three jobs, matching Unit IV's own description in lessonStore
 * ("Per-gate delay sliders, live glitch visualisation, event-driven
 * simulation with a timeline scrubber"):
 *
 *   1. GLITCH HALOS — a red pulsing ring drawn over any gate that is
 *      mid-glitch at the current scrub time, positioned from the same
 *      node x/y/scale + GATE_W/GATE_H convention GateShape.jsx uses.
 *   2. TIMELINE SCRUBBER — drag through the most recent input transition
 *      in tpd units, see exactly when each gate's output flips and
 *      whether it flips back.
 *   3. DELAY READOUT — per-node propagation delay (type default or a
 *      player override), plus the circuit's overall critical path.
 *
 * Only mounts for Unit IV. Silently renders nothing (returns null) for
 * every other unit, and also renders nothing until the player has
 * actually toggled an input at least once — there's no meaningful
 * timeline to scrub before any transition has happened.
 */
import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { useLessonStore } from '../../store/lessonStore'
import { useGateTheme } from '../../hooks/useGateTheme'
import useHazardStore from '../../store/hazardStore'

const GATE_W = 80
const GATE_H = 60
const SPECIAL_BOX = {
  INPUT:  { w: 62, h: 32 },
  OUTPUT: { w: 40, h: 32 },
  CONST:  { w: 50, h: 22 },
}

const TPD_TO_NS = 10   // matches the narrative convention in 06-delay-model.js

function nodeBox(node) {
  const scale = node.scale ?? 1
  const special = SPECIAL_BOX[node.type]
  if (special) {
    return { x: node.x - 4, y: node.y - 4, w: special.w + 8, h: (node.type === 'OUTPUT' ? 32 : special.h) + 8 }
  }
  return { x: node.x - 4, y: node.y - 4, w: GATE_W * scale + 8, h: GATE_H * scale + 8 }
}

const GATE_TYPES = new Set(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'])

export default function HazardCanvas() {
  const theme = useGateTheme()
  const { activeUnitId } = useLessonStore()
  const nodes = useCanvasStore(s => s.nodes)

  const events        = useHazardStore(s => s.events)
  const glitches       = useHazardStore(s => s.glitches)
  const maxT           = useHazardStore(s => s.maxT)
  const scrubT         = useHazardStore(s => s.scrubT)
  const playing        = useHazardStore(s => s.playing)
  const criticalDelay  = useHazardStore(s => s.criticalDelay)
  const criticalNodeId = useHazardStore(s => s.criticalNodeId)
  const delayOverrides = useHazardStore(s => s.delayOverrides)
  const setScrubT      = useHazardStore(s => s.setScrubT)
  const setPlaying     = useHazardStore(s => s.setPlaying)
  const tickPlayback   = useHazardStore(s => s.tickPlayback)
  const setDelayOverride = useHazardStore(s => s.setDelayOverride)
  const glitchAt       = useHazardStore(s => s.glitchAt)
  const scrubToStart   = useHazardStore(s => s.scrubToStart)

  const [showDelays, setShowDelays] = useState(false)
  const rafRef = useRef(null)
  const lastTsRef = useRef(null)

  // ── Playback loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null
      return
    }
    function frame(ts) {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dtMs = ts - lastTsRef.current
      lastTsRef.current = ts
      // 1 tpd per 220ms of real time — slow enough to actually see a glitch
      tickPlayback(dtMs / 220)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, tickPlayback])

  // Only Unit IV, and only once there's an actual transition to show
  if (activeUnitId !== 4) return null
  if (nodes.length === 0) return null

  const gateNodes = nodes.filter(n => GATE_TYPES.has(n.type))
  const hasTimeline = maxT > 0 && events.length > 0
  const activeGlitchIds = new Set(gateNodes.filter(n => glitchAt(n.id, scrubT)).map(n => n.id))

  return (
    <>
      {/* ── Glitch halos, positioned over gates in Stage space ──────────── */}
      <svg
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
      >
        {gateNodes.map(node => {
          if (!activeGlitchIds.has(node.id)) return null
          const box = nodeBox(node)
          const cx = box.x + box.w / 2
          const cy = box.y + box.h / 2
          const r  = Math.max(box.w, box.h) / 2 + 6
          return (
            <g key={node.id}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ff3b3b" strokeWidth="2.5" opacity="0.85">
                <animate attributeName="r" values={`${r};${r + 6};${r}`} dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0.35;0.85" dur="0.6s" repeatCount="indefinite" />
              </circle>
              <text x={cx} y={box.y - 8} textAnchor="middle" fontFamily="var(--mono, 'JetBrains Mono', monospace)"
                fontSize="9" fill="#ff3b3b" letterSpacing="0.04em">
                ⚠ GLITCH
              </text>
            </g>
          )
        })}

        {/* Per-gate delay controls, toggled by the "Delays" button below */}
        {showDelays && gateNodes.map(node => {
          const box = nodeBox(node)
          const isCritical = node.id === criticalNodeId
          const current = delayOverrides[node.id] ?? GATE_DELAY_OF(node.type)
          return (
            <foreignObject key={`delay-${node.id}`}
              x={box.x + box.w / 2 - 34} y={box.y + box.h + 4} width="68" height="20">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                fontFamily: 'var(--mono, monospace)', fontSize: '9px', pointerEvents: 'all',
              }}>
                <button
                  onClick={() => setDelayOverride(node.id, Math.max(1, current - 1))}
                  style={microBtnStyle}
                  title="Decrease gate delay"
                >−</button>
                <span style={{ fontWeight: isCritical ? 700 : 400, color: isCritical ? '#f5c400' : (theme?.textMuted || '#4a5248'), minWidth: '18px', textAlign: 'center' }}>
                  {current}t
                </span>
                <button
                  onClick={() => setDelayOverride(node.id, Math.min(12, current + 1))}
                  style={microBtnStyle}
                  title="Increase gate delay"
                >+</button>
              </div>
            </foreignObject>
          )
        })}
      </svg>

      {/* ── Bottom control strip: scrubber + delay toggle ───────────────── */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '14px', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        pointerEvents: 'all',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(10,13,10,0.90)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px', padding: '8px 14px', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}>
          <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: '9px', letterSpacing: '0.08em', color: theme?.accentText || '#4dffac', whiteSpace: 'nowrap' }}>
            ◈ EVENT SIM
          </span>

          <button
            onClick={() => {
              if (playing) { setPlaying(false); return }
              if (scrubT >= maxT) scrubToStart()
              setPlaying(true)
            }}
            disabled={!hasTimeline}
            title={playing ? 'Pause' : 'Play propagation'}
            style={btnStyle(hasTimeline)}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(maxT, 1)}
            step={0.05}
            value={scrubT}
            disabled={!hasTimeline}
            onChange={e => setScrubT(parseFloat(e.target.value))}
            style={{ width: '160px', accentColor: theme?.accent || '#00ff88', opacity: hasTimeline ? 1 : 0.35 }}
          />

          <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: '9.5px', color: theme?.textMuted || '#4a5248', minWidth: '64px', textAlign: 'right' }}>
            t = {scrubT.toFixed(1)}·{TPD_TO_NS}ns
          </span>

          <button
            onClick={() => setShowDelays(s => !s)}
            title="Toggle per-gate delay labels"
            style={{ ...btnStyle(true), background: showDelays ? (theme?.accentDim || 'rgba(0,255,136,0.08)') : 'transparent' }}
          >
            ⧗
          </button>
        </div>

        {hasTimeline && (
          <div style={{
            fontFamily: 'var(--mono, monospace)', fontSize: '8.5px', letterSpacing: '0.03em',
            color: glitches.length ? '#ff3b3b' : (theme?.textMuted || '#4a5248'),
          }}>
            {glitches.length > 0
              ? `${glitches.length} glitch${glitches.length > 1 ? 'es' : ''} detected · critical path ${criticalDelay}t (${criticalDelay * TPD_TO_NS}ns)`
              : `no glitches on this transition · critical path ${criticalDelay}t (${criticalDelay * TPD_TO_NS}ns)`}
          </div>
        )}
        {!hasTimeline && (
          <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: '8.5px', color: theme?.textMuted || '#4a5248' }}>
            toggle an input to run the event simulation
          </div>
        )}
      </div>
    </>
  )
}

function btnStyle(enabled) {
  return {
    width: '22px', height: '22px', borderRadius: '5px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
    color: enabled ? '#eef2ee' : '#4a5248', cursor: enabled ? 'pointer' : 'default',
    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: enabled ? 1 : 0.4, padding: 0,
  }
}

const microBtnStyle = {
  width: '14px', height: '14px', borderRadius: '3px', lineHeight: '12px',
  border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(10,13,10,0.85)',
  color: '#eef2ee', cursor: 'pointer', fontSize: '9px', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// Small local mirror of EventSimulator.GATE_DELAY so this file doesn't
// need a second import purely for the fallback label — kept in sync by
// hand since it's a tiny, stable table (see EventSimulator.js GATE_DELAY
// for the authoritative version actually used in simulation).
function GATE_DELAY_OF(type) {
  const table = { NOT: 1, BUF: 1, AND: 2, OR: 2, NAND: 2, NOR: 2, XOR: 4, XNOR: 4 }
  return table[type] ?? 2
}
