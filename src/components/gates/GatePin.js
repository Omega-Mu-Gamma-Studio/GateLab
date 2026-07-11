/**
 * GatePin.js
 *
 * World-space pin coordinate resolver for ALL node types:
 * gates (AND/OR/etc), INPUT, OUTPUT, CONST.
 *
 * INPUT node  — output pin is at right edge center: (x + 48 + 14, y + 16)
 * OUTPUT node — input pin is at left stub:          (x - 14, y)
 * CONST node  — output pin is at right stub:        (x + 50, y + 11)
 * Gates       — resolved from gateGeometry, scaled
 *
 * These offsets must match SpecialNodes.jsx exactly.
 */
import { GATE_GEOMETRY } from './gateGeometry'
import { getCompositeGeometry } from './compositeGeometry'

// Must match SpecialNodes.jsx constants
const INPUT_W  = 48
const INPUT_H  = 32
const LED_R    = 16

/**
 * pinForComposite(node, role, index)
 * COMPOSITE nodes have NAMED, multi-pin edges on both sides (S/R/CLK etc.
 * on the left, Q/Qbar on the right) rather than the single-output/N-input
 * shape every other node type has — see compositeGeometry.js.
 */
function pinForComposite(node, role, index = 0) {
  const geo = getCompositeGeometry(node.ffKind)
  if (!geo) return { x: node.x, y: node.y }

  const scale = node.scale ?? 1
  const list = role === 'output' ? geo.outputs : geo.inputs
  const pin = list[index] ?? list[0]
  if (!pin) return { x: node.x, y: node.y }
  return { x: node.x + pin.x * scale, y: node.y + pin.y * scale }
}

function pinForSpecial(node, role, index) {
  const scale = node.scale ?? 1   // special nodes don't scale visually but keep API consistent

  switch (node.type) {
    case 'INPUT':
      // only has an output pin on the right
      return role === 'output'
        ? { x: node.x + INPUT_W + 14, y: node.y + INPUT_H / 2 }
        : { x: node.x, y: node.y + INPUT_H / 2 }   // fallback

    case 'OUTPUT':
      // only has an input pin on the left stub
      return { x: node.x - 14, y: node.y }

    case 'CONST':
      // only has an output pin on the right stub
      return role === 'output'
        ? { x: node.x + 50, y: node.y + 11 }
        : { x: node.x, y: node.y + 11 }

    default:
      return { x: node.x, y: node.y }
  }
}

const SPECIAL_TYPES = new Set(['INPUT', 'OUTPUT', 'CONST', 'CLOCK'])

/**
 * getPinWorldPos(node, role, index?)
 * Returns { x, y } in canvas coordinates.
 */
export function getPinWorldPos(node, role, index = 0) {
  if (node.type === 'COMPOSITE') return pinForComposite(node, role, index)
  if (SPECIAL_TYPES.has(node.type)) return pinForSpecial(node, role, index)

  const geo = GATE_GEOMETRY[node.type]
  if (!geo) return { x: node.x, y: node.y }

  const scale = node.scale ?? 1

  if (role === 'output') {
    return {
      x: node.x + geo.output.x * scale,
      y: node.y + geo.output.y * scale,
    }
  }

  const pin = geo.inputs[index]
  if (!pin) return { x: node.x, y: node.y }
  return {
    x: node.x + pin.x * scale,
    y: node.y + pin.y * scale,
  }
}

/**
 * getAllPins(node)
 * Returns { inputs: [{x,y},...], output: {x,y} }
 * Used for drag-wire snap hit-testing.
 */
export function getAllPins(node) {
  if (node.type === 'COMPOSITE') {
    const geo = getCompositeGeometry(node.ffKind)
    if (!geo) return { inputs: [], output: null, outputs: [] }

    const scale = node.scale ?? 1
    const inputs = geo.inputs.map((pin, i) => ({
      x: node.x + pin.x * scale,
      y: node.y + pin.y * scale,
      index: i,
      name: pin.name,
    }))
    const outputs = geo.outputs.map((pin, i) => ({
      x: node.x + pin.x * scale,
      y: node.y + pin.y * scale,
      index: i,
      name: pin.name,
    }))
    // `output` mirrors outputs[0] (Q) — kept for any caller still expecting
    // the single-pin shape every other node type has.
    return { inputs, output: outputs[0] || null, outputs }
  }

  if (SPECIAL_TYPES.has(node.type)) {
    if (node.type === 'INPUT' || node.type === 'CONST') {
      const output = pinForSpecial(node, 'output')
      return { inputs: [], output, outputs: [output] }
    }
    if (node.type === 'OUTPUT') {
      return { inputs: [pinForSpecial(node, 'input')], output: null, outputs: [] }
    }
    return { inputs: [], output: null, outputs: [] }
  }

  const geo = GATE_GEOMETRY[node.type]
  if (!geo) return { inputs: [], output: null, outputs: [] }

  const scale = node.scale ?? 1
  const output = {
    x: node.x + geo.output.x * scale,
    y: node.y + geo.output.y * scale,
  }
  return {
    inputs: geo.inputs.map((pin, i) => ({
      x: node.x + pin.x * scale,
      y: node.y + pin.y * scale,
      index: i,
    })),
    output,
    outputs: [output],
  }
}
