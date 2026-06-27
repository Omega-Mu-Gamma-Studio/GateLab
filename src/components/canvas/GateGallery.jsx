/**
 * GateGallery.jsx
 *
 * Shown inside GateCanvas when no unit is active.
 * Interactive 7-gate grid — click to cycle input combinations.
 * Renders directly into an existing Konva Layer (no Stage/Layer here).
 */

import { useState, useCallback } from 'react'
import { Group, Text } from 'react-konva'
import GateShape from '../gates/GateShape'

const GATE_SCALE    = 1.3
const GATE_W_SCALED = 80 * GATE_SCALE
const GATE_H_SCALED = 60 * GATE_SCALE
const COL_GAP = 48
const ROW_GAP = 48

function galleryPositions(canvasW, canvasH) {
  const row1 = ['AND', 'OR', 'NOT', 'NAND']
  const row2 = ['NOR', 'XOR', 'XNOR']
  const totalRow1W = row1.length * GATE_W_SCALED + (row1.length - 1) * COL_GAP
  const totalRow2W = row2.length * GATE_W_SCALED + (row2.length - 1) * COL_GAP
  const totalH  = 2 * GATE_H_SCALED + ROW_GAP
  const startY  = (canvasH - totalH) / 2
  const positions = []
  row1.forEach((type, i) => positions.push({
    id: type, type,
    x: (canvasW - totalRow1W) / 2 + i * (GATE_W_SCALED + COL_GAP),
    y: startY,
  }))
  row2.forEach((type, i) => positions.push({
    id: type, type,
    x: (canvasW - totalRow2W) / 2 + i * (GATE_W_SCALED + COL_GAP),
    y: startY + GATE_H_SCALED + ROW_GAP,
  }))
  return positions
}

function initSigs() {
  return {
    AND:{in0:false,in1:false}, OR:{in0:false,in1:false},
    NOT:{in0:false},           NAND:{in0:false,in1:false},
    NOR:{in0:false,in1:false}, XOR:{in0:false,in1:false},
    XNOR:{in0:false,in1:false},
  }
}

function eval_(type, s) {
  const a = s.in0, b = s.in1
  switch(type) {
    case 'AND': return a&&b;   case 'OR':  return a||b
    case 'NOT': return !a;     case 'NAND':return !(a&&b)
    case 'NOR': return !(a||b);case 'XOR': return a!==b
    case 'XNOR':return a===b;  default:    return false
  }
}

export default function GateGallery({ canvasW, canvasH, theme }) {
  const [sigs,  setSigs]  = useState(initSigs)
  const [cycle, setCycle] = useState({})
  const gates = galleryPositions(canvasW, canvasH)

  const handleClick = useCallback((type) => {
    const twoIn = type !== 'NOT'
    setCycle(prev => {
      const n = ((prev[type]||0)+1) % (twoIn ? 4 : 2)
      setSigs(s => ({
        ...s,
        [type]: twoIn ? {in0:!!(n&2), in1:!!(n&1)} : {in0:!!(n&1)},
      }))
      return { ...prev, [type]: n }
    })
  }, [])

  return (
    <>
      <Text
        x={0} y={12} width={canvasW}
        text="click any gate to cycle inputs  ·  all 7 gate types"
        fontSize={11}
        fontFamily="'JetBrains Mono', monospace"
        fill={theme?.textMuted || '#4a5248'}
        align="center" listening={false}
      />
      {gates.map(g => {
        const s   = sigs[g.type]
        const ins = g.type === 'NOT' ? [s.in0] : [s.in0, s.in1]
        const out = eval_(g.type, s)
        return (
          <Group key={g.id}>
            <Text
              x={g.x - 10} y={g.y - 22}
              width={GATE_W_SCALED + 20}
              text={g.type} fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fill={theme?.accentText || '#4dffac'}
              align="center" listening={false}
            />
            <GateShape
              type={g.type}
              x={g.x} y={g.y} scale={GATE_SCALE}
              inputValues={ins} outputValue={out}
              theme={theme}
              onClick={() => handleClick(g.type)}
            />
            <Text
              x={g.x - 10} y={g.y + GATE_H_SCALED + 10}
              width={GATE_W_SCALED + 20}
              text={g.type==='NOT'
                ? `A=${s.in0?'1':'0'}  →${out?'1':'0'}`
                : `A=${s.in0?'1':'0'}  B=${s.in1?'1':'0'}  →${out?'1':'0'}`}
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fill={out ? (theme?.accent||'#00ff88') : (theme?.textMuted||'#4a5248')}
              align="center" listening={false}
            />
          </Group>
        )
      })}
    </>
  )
}
