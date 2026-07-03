/**
 * SpecialNodes.jsx
 *
 * Konva renderers for non-gate circuit nodes:
 *   InputNode  — driven signal source, clickable to toggle value
 *                output pin is clickable to START a drag wire (try phase)
 *   OutputNode — display-only signal probe (LED), input pin shows snap target
 *   ConstNode  — hardwired 0 or 1, has output pin for wiring
 *
 * Pin click props:
 *   onOutputPinClick  — called when user clicks the output pin dot (INPUT/CONST)
 *   onInputPinClick   — called when user clicks the input pin dot (OUTPUT) — reserved
 *
 * These must match GatePin.js offsets exactly:
 *   INPUT  output pin: (x + INPUT_W + 14, y + INPUT_H/2)
 *   OUTPUT input pin:  (x - 14, y)
 *   CONST  output pin: (x + 50, y + 11)
 */

import { Group, Rect, Circle, Text, Line } from 'react-konva'

// SIG_HIGH now read from theme.accent
const SIG_LOW   = '#1a2e1a'
const SIG_UNDEF = '#4a5248'

// Must match GatePin.js
const INPUT_W  = 48
const INPUT_H  = 32
const LED_R    = 16
const PIN_HIT  = 10   // invisible enlarged hit radius on pins

function sigColor(val, theme) {
  if (val === true)  return theme?.accent || '#00ff88'
  if (val === false) return SIG_LOW
  return SIG_UNDEF
}

// ── INPUT node ─────────────────────────────────────────────────────────────
// Pill with driven value. Click body to toggle. Click output pin to draw wire.
export function InputNode({ node, value, onClick, onOutputPinClick, theme, selected }) {
  const sigHigh = theme?.accent || '#00ff88'
  const col    = sigColor(value, theme)
  const fill   = value ? `${sigHigh}1e` : (theme?.surface || '#111411')
  const stroke = selected ? (theme?.accent || '#00ff88') : (theme?.border || 'rgba(255,255,255,0.18)')
  const label  = node.label || node.id.toUpperCase()

  // Output pin position (world-relative to group origin)
  const pinX = INPUT_W + 14
  const pinY = INPUT_H / 2

  function handlePinClick(e) {
    e.cancelBubble = true
    onOutputPinClick?.()
  }

  return (
    <Group x={node.x} y={node.y}>
      {/* Body — click to toggle */}
      <Rect
        x={0} y={0} width={INPUT_W} height={INPUT_H}
        cornerRadius={6}
        fill={fill} stroke={stroke} strokeWidth={1.5}
        shadowColor={value ? sigHigh : undefined}
        shadowBlur={value ? 10 : 0}
        shadowOpacity={0.5}
        hitStrokeWidth={6}
        onClick={onClick} onTap={onClick}
      />

      {/* Value label inside pill */}
      <Text
        x={0} y={0} width={INPUT_W} height={INPUT_H}
        text={value ? '1' : '0'}
        fontSize={15}
        fontFamily="'JetBrains Mono', monospace"
        fontStyle="500"
        fill={col}
        align="center" verticalAlign="middle"
        listening={false}
      />

      {/* Node ID label below */}
      <Text
        x={0} y={INPUT_H + 3} width={INPUT_W}
        text={label}
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fill={theme?.textMuted || '#4a5248'}
        align="center" listening={false}
      />

      {/* Output stub line */}
      <Line
        points={[INPUT_W, pinY, pinX, pinY]}
        stroke={col} strokeWidth={2} lineCap="round"
        listening={false}
      />

      {/* Output pin dot — visible */}
      <Circle
        x={pinX} y={pinY} radius={4}
        fill={col}
        shadowColor={value ? sigHigh : undefined}
        shadowBlur={value ? 8 : 0}
        shadowOpacity={0.9}
        listening={false}
      />

      {/* Pulsing glow ring — only in try phase (onOutputPinClick defined) */}
      {onOutputPinClick && (
        <Circle
          x={pinX} y={pinY}
          radius={10}
          fill="transparent"
          stroke={sigHigh}
          strokeWidth={1.5}
          opacity={0.5}
          className="pin-pulse"
          listening={false}
        />
      )}

      {/* Output pin — enlarged invisible hit area */}
      {onOutputPinClick && (
        <Circle
          x={pinX} y={pinY} radius={PIN_HIT}
          fill="transparent"
          onMouseDown={handlePinClick}
          onTouchStart={handlePinClick}
          onClick={handlePinClick} onTap={handlePinClick}
        />
      )}

      {/* "drag from here" tooltip hint — only when wiring is enabled */}
      {onOutputPinClick && (
        <Text
          x={pinX + 6} y={pinY - 7}
          text="→"
          fontSize={10}
          fontFamily="'JetBrains Mono', monospace"
          fill={theme?.textMuted || '#4a5248'}
          listening={false}
        />
      )}
    </Group>
  )
}

