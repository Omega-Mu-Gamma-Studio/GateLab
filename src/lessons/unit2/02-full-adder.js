/**
 * Unit II · Lesson 02 — Full Adder
 *
 * Narrative context:
 *   Work Order WO-0061 — Deck 9, Navigation Compute Bay.
 *   The adder bank repair continues. BIT-1 is a full adder — it takes
 *   a carry-in from BIT-0 in addition to its own two operand bits.
 *   A power surge scrambled the carry-in path: the carry-in wire
 *   was shorted to ground and then cut clean — CIN reads 0 regardless of BIT-0.
 *   Without carry propagation the whole accumulator is wrong above the first bit.
 *
 * Engineering framing:
 *   Full adder: A, B, CIN → SUM (A XOR B XOR CIN), COUT (majority function).
 *   Built from two half adders + one OR gate for the carry-out.
 *   COUT = AB + CIN(A XOR B). This is the carry-propagation chain.
 *   Three inputs. Two outputs. The real workhorse of binary arithmetic.
 */

// Full adder internals:
// HA1: A XOR B → partSum, A AND B → carry1
// HA2: partSum XOR CIN → SUM, partSum AND CIN → carry2
// OR: carry1 OR carry2 → COUT

const NODES_FULL = [
  { id: 'inA',     type: 'INPUT',  x: 50,  y: 80,  scale: 1 },
  { id: 'inB',     type: 'INPUT',  x: 50,  y: 200, scale: 1 },
  { id: 'cin',     type: 'INPUT',  x: 50,  y: 380, scale: 1 },

  { id: 'xor1',   type: 'XOR',    x: 190, y: 110, scale: 1.1 },
  { id: 'and1',   type: 'AND',    x: 190, y: 250, scale: 1.1 },

  { id: 'xor2',   type: 'XOR',    x: 350, y: 180, scale: 1.1 },
  { id: 'and2',   type: 'AND',    x: 350, y: 340, scale: 1.1 },

  { id: 'or1',    type: 'OR',     x: 490, y: 290, scale: 1.1 },

  { id: 'sum',    type: 'OUTPUT', x: 560, y: 195, scale: 1 },
  { id: 'cout',   type: 'OUTPUT', x: 620, y: 315, scale: 1 },
]

