/**
 * Unit II · Lesson 09 — Magnitude Comparator
 *
 * Narrative context:
 *   Work Order WO-0068 — Deck 3, Life Support Threshold Panel.
 *   The life support system monitors oxygen partial pressure (A) against a
 *   minimum safe threshold (B). A 1-bit comparator generates three signals:
 *     A=B  (nominal — pressure matches threshold)
 *     A>B  (pressure above threshold — safe)
 *     A<B  (pressure below threshold — CRITICAL ALERT)
 *   The XNOR gate providing the A=B signal has a broken input — it reads
 *   A=B=TRUE permanently regardless of actual values. The critical threshold
 *   alert is masked. Life support thinks pressure is always nominal.
 *
 * Engineering framing:
 *   1-bit comparator:
 *     EQ  (A=B)  = XNOR(A, B) = NOT(A XOR B)
 *     GT  (A>B)  = A AND NOT(B)
 *     LT  (A<B)  = NOT(A) AND B
 *   Three outputs. One XOR+NOT chain, one NOT gate, two AND gates.
 */

const NODES_FULL = [
  { id: 'inA',  type: 'INPUT',  x: 60,  y: 100, scale: 1 },
  { id: 'inB',  type: 'INPUT',  x: 60,  y: 280, scale: 1 },

  { id: 'xor1', type: 'XOR',   x: 190, y: 150, scale: 1.1 },
  { id: 'notEQ', type: 'NOT',  x: 330, y: 150, scale: 1.0 },

  { id: 'notA', type: 'NOT',   x: 190, y: 380, scale: 1.0 },
  { id: 'notB', type: 'NOT',   x: 190, y: 480, scale: 1.0 },

  { id: 'andGT', type: 'AND',  x: 330, y: 50,  scale: 1.1 },
  { id: 'andLT', type: 'AND',  x: 330, y: 380, scale: 1.1 },

  { id: 'eq',  type: 'OUTPUT', x: 490, y: 175, scale: 1 },
  { id: 'gt',  type: 'OUTPUT', x: 490, y: 70,  scale: 1 },
  { id: 'lt',  type: 'OUTPUT', x: 490, y: 405, scale: 1 },
]

