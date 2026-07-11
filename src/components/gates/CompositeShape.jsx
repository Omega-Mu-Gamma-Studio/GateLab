/**
 * CompositeShape.jsx
 *
 * Konva renderer for COMPOSITE nodes — a whole flip-flop drawn as a single
 * labeled black-box rectangle (Block Mode) instead of its full NAND-level
 * netlist. Behavior comes from FlipFlopModels.nextState() via
 * GraphEvaluator's COMPOSITE dispatch; this component only draws the box,
 * named pins, and live signal state — see compositeGeometry.js for layout.
 *
 * This is the "compose it" counterpart to GateShape's "derive it" gates —
 * meant for counters, multi-bit adders, PLA/PAL arrays, memory grids: any
 * lesson that chains several already-understood flip-flops rather than
 * teaching one from scratch. The 01–05 "build it" lessons keep using raw
 * GateShape gates; this is deliberately a separate component rather than a
 * new GATE_GEOMETRY entry, since composite pins are named (S/R/CLK/Q/Qbar)
 * and multi-output, which the single-output GateShape contract doesn't
 * model.
 *
 * The small ⤢ mark in the top-right corner is reserved for a future Expand
 * mode (a read-only peek at the gate-level netlist inside). It's purely
 * decorative right now — onExpandClick is accepted but no caller wires it
 * up to anything yet.
 *
 * Props:
 *   node              {object}    { id, type:'COMPOSITE', ffKind, x, y, scale, label? }
 *   inputValues       {boolean[]} signal per input pin, in COMPOSITE_INPUT_PINS order
 *   outputValues      {boolean[]} [Q, Qbar]
 *   error             {boolean}
 *   selected          {boolean}
 *   draggable         {boolean}
 *   onDragEnd         {fn}        ({x,y})
 *   onClick           {fn}
 *   onOutputPinClick  {fn}        (outputIndex) — starts a wire from Q (0) or Qbar (1)
 *   onExpandClick     {fn}        reserved — not called by any current caller
 *   theme             {object}
 *   snapPinIndex      {number}    input pin index currently in snap range, or -1
 */

import { Group, Rect, Circle, Text, Line } from 'react-konva'
import { getCompositeGeometry } from './compositeGeometry'

const SIG_LOW        = '#1a2e1a'
const SIG_UNDEF      = '#4a5248'
const ERROR_GLOW     = '#ff3b3b'
const PIN_RADIUS     = 4.5
const PIN_HIT_RADIUS = 10

function sigColor(val, theme) {
  if (val === true)  return theme?.accent || '#00ff88'
  if (val === false) return SIG_LOW
  return SIG_UNDEF
}