// ── OUTPUT node ────────────────────────────────────────────────────────────
// LED circle. Glows green when signal HIGH. Input pin visible for snap feedback.
// `onCopyTruthTable` (optional) renders a small "⧉" button above the LED that
// sweeps every INPUT node through true/false and copies a markdown truth
// table to the clipboard — see GateCanvas.handleCopyTruthTable. `copied`
// flashes the button to confirm the copy landed.
export function OutputNode({ node, value, theme, snapTarget, onCopyTruthTable, copied }) {
  const sigHigh = theme?.accent || '#00ff88'
  const col    = sigColor(value, theme)
  const fill   = value ? `${sigHigh}33` : (theme?.surface || '#111411')
  const stroke = value ? sigHigh : (theme?.border || 'rgba(255,255,255,0.18)')
  const label  = node.label || node.id.toUpperCase()

  // Input pin position (world-relative to group origin)
  // Must match GatePin.js: OUTPUT input pin = (node.x - 14, node.y)
  // Since group origin IS node.x/node.y, local coords are (-14, 0)
  const pinX = -14
  const pinY = 0

  // Truth-table copy button — small pill above the LED, out of the way of
  // the input stub and the value label below.
  const btnW = 22
  const btnH = 15
  const btnX = -btnW / 2
  const btnY = -LED_R - btnH - 6

  function handleCopyClick(e) {
    e.cancelBubble = true
    onCopyTruthTable?.()
  }

  return (
    <Group x={node.x} y={node.y}>
      {onCopyTruthTable && (
        <Group onClick={handleCopyClick} onTap={handleCopyClick}>
          <Rect
            x={btnX} y={btnY} width={btnW} height={btnH}
            cornerRadius={4}
            fill={copied ? `${sigHigh}33` : (theme?.surface || '#111411')}
            stroke={copied ? sigHigh : (theme?.border || 'rgba(255,255,255,0.25)')}
            strokeWidth={1}
            hitStrokeWidth={4}
          />
          <Text
            x={btnX} y={btnY} width={btnW} height={btnH}
            text={copied ? '✓' : '⧉'}
            fontSize={copied ? 10 : 9}
            fontFamily="'JetBrains Mono', monospace"
            fill={copied ? sigHigh : (theme?.textMuted || '#4a5248')}
            align="center" verticalAlign="middle"
            listening={false}
          />
        </Group>
      )}
      {/* Input stub */}
      <Line
        points={[pinX, pinY, 0, pinY]}
        stroke={col} strokeWidth={2} lineCap="round"
        listening={false}
      />

      {/* Input pin dot — glows accent when it's a snap target during drag */}
      <Circle
        x={pinX} y={pinY} radius={4}
        fill={snapTarget ? (theme?.accent || sigHigh) : col}
        shadowColor={snapTarget ? (theme?.accent || sigHigh) : (value ? sigHigh : undefined)}
        shadowBlur={snapTarget ? 14 : value ? 8 : 0}
        shadowOpacity={0.9}
        listening={false}
      />

      {/* LED circle */}
      <Circle
        x={0} y={0} radius={LED_R}
        fill={fill} stroke={stroke} strokeWidth={2}
        shadowColor={value ? sigHigh : undefined}
        shadowBlur={value ? 18 : 0}
        shadowOpacity={0.8}
      />

      {/* Value inside LED */}
      <Text
        x={-LED_R} y={-LED_R} width={LED_R * 2} height={LED_R * 2}
        text={value === undefined ? '?' : value ? '1' : '0'}
        fontSize={13}
        fontFamily="'JetBrains Mono', monospace"
        fontStyle="500"
        fill={value ? sigHigh : (theme?.textMuted || '#4a5248')}
        align="center" verticalAlign="middle"
        listening={false}
      />

      {/* Label below */}
      <Text
        x={-LED_R} y={LED_R + 4} width={LED_R * 2}
        text={label}
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fill={theme?.textMuted || '#4a5248'}
        align="center" listening={false}
      />
    </Group>
  )
}

// ── CONST node ─────────────────────────────────────────────────────────────
// Hardwired VCC (1) or GND (0). Output pin clickable for wiring.
export function ConstNode({ node, onOutputPinClick, theme }) {
  const val   = !!node.value
  const sigHigh = theme?.accent || '#00ff88'
  const col   = sigColor(val, theme)
  const label = val ? 'VCC' : 'GND'

  const pinX = 50
  const pinY = 11

  function handlePinClick(e) {
    e.cancelBubble = true
    onOutputPinClick?.()
  }

  return (
    <Group x={node.x} y={node.y}>
      <Rect
        x={0} y={0} width={36} height={22}
        cornerRadius={4}
        fill={theme?.surface || '#111411'}
        stroke={theme?.border || 'rgba(255,255,255,0.18)'}
        strokeWidth={1}
      />
      <Text
        x={0} y={0} width={36} height={22}
        text={label}
        fontSize={8}
        fontFamily="'JetBrains Mono', monospace"
        fill={col}
        align="center" verticalAlign="middle"
        listening={false}
      />

      {/* Output stub */}
      <Line
        points={[36, pinY, pinX, pinY]}
        stroke={col} strokeWidth={2} lineCap="round"
        listening={false}
      />

      {/* Output pin dot */}
      <Circle
        x={pinX} y={pinY} radius={3.5}
        fill={col}
        listening={false}
      />

      {/* Pulsing glow ring — only in try phase */}
      {onOutputPinClick && (
        <Circle
          x={pinX} y={pinY}
          radius={10}
          fill="transparent"
          stroke={sigHigh}
          strokeWidth={1.5}
          opacity={0.5}
          className="pin-pulse"
          listening={false}
        />
      )}

      {/* Enlarged hit area */}
      {onOutputPinClick && (
        <Circle
          x={pinX} y={pinY} radius={PIN_HIT}
          fill="transparent"
          onMouseDown={handlePinClick}
          onTouchStart={handlePinClick}
          onClick={handlePinClick} onTap={handlePinClick}
        />
      )}
    </Group>
  )
}