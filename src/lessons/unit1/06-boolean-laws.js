/**
 * Unit I · Lesson 06 — Boolean Laws
 *
 * Narrative context:
 *   Work Order WO-0054 — Deck 7, relay panel audit.
 *   A junior tech wired a 4-gate circuit that can be reduced to 2 gates.
 *   The redundant wiring is drawing unnecessary current and running hot.
 *   Player sees the OVER-ENGINEERED circuit (work phase), sees it FAULT
 *   because the excess heat tripped a thermal cutoff (break phase), then
 *   re-wires the SIMPLIFIED equivalent (try phase).
 *
 *   Over-engineered: (A OR A) AND (B AND B) = A AND B
 *   Simplified to:    A AND B
 *
 *   Laws demonstrated:
 *     Idempotent:  A + A = A,  A·A = A
 *     The player learns that the engine doesn't care — same truth table.
 *
 * Engineering framing:
 *   Boolean laws aren't abstract — every redundant gate is a failure point
 *   and a power draw. Minimization is engineering discipline.
 */

// Over-engineered circuit: (A OR A) AND (B AND B)
const NODES_BLOATED = [
  { id: 'inA1',  type: 'INPUT',  x: 50,  y: 80,  scale: 1 },
  { id: 'inA2',  type: 'INPUT',  x: 50,  y: 170, scale: 1 },
  { id: 'orA',   type: 'OR',     x: 200, y: 100, scale: 1.1 },

  { id: 'inB1',  type: 'INPUT',  x: 50,  y: 300, scale: 1 },
  { id: 'inB2',  type: 'INPUT',  x: 50,  y: 390, scale: 1 },
  { id: 'andB',  type: 'AND',    x: 200, y: 320, scale: 1.1 },

  { id: 'main',  type: 'AND',    x: 370, y: 195, scale: 1.2 },
  { id: 'out',   type: 'OUTPUT', x: 560, y: 240, scale: 1 },
]

const WIRES_BLOATED = [
  { id: 'b1', from: { nodeId: 'inA1', pin: 'output' }, to: { nodeId: 'orA',  pin: 'input', index: 0 } },
  { id: 'b2', from: { nodeId: 'inA2', pin: 'output' }, to: { nodeId: 'orA',  pin: 'input', index: 1 } },
  { id: 'b3', from: { nodeId: 'inB1', pin: 'output' }, to: { nodeId: 'andB', pin: 'input', index: 0 } },
  { id: 'b4', from: { nodeId: 'inB2', pin: 'output' }, to: { nodeId: 'andB', pin: 'input', index: 1 } },
  { id: 'b5', from: { nodeId: 'orA',  pin: 'output' }, to: { nodeId: 'main', pin: 'input', index: 0 } },
  { id: 'b6', from: { nodeId: 'andB', pin: 'output' }, to: { nodeId: 'main', pin: 'input', index: 1 } },
  { id: 'b7', from: { nodeId: 'main', pin: 'output' }, to: { nodeId: 'out',  pin: 'input', index: 0 } },
]

// Simplified: A AND B
const NODES_SIMPLE = [
  { id: 'inA',  type: 'INPUT',  x: 80,  y: 120, scale: 1 },
  { id: 'inB',  type: 'INPUT',  x: 80,  y: 240, scale: 1 },
  { id: 'g1',   type: 'AND',    x: 260, y: 150, scale: 1.3 },
  { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
]

const WIRES_SIMPLE = [
  { id: 'w1', from: { nodeId: 'inA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'g1',  pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-06',
    title:       'Boolean Laws',
    unit:        1,
    lessonIndex: 5,
    concept:     'BOOLEAN_LAWS',
    panels:      [],
    workOrder:   'WO-0054',
    location:    'Deck 7 · Relay Panel R-4',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Panel R-4. Junior tech left a circuit on here during last week's training exercise and nobody cleared it.\n\nSeven gates to do the job of two. I'm not saying the logic is wrong — it isn't. (A OR A) is just A. (B AND B) is just B. Then AND them together. Idempotent law, both directions. The circuit produces the right output.\n\nIt's also running at 140% thermal load because of the redundant paths. The cutoff tripped an hour ago. Panel's been dark since.",
    briefing: 'Relay panel R-4 circuit over-engineered during training. Seven-gate implementation of a two-gate function. Thermal cutoff tripped due to excess current draw. Simplification required.',
    fault:    'INCIDENT REPORT: Relay panel R-4 thermal cutoff triggered. Root cause: redundant gate network drawing excess current. Circuit logic correct but unminimized. Panel offline.',
    dispatch: 'Replace the seven-gate circuit with its Boolean equivalent: two inputs, one AND gate, one output. Same truth table. Fewer failure points. No more heat.',
    success:  'Panel R-4 simplified and restored. Thermal load nominal. WO-0054 closed by Alpha Shift.',
    lore:     'Boolean algebra laws are not theoretical exercises. Every redundant gate is a physical object: it draws power, generates heat, and can fail. The idempotent law (A + A = A, A·A = A) is the simplest case. DeMorgan\'s theorem is the most powerful. Every simplification step you skip in design is a gate you have to maintain, cool, and eventually replace.',
  },

  phases: {
    work: {
      hint: 'Seven gates. A OR A = A. B AND B = B. Then AND the results. Correct — but redundant.',
      nodes: NODES_BLOATED,
      wires: WIRES_BLOATED,
      inputs: { inA1: true, inA2: true, inB1: true, inB2: true },
    },
    break: {
      hint: 'Thermal cutoff tripped the main AND gate. Panel offline — seven gates running hot.',
      faultNodeId: 'main',
      nodes: NODES_BLOATED,
      inputs: { inA1: true, inA2: true, inB1: true, inB2: true },
      wires: [
        { id: 'b1', from: { nodeId: 'inA1', pin: 'output' }, to: { nodeId: 'orA',  pin: 'input', index: 0 } },
        { id: 'b2', from: { nodeId: 'inA2', pin: 'output' }, to: { nodeId: 'orA',  pin: 'input', index: 1 } },
        { id: 'b3', from: { nodeId: 'inB1', pin: 'output' }, to: { nodeId: 'andB', pin: 'input', index: 0 } },
        { id: 'b4', from: { nodeId: 'inB2', pin: 'output' }, to: { nodeId: 'andB', pin: 'input', index: 1 } },
        { id: 'b5', from: { nodeId: 'orA',  pin: 'output' }, to: { nodeId: 'main', pin: 'input', index: 0 } },
        { id: 'b6', from: { nodeId: 'andB', pin: 'output' }, to: { nodeId: 'main', pin: 'input', index: 1 } },
        { id: 'b7', from: { nodeId: 'main', pin: 'output' }, to: { nodeId: 'out',  pin: 'input', index: 0 }, broken: true },
      ],
    },
    try: {
      hint: 'Two inputs. One AND gate. Same logic, two gates instead of seven. Wire it.',
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