export default function CompositeShape({
  node,
  inputValues = [],
  outputValues = [],
  error = false,
  selected = false,
  draggable = false,
  onDragEnd,
  onClick,
  onOutputPinClick,
  onExpandClick,
  theme,
  snapPinIndex = -1,
}) {
  const geo = getCompositeGeometry(node.ffKind)
  if (!geo) return null

  const scale = node.scale ?? 1
  const t = theme || {}
  const sigHigh = t.accent || '#00ff88'

  const bodyFill   = error    ? 'rgba(255,59,59,0.12)'
                   : selected ? (t.accentDim || 'rgba(0,255,136,0.12)')
                   :            (t.surface   || '#111411')

  const bodyStroke = error    ? ERROR_GLOW
                   : selected ? (t.accent    || '#00ff88')
                   :            (t.border    || 'rgba(255,255,255,0.25)')

  const bodyGlow   = error ? ERROR_GLOW : selected ? (t.accent || '#00ff88') : null

  function handleDragEnd(e) {
    onDragEnd?.({ x: e.target.x(), y: e.target.y() })
  }

  function makeOutputPinHandler(index) {
    return (e) => {
      e.cancelBubble = true
      onOutputPinClick?.(index)
    }
  }

  function handleExpandClick(e) {
    e.cancelBubble = true
    onExpandClick?.()
  }

  return (
    <Group
      x={node.x} y={node.y}
      scaleX={scale} scaleY={scale}
      draggable={draggable}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Input stub lines + pin dots + name labels */}
      {geo.inputs.map((pin, i) => {
        const isSnap = i === snapPinIndex
        const val = inputValues[i]
        const col = isSnap ? sigHigh : sigColor(val, t)
        return (
          <Group key={`in-${pin.name}`}>
            <Line
              points={[pin.x - 14, pin.y, pin.x, pin.y]}
              stroke={col}
              strokeWidth={isSnap ? 3 : 2}
              lineCap="round"
              shadowColor={isSnap ? sigHigh : undefined}
              shadowBlur={isSnap ? 8 : 0}
              shadowOpacity={0.7}
            />
            <Circle
              x={pin.x} y={pin.y}
              radius={isSnap ? PIN_RADIUS + 2 : PIN_RADIUS}
              fill={col}
              stroke={isSnap ? sigHigh : undefined}
              strokeWidth={isSnap ? 2 : 0}
              shadowColor={isSnap || val === true ? sigHigh : undefined}
              shadowBlur={isSnap ? 14 : val === true ? 8 : 0}
              shadowOpacity={0.85}
            />
            <Text
              x={pin.x + 6} y={pin.y - 16}
              text={pin.name}
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fontStyle="500"
              fill={t.textMuted || '#8a9488'}
              listening={false}
            />
          </Group>
        )
      })}

      {/* Output stub lines + pin dots + name labels (Q, Qbar) */}
      {geo.outputs.map((pin, i) => {
        const val = outputValues[i]
        const col = sigColor(val, t)
        return (
          <Group key={`out-${pin.name}`}>
            <Line
              points={[pin.x, pin.y, pin.x + 14, pin.y]}
              stroke={col} strokeWidth={2} lineCap="round"
            />
            <Circle
              x={pin.x} y={pin.y}
              radius={PIN_RADIUS}
              fill={col}
              shadowColor={val === true ? sigHigh : undefined}
              shadowBlur={val === true ? 10 : 0}
              shadowOpacity={0.9}
            />
            {onOutputPinClick && (
              <>
                <Circle
                  x={pin.x} y={pin.y}
                  radius={10}
                  fill="transparent"
                  stroke={sigHigh}
                  strokeWidth={1.5}
                  opacity={0.5}
                  className="pin-pulse"
                  listening={false}
                />
                <Circle
                  x={pin.x} y={pin.y} radius={PIN_HIT_RADIUS}
                  fill="transparent"
                  onMouseDown={makeOutputPinHandler(i)}
                  onTouchStart={makeOutputPinHandler(i)}
                  onClick={makeOutputPinHandler(i)}
                  onTap={makeOutputPinHandler(i)}
                />
              </>
            )}
            <Text
              x={pin.x + 16} y={pin.y - 6}
              text={pin.name === 'Qbar' ? 'Q̄' : pin.name}
              fontSize={11}
              fontFamily="'JetBrains Mono', monospace"
              fontStyle="500"
              fill={t.textMuted || '#8a9488'}
              listening={false}
            />
          </Group>
        )
      })}

      {/* Body */}
      <Rect
        x={0} y={0} width={geo.w} height={geo.h}
        cornerRadius={8}
        fill={bodyFill} stroke={bodyStroke} strokeWidth={2}
        shadowColor={bodyGlow}
        shadowBlur={bodyGlow ? 14 : 0}
        shadowOpacity={bodyGlow ? 0.7 : 0}
        hitStrokeWidth={10}
      />

      {/* Kind label, centered */}
      <Text
        x={0} y={geo.h / 2 - 9} width={geo.w}
        text={geo.label}
        fontSize={13}
        fontFamily="'JetBrains Mono', monospace"
        fontStyle="600"
        fill={t.text || '#e8ede6'}
        align="center"
        listening={false}
      />

      {/* Node id, small, below the kind label */}
      <Text
        x={0} y={geo.h / 2 + 7} width={geo.w}
        text={node.label || node.id}
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fill={t.textMuted || '#4a5248'}
        align="center"
        listening={false}
      />

      {/* Expand affordance — reserved for a future read-only netlist peek.
          Rendered now so the box reads as "there's more inside" even
          before that interaction exists; inert unless onExpandClick is
          passed, which no current caller does. */}
      <Group x={geo.w - 20} y={8} onClick={onExpandClick ? handleExpandClick : undefined}>
        <Circle
          x={7} y={7} radius={9}
          fill="transparent"
          stroke={t.border || 'rgba(255,255,255,0.3)'}
          strokeWidth={1}
        />
        <Text
          x={0} y={0} width={14} height={14}
          text="⤢"
          fontSize={9}
          fill={t.textMuted || '#4a5248'}
          align="center" verticalAlign="middle"
          listening={false}
        />
      </Group>
    </Group>
  )
}
