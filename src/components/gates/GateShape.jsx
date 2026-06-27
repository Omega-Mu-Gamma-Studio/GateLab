/**
 * GateShape.jsx
 *
 * The universal Konva renderer for all logic gate types.
 *
 * Props:
 *   type              {string}    'AND'|'OR'|'NOT'|'NAND'|'NOR'|'XOR'|'XNOR'
 *   x                 {number}    Canvas X (top-left of bounding box)
 *   y                 {number}    Canvas Y (top-left of bounding box)
 *   scale             {number}    Uniform scale (default 1.0 = 80×60)
 *   inputValues       {boolean[]} Signal per input pin
 *   outputValue       {boolean}   Output signal
 *   error             {boolean}   Red glow — fault node in break phase
 *   selected          {boolean}   Accent glow — selected node
 *   draggable         {boolean}   Allows drag in try phase
 *   onDragEnd         {fn}        Called with { x, y }
 *   onClick           {fn}        Gate body click
 *   onOutputPinClick  {fn}        Output pin circle click — starts a wire
 *   theme             {object}    Tokens from useGateTheme()
 */

import { Group, Path, Circle, Line, Text } from 'react-konva'
import { GATE_GEOMETRY } from './gateGeometry'

// SIG_HIGH is now read from theme.accent — see sigColor()
const SIG_LOW    = '#1a2e1a'
const SIG_UNDEF  = '#4a5248'
const ERROR_GLOW = '#ff3b3b'

const PIN_RADIUS    = 4.5
const PIN_RADIUS_SM = 3.5
// Slightly enlarged hit area on output pin to make it easy to click
const PIN_HIT_RADIUS = 10

function sigColor(val, theme) {
  if (val === true)  return theme?.accent || '#00ff88'
  if (val === false) return SIG_LOW
  return SIG_UNDEF
}

const LABEL_POS = {
  AND:  { x: 30, y: 23 },
  OR:   { x: 32, y: 23 },
  NOT:  { x: 22, y: 23 },
  NAND: { x: 28, y: 23 },
  NOR:  { x: 30, y: 23 },
  XOR:  { x: 34, y: 23 },
  XNOR: { x: 32, y: 23 },
}

function GateLabel({ type, theme }) {
  const pos = LABEL_POS[type] || { x: 30, y: 23 }
  return (
    <Text
      x={pos.x} y={pos.y}
      text={type}
      fontSize={11}
      fontFamily="'JetBrains Mono', monospace"
      fontStyle="500"
      fill={theme.textMuted || '#4a5248'}
      listening={false}
    />
  )
}

export default function GateShape({
  type,
  x = 0,
  y = 0,
  scale = 1,
  inputValues = [],
  outputValue,
  error = false,
  selected = false,
  draggable = false,
  onDragEnd,
  onClick,
  onOutputPinClick,
  theme,
}) {
  const geo = GATE_GEOMETRY[type]
  if (!geo) return null

  const t = theme || {}
  const sigHigh = t.accent || '#00ff88'

  const bodyFill   = error    ? 'rgba(255,59,59,0.12)'
                   : selected ? (t.accentDim || 'rgba(0,255,136,0.12)')
                   :            (t.surface   || '#111411')

  const bodyStroke = error    ? ERROR_GLOW
                   : selected ? (t.accent    || '#00ff88')
                   :            (t.border    || 'rgba(255,255,255,0.18)')

  const bodyGlow   = error    ? ERROR_GLOW
                   : selected ? (t.accent    || '#00ff88')
                   : null

  const outColor   = sigColor(outputValue, t)

  function handleDragEnd(e) {
    onDragEnd?.({ x: e.target.x(), y: e.target.y() })
  }

  // Output pin click must stop propagation so it doesn't also fire onClick
  function handleOutputPinClick(e) {
    e.cancelBubble = true
    onOutputPinClick?.()
  }

  return (
    <Group
      x={x} y={y}
      scaleX={scale} scaleY={scale}
      draggable={draggable}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Input stub lines */}
      {geo.inputStubs.map((stub, i) => (
        <Line
          key={`istub-${i}`}
          points={[stub.x1, stub.y1, stub.x2, stub.y2]}
          stroke={sigColor(inputValues[i], t)}
          strokeWidth={2} lineCap="round"
        />
      ))}

      {/* Output stub line */}
      <Line
        points={[geo.outputStub.x1, geo.outputStub.y1, geo.outputStub.x2, geo.outputStub.y2]}
        stroke={outColor} strokeWidth={2} lineCap="round"
      />

      {/* XOR / XNOR extra arc */}
      {geo.hasExtraArc && geo.extraPath && (
        <Path
          data={geo.extraPath} fill={null}
          stroke={bodyStroke} strokeWidth={2} lineCap="round"
        />
      )}

      {/* Gate body */}
      <Path
        data={geo.path}
        fill={bodyFill} stroke={bodyStroke} strokeWidth={2}
        shadowColor={bodyGlow}
        shadowBlur={bodyGlow ? 14 : 0}
        shadowOpacity={bodyGlow ? 0.7 : 0}
        hitStrokeWidth={10}
      />

      {/* Inversion bubble */}
      {geo.hasBubble && (
        <Circle
          x={geo.bubbleCenter.x} y={geo.bubbleCenter.y}
          radius={geo.bubbleRadius}
          fill={bodyFill} stroke={bodyStroke} strokeWidth={2}
          shadowColor={bodyGlow}
          shadowBlur={bodyGlow ? 10 : 0}
          shadowOpacity={bodyGlow ? 0.7 : 0}
        />
      )}

      {/* Input pin dots */}
      {geo.inputs.map((pin, i) => (
        <Circle
          key={`ipin-${i}`}
          x={pin.x} y={pin.y}
          radius={PIN_RADIUS_SM}
          fill={sigColor(inputValues[i], t)}
          shadowColor={inputValues[i] === true ? sigHigh : undefined}
          shadowBlur={inputValues[i] === true ? 8 : 0}
          shadowOpacity={0.8}
        />
      ))}

      {/* Output pin dot — clickable to start a drag wire */}
      <Circle
        x={geo.output.x} y={geo.output.y}
        radius={PIN_RADIUS}
        fill={outColor}
        shadowColor={outputValue === true ? sigHigh : undefined}
        shadowBlur={outputValue === true ? 10 : 0}
        shadowOpacity={0.9}
      />

      {/* Pulsing glow ring on output pin — only visible in Try phase (when onOutputPinClick is defined) and no wire in flight */}
      {onOutputPinClick && (
        <Circle
          x={geo.output.x} y={geo.output.y}
          radius={10}
          fill="transparent"
          stroke={sigHigh}
          strokeWidth={1.5}
          opacity={0.5}
          className="pin-pulse"
          listening={false}
        />
      )}

      {/* Invisible enlarged hit area over output pin */}
      {onOutputPinClick && (
        <Circle
          x={geo.output.x} y={geo.output.y}
          radius={PIN_HIT_RADIUS}
          fill="transparent"
          onClick={handleOutputPinClick}
          onTap={handleOutputPinClick}
        />
      )}

      {/* Gate label */}
      <GateLabel type={type} theme={t} />
    </Group>
  )
}