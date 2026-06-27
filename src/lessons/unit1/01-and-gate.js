/**
 * Unit I · Lesson 01 — AND Gate
 *
 * Teaches: the AND gate computes logical conjunction.
 * Output is HIGH only when ALL inputs are HIGH.
 *
 * Phases:
 *   work  — both inputs HIGH, output HIGH, fully wired
 *   break — one wire broken (input B disconnected), output undefined → LOW
 *   try   — student wires two inputs to an AND gate, must make output HIGH
 */

const NODES_FULL = [
  { id: 'inA',  type: 'INPUT',  x: 80,  y: 120, scale: 1 },
  { id: 'inB',  type: 'INPUT',  x: 80,  y: 240, scale: 1 },
  { id: 'g1',   type: 'AND',    x: 260, y: 150, scale: 1.3 },
  { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'inA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'g1',  pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-01',
    title:       'AND Gate',
    unit:        1,
    lessonIndex: 0,
    concept:     'AND',
    panels:      [],
  },

  phases: {
    // ── See It Work ──────────────────────────────────────────────────────
    work: {
      hint: 'Both inputs are HIGH. The AND gate outputs HIGH — all inputs must agree.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: true, inB: true },
    },

    // ── See It Break ─────────────────────────────────────────────────────
    break: {
      hint: 'Input B is disconnected. The AND gate sees a floating input — output collapses to LOW. Click the broken wire to inspect it.',
      faultNodeId: 'g1',
      nodes: NODES_FULL,
      inputs: { inA: true, inB: false },
      wires: [
        { id: 'w1', from: { nodeId: 'inA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'inB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'g1',  pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
      ],
    },

    // ── You Try ──────────────────────────────────────────────────────────
    try: {
      hint: 'Wire input A and input B to the AND gate. Then wire the AND gate to the output. Toggle the inputs — can you make the output go HIGH?',
      nodes: [
        { id: 'inA',  type: 'INPUT',  x: 80,  y: 120, scale: 1,   locked: false },
        { id: 'inB',  type: 'INPUT',  x: 80,  y: 240, scale: 1,   locked: false },
        { id: 'g1',   type: 'AND',    x: 260, y: 150, scale: 1.3, locked: false },
        { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
      ],
      inputs: { inA: false, inB: false },
      wires: [],
    },
  },
}
