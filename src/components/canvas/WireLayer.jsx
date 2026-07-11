/**
 * WireLayer.jsx
 *
 * Renders all committed wires + the in-progress drag wire ghost.
 * Each wire is a Konva Line using routeWire() for its points.
 *
 * Wire visual states:
 *   HIGH         → theme accent colour, 2px solid
 *   LOW          → dark dead green, 2px solid
 *   UNDEF        → muted grey, 2px dashed
 *   BROKEN       → red (#ff3b3b), 2px dashed
 *   GHOST search → accent colour @ low opacity, dashed, thin — drag in
 *                  progress, not currently over a valid input pin
 *   GHOST snap   → accent colour @ full opacity, mostly-solid, thicker,
 *                  glowing — drag in progress AND over a pin it would
 *                  connect to on release. Mirrors the per-pin highlight
 *                  in GateShape/OutputNode so the wire and the pin agree.
 */

import { Line, Circle } from 'react-konva'
import { routeWire } from '../../engine/WireRouter'
import { getPinWorldPos } from '../gates/GatePin'
import { getSignalForWire } from '../../engine/GraphEvaluator'

const SIG_LOW    = '#1a2e1a'
const SIG_UNDEF  = '#4a5248'
const SIG_BROKEN = '#ff3b3b'

function getWireColor(value, broken, theme) {
  if (broken)           return SIG_BROKEN
  if (value === true)   return theme?.accent || '#00ff88'
  if (value === false)  return SIG_LOW
  return SIG_UNDEF
}

function getWireDash(value, broken) {
  if (broken)          return [6, 4]
  if (value === undefined) return [4, 4]
  return []
}

// Resolve the world-space endpoints of a wire using the node array
function resolveWireEndpoints(wire, nodes) {
  const fromNode = nodes.find(n => n.id === wire.from.nodeId)
  const toNode   = nodes.find(n => n.id === wire.to.nodeId)
  if (!fromNode || !toNode) return null

  const fromPos = getPinWorldPos(fromNode, 'output', wire.from.index ?? 0)
  const toPos   = getPinWorldPos(toNode,   'input', wire.to.index ?? 0)
  return { fromPos, toPos }
}

export default function WireLayer({ nodes, wires, signals, dragWire, dragValid = false, theme, onWireClick }) {
  const sigHigh = theme?.accent || '#00ff88'

  return (
    <>
      {/* ── Committed wires ──────────────────────────────────────────── */}
      {wires.map(wire => {
        const endpoints = resolveWireEndpoints(wire, nodes)
        if (!endpoints) return null

        const { fromPos, toPos } = endpoints
        const sigValue = getSignalForWire(wire, signals)
        const broken   = !!wire.broken

        const color  = getWireColor(sigValue, broken, theme)
        const dash   = getWireDash(sigValue, broken)
        const points = routeWire(fromPos, toPos, wire.waypoints)

        return (
          <Line
            key={wire.id}
            points={points}
            stroke={color}
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
            dash={dash}
            shadowColor={sigValue === true && !broken ? sigHigh : undefined}
            shadowBlur={sigValue === true && !broken ? 6 : 0}
            shadowOpacity={0.5}
            hitStrokeWidth={10}
            onClick={() => onWireClick?.(wire.id)}
            onTap={() => onWireClick?.(wire.id)}
          />
        )
      })}

      {/* ── Ghost drag wire ───────────────────────────────────────────── */}
      {dragWire && (
        <Line
          points={routeWire(dragWire.fromPos, dragWire.currentPos)}
          stroke={theme?.accent || sigHigh}
          strokeWidth={dragValid ? 2.5 : 1.5}
          lineCap="round"
          lineJoin="round"
          dash={dragValid ? [10, 2] : [5, 4]}
          opacity={dragValid ? 1 : 0.7}
          shadowColor={dragValid ? (theme?.accent || sigHigh) : undefined}
          shadowBlur={dragValid ? 10 : 0}
          shadowOpacity={0.6}
          listening={false}
        />
      )}
    </>
  )
}