const WIRES_FULL = [
  // HA1
  { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  // HA2
  { id: 'w5', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'xor2', pin: 'input', index: 0 } },
  { id: 'w6', from: { nodeId: 'cin',  pin: 'output' }, to: { nodeId: 'xor2', pin: 'input', index: 1 } },
  { id: 'w7', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'and2', pin: 'input', index: 0 } },
  { id: 'w8', from: { nodeId: 'cin',  pin: 'output' }, to: { nodeId: 'and2', pin: 'input', index: 1 } },
  // OR for cout
  { id: 'w9',  from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 0 } },
  { id: 'w10', from: { nodeId: 'and2', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 1 } },
  // Outputs
  { id: 'w11', from: { nodeId: 'xor2', pin: 'output' }, to: { nodeId: 'sum',  pin: 'input', index: 0 } },
  { id: 'w12', from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'cout', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-02',
    title:       'Full Adder',
    unit:        2,
    lessonIndex: 1,
    concept:     'FULL_ADDER',
    panels:      ['verilog'],
    workOrder:   'WO-0061',
    location:    'Deck 9 · Navigation Compute Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Still in the nav bay. BIT-0 is fixed — carry-out is propagating correctly now. BIT-1 is a full adder and it's worse.\n\nThe power surge that hit BIT-0's carry wire also shorted the carry-in line on BIT-1 to ground. So the carry that BIT-0 is now correctly producing? Never reaches BIT-1. The CIN pin is reading zero regardless of input.\n\nFull adder is two half adders chained with an OR gate for the carry-out. The structure's intact. It's just that one wire — the carry-in path — that's dead.",
    briefing: 'Full adder at BIT-1: carry-in path shorted and cut at junction N-7. CIN pin reads 0. SUM and COUT incorrect whenever BIT-0 generates a carry. Two half adder stages + OR carry merge.',
    fault:    'INCIDENT REPORT: Surge damage at junction N-7 severed CIN input to BIT-1 full adder. HA-2 stage receives no carry input. Downstream COUT also degraded. Multi-bit coordinate accumulation invalid.',
    dispatch: 'Restore CIN wire to both XOR2 and AND2 (the second half-adder stage). Confirm HA1 still intact (XOR1, AND1). OR gate combines carry paths to COUT. Five-gate circuit total.',
    success:  'CIN restored. Full adder BIT-1 operational. Carry chain intact through BIT-1. WO-0061 closed by Beta Shift.',
    lore:     'The full adder is two half adders with a carry-merge OR gate. That OR gate is doing something subtle: it produces a CARRY-OUT whenever either half-adder generated a carry — the first from A AND B, the second from the partial sum AND carry-in. Together they implement the majority function: COUT is 1 whenever at least two of the three inputs are 1. Chain enough full adders and you get a ripple-carry adder — the next thing we fix.',
  },

  phases: {
    work: {
      hint: 'Full adder: two XOR stages for SUM, two AND stages feeding an OR for COUT. CIN feeds the second XOR and AND.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: true, inB: false, cin: true },
    },
    break: {
      hint: 'CIN wire is severed. XOR2 and AND2 receive no carry input. SUM and COUT both degraded.',
      faultNodeId: 'xor2',
      nodes: NODES_FULL,
      inputs: { inA: true, inB: false, cin: true },
      wires: [
        { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
        { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
        { id: 'w4', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'xor2', pin: 'input', index: 0 } },
        { id: 'w6', from: { nodeId: 'cin',  pin: 'output' }, to: { nodeId: 'xor2', pin: 'input', index: 1 }, broken: true },
        { id: 'w7', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'and2', pin: 'input', index: 0 } },
        { id: 'w8', from: { nodeId: 'cin',  pin: 'output' }, to: { nodeId: 'and2', pin: 'input', index: 1 }, broken: true },
        { id: 'w9',  from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 0 } },
        { id: 'w10', from: { nodeId: 'and2', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 1 } },
        { id: 'w11', from: { nodeId: 'xor2', pin: 'output' }, to: { nodeId: 'sum',  pin: 'input', index: 0 } },
        { id: 'w12', from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'cout', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'HA1: A,B → XOR1 (partSum) and AND1. HA2: partSum + CIN → XOR2 (SUM) and AND2. OR1: combines AND1, AND2 → COUT.',
      nodes: [
        { id: 'inA',   type: 'INPUT',  x: 50,  y: 80,  scale: 1,   locked: false },
        { id: 'inB',   type: 'INPUT',  x: 50,  y: 200, scale: 1,   locked: false },
        { id: 'cin',   type: 'INPUT',  x: 50,  y: 380, scale: 1,   locked: false },
        { id: 'xor1',  type: 'XOR',    x: 190, y: 110, scale: 1.1, locked: false },
        { id: 'and1',  type: 'AND',    x: 190, y: 250, scale: 1.1, locked: false },
        { id: 'xor2',  type: 'XOR',    x: 350, y: 180, scale: 1.1, locked: false },
        { id: 'and2',  type: 'AND',    x: 350, y: 340, scale: 1.1, locked: false },
        { id: 'or1',   type: 'OR',     x: 490, y: 290, scale: 1.1, locked: false },
        { id: 'sum',   type: 'OUTPUT', x: 560, y: 195, scale: 1 },
        { id: 'cout',  type: 'OUTPUT', x: 620, y: 315, scale: 1 },
      ],
      inputs: { inA: false, inB: false, cin: false },
      wires: [],
    },
  },
}