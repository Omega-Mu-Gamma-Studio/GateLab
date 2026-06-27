/**
 * gateGeometry.js
 *
 * Single source of truth for all gate shapes and pin positions.
 *
 * Each gate is defined at a CANONICAL size of 80×60 (w×h) with the
 * output pin always at the right edge, and input pins on the left edge.
 * The GateShape component scales these via Konva Group scaleX/scaleY.
 *
 * Path data uses SVG path syntax — Konva's Path shape accepts it natively.
 *
 * Pin positions are { x, y } relative to the gate's top-left origin (0,0).
 * 'output' is always a single pin.
 * 'inputs' is an array — single-input gates (NOT) have one entry.
 *
 * The bubble (small inversion circle) is drawn separately by GateShape
 * when `hasBubble: true` is set, centered at `bubbleCenter`.
 */

export const GATE_W = 80
export const GATE_H = 60

// ─────────────────────────────────────────────────────────────────────────────
// AND gate
// Classic flat-back / curved-front "D" shape
// ─────────────────────────────────────────────────────────────────────────────
export const AND = {
  path: `
    M 10 5
    L 44 5
    C 72 5 72 55 44 55
    L 10 55
    Z
  `,
  inputs: [
    { x: 10, y: 18 },
    { x: 10, y: 42 },
  ],
  output: { x: 70, y: 30 },
  // Stub lines from canvas edge to body edge (for clean pin entry look)
  inputStubs: [
    { x1: 0, y1: 18, x2: 10, y2: 18 },
    { x1: 0, y1: 42, x2: 10, y2: 42 },
  ],
  outputStub: { x1: 70, y1: 30, x2: 80, y2: 30 },
  hasBubble: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// OR gate
// The classic pointy-output shape with a concave back
// ─────────────────────────────────────────────────────────────────────────────
export const OR = {
  path: `
    M 10 5
    Q 26 5 38 5
    C 65 5 72 30 72 30
    C 72 30 65 55 38 55
    Q 26 55 10 55
    Q 22 30 10 5
    Z
  `,
  inputs: [
    { x: 14, y: 18 },
    { x: 14, y: 42 },
  ],
  output: { x: 72, y: 30 },
  inputStubs: [
    { x1: 0, y1: 18, x2: 14, y2: 18 },
    { x1: 0, y1: 42, x2: 14, y2: 42 },
  ],
  outputStub: { x1: 72, y1: 30, x2: 80, y2: 30 },
  hasBubble: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// NOT gate (inverter)
// Triangle pointing right with a bubble on the output
// ─────────────────────────────────────────────────────────────────────────────
export const NOT = {
  path: `
    M 10 5
    L 62 30
    L 10 55
    Z
  `,
  inputs: [
    { x: 10, y: 30 },
  ],
  output: { x: 72, y: 30 },
  inputStubs: [
    { x1: 0, y1: 30, x2: 10, y2: 30 },
  ],
  outputStub: { x1: 72, y1: 30, x2: 80, y2: 30 },
  hasBubble: true,
  bubbleCenter: { x: 67, y: 30 },
  bubbleRadius: 5,
}

// ─────────────────────────────────────────────────────────────────────────────
// NAND gate = AND body + output bubble
// ─────────────────────────────────────────────────────────────────────────────
export const NAND = {
  path: AND.path,
  inputs: AND.inputs,
  output: { x: 75, y: 30 },
  inputStubs: AND.inputStubs,
  outputStub: { x1: 75, y1: 30, x2: 80, y2: 30 },
  hasBubble: true,
  bubbleCenter: { x: 72, y: 30 },
  bubbleRadius: 4,
}

// ─────────────────────────────────────────────────────────────────────────────
// NOR gate = OR body + output bubble
// ─────────────────────────────────────────────────────────────────────────────
export const NOR = {
  path: OR.path,
  inputs: OR.inputs,
  output: { x: 77, y: 30 },
  inputStubs: OR.inputStubs,
  outputStub: { x1: 77, y1: 30, x2: 80, y2: 30 },
  hasBubble: true,
  bubbleCenter: { x: 74, y: 30 },
  bubbleRadius: 4,
}

// ─────────────────────────────────────────────────────────────────────────────
// XOR gate = OR shape with extra concave arc line behind the back
// ─────────────────────────────────────────────────────────────────────────────
export const XOR = {
  // Main body (same as OR)
  path: OR.path,
  // Extra back-arc drawn as a separate path (rendered by GateShape)
  extraPath: `
    M 5 5
    Q 17 30 5 55
  `,
  inputs: OR.inputs,
  output: OR.output,
  inputStubs: [
    { x1: 0, y1: 18, x2: 18, y2: 18 },
    { x1: 0, y1: 42, x2: 18, y2: 42 },
  ],
  outputStub: OR.outputStub,
  hasBubble: false,
  hasExtraArc: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// XNOR gate = XOR + output bubble
// ─────────────────────────────────────────────────────────────────────────────
export const XNOR = {
  path: OR.path,
  extraPath: XOR.extraPath,
  inputs: OR.inputs,
  output: { x: 77, y: 30 },
  inputStubs: XOR.inputStubs,
  outputStub: { x1: 77, y1: 30, x2: 80, y2: 30 },
  hasBubble: true,
  bubbleCenter: { x: 74, y: 30 },
  bubbleRadius: 4,
  hasExtraArc: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry — look up geometry by gate type string
// ─────────────────────────────────────────────────────────────────────────────
export const GATE_GEOMETRY = {
  AND,
  OR,
  NOT,
  NAND,
  NOR,
  XOR,
  XNOR,
}