const WIRES_FULL = [
  // EQ = XNOR(A,B) = NOT(XOR(A,B))
  { id: 'cmp1', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 0 } },
  { id: 'cmp2', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 1 } },
  { id: 'cmp3', from: { nodeId: 'xor1',  pin: 'output' }, to: { nodeId: 'notEQ', pin: 'input', index: 0 } },
  { id: 'cmp4', from: { nodeId: 'notEQ', pin: 'output' }, to: { nodeId: 'eq',    pin: 'input', index: 0 } },
  // NOT gates
  { id: 'cmp5', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'notA',  pin: 'input', index: 0 } },
  { id: 'cmp6', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'notB',  pin: 'input', index: 0 } },
  // GT = A AND ~B
  { id: 'cmp7', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'andGT', pin: 'input', index: 0 } },
  { id: 'cmp8', from: { nodeId: 'notB',  pin: 'output' }, to: { nodeId: 'andGT', pin: 'input', index: 1 } },
  // LT = ~A AND B
  { id: 'cmp9', from: { nodeId: 'notA',  pin: 'output' }, to: { nodeId: 'andLT', pin: 'input', index: 0 } },
  { id: 'cmpA', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'andLT', pin: 'input', index: 1 } },
  // Outputs
  { id: 'cmpB', from: { nodeId: 'andGT', pin: 'output' }, to: { nodeId: 'gt',    pin: 'input', index: 0 } },
  { id: 'cmpC', from: { nodeId: 'andLT', pin: 'output' }, to: { nodeId: 'lt',    pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-09',
    title:       'Magnitude Comparator',
    unit:        2,
    lessonIndex: 8,
    concept:     'COMPARATOR',
    panels:      ['verilog'],
    workOrder:   'WO-0068',
    location:    'Deck 3 · Life Support Threshold Panel',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Deck 3. Life support threshold panel. This one's not a navigation convenience — this is the critical alert circuit for oxygen partial pressure.\n\nOne-bit comparator. A is the sensor reading, B is the minimum safe threshold. EQ means pressure matches threshold exactly — nominal. GT means above threshold — safe. LT means below threshold — CRITICAL. The LT output is what triggers the emergency alert.\n\nThe XOR gate feeding the EQ path has B disconnected. XOR sees A on one input and floating LOW on the other — outputs A. NOT inverts it — EQ is stuck at NOT(A). When A is HIGH, EQ reads LOW, which masks the true comparison result. The LT output is still structurally correct but the system's alert logic trusts EQ to suppress false alarms — with EQ broken, the whole threshold detection chain is compromised.",
    briefing: 'Life support 1-bit comparator. XOR gate B input disconnected at junction LS-1. EQ output unreliable. LT critical alert may be masked by corrupted EQ signal upstream in alert chain.',
    fault:    'INCIDENT REPORT: B input wire to XOR gate severed at junction LS-1 during panel inspection. EQ output = NOT(A) instead of XNOR(A,B). Life support alert chain receiving corrupted equality signal. CRITICAL classification.',
    dispatch: 'Restore B wire to XOR gate input[1]. Confirm XOR feeds NOT gate for EQ output. Confirm GT = A AND ~B, LT = ~A AND B. Three outputs: EQ, GT, LT. All must be independent of each other.',
    success:  'XOR B input restored. EQ output correct. Comparator operational. Life support alert chain nominal. WO-0068 closed by Beta Shift.',
    lore:     'The 1-bit comparator is the foundation of all magnitude comparison hardware. Chain four together with carry/borrow logic and you get a 4-bit comparator. Real comparator ICs (like the classic 7485 4-bit comparator) cascade with EQ, GT, and LT inputs from the previous stage — this is how 16-bit and 32-bit comparators are built from 4-bit slices. The XNOR gate for equality is particularly elegant: it fires HIGH only when both bits match, which is the definition of equality in any radix.',
  },

  phases: {
    work: {
      hint: 'EQ = XNOR(A,B). GT = A AND ~B. LT = ~A AND B. Exactly one of the three is HIGH at a time (for valid A≠B).',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: true, inB: false },
    },
    break: {
      hint: 'B wire to XOR gate broken. XOR sees only A — EQ output is NOT(A), not XNOR(A,B). LT and GT still structurally correct.',
      faultNodeId: 'xor1',
      nodes: NODES_FULL,
      inputs: { inA: true, inB: false },
      wires: [
        { id: 'cmp1', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 0 } },
        { id: 'cmp2', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 1 }, broken: true },
        { id: 'cmp3', from: { nodeId: 'xor1',  pin: 'output' }, to: { nodeId: 'notEQ', pin: 'input', index: 0 } },
        { id: 'cmp4', from: { nodeId: 'notEQ', pin: 'output' }, to: { nodeId: 'eq',    pin: 'input', index: 0 } },
        { id: 'cmp5', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'notA',  pin: 'input', index: 0 } },
        { id: 'cmp6', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'notB',  pin: 'input', index: 0 } },
        { id: 'cmp7', from: { nodeId: 'inA',   pin: 'output' }, to: { nodeId: 'andGT', pin: 'input', index: 0 } },
        { id: 'cmp8', from: { nodeId: 'notB',  pin: 'output' }, to: { nodeId: 'andGT', pin: 'input', index: 1 } },
        { id: 'cmp9', from: { nodeId: 'notA',  pin: 'output' }, to: { nodeId: 'andLT', pin: 'input', index: 0 } },
        { id: 'cmpA', from: { nodeId: 'inB',   pin: 'output' }, to: { nodeId: 'andLT', pin: 'input', index: 1 } },
        { id: 'cmpB', from: { nodeId: 'andGT', pin: 'output' }, to: { nodeId: 'gt',    pin: 'input', index: 0 } },
        { id: 'cmpC', from: { nodeId: 'andLT', pin: 'output' }, to: { nodeId: 'lt',    pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'EQ: A and B → XOR → NOT → EQ. GT: A and ~B → AND → GT. LT: ~A and B → AND → LT. Both NOT gates needed (notA and notB).',
      nodes: [
        { id: 'inA',   type: 'INPUT',  x: 60,  y: 100, scale: 1,   locked: false },
        { id: 'inB',   type: 'INPUT',  x: 60,  y: 280, scale: 1,   locked: false },
        { id: 'xor1',  type: 'XOR',   x: 190, y: 150, scale: 1.1, locked: false },
        { id: 'notEQ', type: 'NOT',   x: 330, y: 150, scale: 1.0, locked: false },
        { id: 'notA',  type: 'NOT',   x: 190, y: 380, scale: 1.0, locked: false },
        { id: 'notB',  type: 'NOT',   x: 190, y: 480, scale: 1.0, locked: false },
        { id: 'andGT', type: 'AND',   x: 330, y: 50,  scale: 1.1, locked: false },
        { id: 'andLT', type: 'AND',   x: 330, y: 380, scale: 1.1, locked: false },
        { id: 'eq',   type: 'OUTPUT', x: 490, y: 175, scale: 1 },
        { id: 'gt',   type: 'OUTPUT', x: 490, y: 70,  scale: 1 },
        { id: 'lt',   type: 'OUTPUT', x: 490, y: 405, scale: 1 },
      ],
      inputs: { inA: false, inB: false },
      wires: [],
    },
  },
}