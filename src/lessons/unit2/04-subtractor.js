/**
 * Unit II · Lesson 04 — Binary Subtractor
 *
 * Narrative context:
 *   Work Order WO-0063 — Deck 9, Navigation Compute Bay.
 *   The nav system also needs subtraction for relative bearing calculations.
 *   The subtractor circuit uses XOR gates to invert the subtrahend (B)
 *   and then adds with carry-in set to 1 (two's complement subtraction).
 *   A NOT gate on the carry-in line was replaced with a direct wire during
 *   a hasty repair last quarter — now CIN is stuck at 0, inverting the
 *   B inputs has no carry-in to complete the two's complement, and all
 *   subtraction results are off by one.
 *
 * Engineering framing:
 *   A - B = A + (~B) + 1  (two's complement)
 *   Half subtractor: DIFF = A XOR B, BORROW = (~A) AND B
 *   This lesson shows a 1-bit subtractor:
 *   DIFF output via XOR, BORROW output via NOT-A AND B.
 *   Clean and self-contained — sets up two's complement intuition.
 */

const NODES_FULL = [
  { id: 'inA',    type: 'INPUT',  x: 60,  y: 110, scale: 1 },
  { id: 'inB',    type: 'INPUT',  x: 60,  y: 260, scale: 1 },
  { id: 'notA',   type: 'NOT',    x: 190, y: 290, scale: 1.1 },
  { id: 'xor1',   type: 'XOR',    x: 310, y: 130, scale: 1.2 },
  { id: 'and1',   type: 'AND',    x: 310, y: 310, scale: 1.2 },
  { id: 'diff',   type: 'OUTPUT', x: 510, y: 155, scale: 1 },
  { id: 'borrow', type: 'OUTPUT', x: 510, y: 335, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'notA', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'notA', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  { id: 'w5', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  { id: 'w6', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'diff', pin: 'input', index: 0 } },
  { id: 'w7', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'borrow', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-04',
    title:       'Binary Subtractor',
    unit:        2,
    lessonIndex: 3,
    concept:     'SUBTRACTOR',
    panels:      ['verilog'],
    workOrder:   'WO-0063',
    location:    'Deck 9 · Navigation Compute Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Still in the nav bay. Subtractor this time — used for relative bearing delta calculations. Without accurate subtraction, the nav system can't compute intercept angles.\n\nHalf subtractor: DIFF = A XOR B. BORROW = NOT(A) AND B. Tells you both the difference bit and whether you had to borrow from the next position.\n\nSomeone cut the A feed to the NOT gate last quarter and ran a ground stub instead. NOT gate input is floating low. BORROW output is wrong for every case where A is HIGH and B is LOW. Bearing deltas are corrupted.",
    briefing: 'Half subtractor, bearing delta circuit. NOT gate input disconnected — A feed replaced with ground during a hasty patch. BORROW output incorrect. DIFF output still correct (XOR path intact).',
    fault:    'INCIDENT REPORT: A input to NOT gate severed at junction N-19. NOT gate input floating LOW. AND gate borrow calculation invalid. Relative bearing delta outputs corrupted for A=1, B=0 case.',
    dispatch: 'Restore A wire from input to NOT gate input. Confirm NOT output feeds AND gate input[0]. Confirm B feeds AND gate input[1] and XOR gate input[1]. DIFF = A XOR B. BORROW = (~A) AND B.',
    success:  'NOT gate A input restored. Half subtractor operational. Bearing delta calculations nominal. WO-0063 closed by Beta Shift.',
    lore:     'Subtraction in binary hardware is implemented through addition. Two\'s complement flips every bit of B and adds 1 — the hardware XOR-inverts B, then uses the adder with CIN=1 as that +1. The half subtractor is the conceptual foundation: DIFF is A XOR B, BORROW is NOT(A) AND B. Read that borrow expression: we only need to borrow when A is 0 and B is 1 — the only case where A < B for single bits. The NOT gate is doing exactly that check.',
  },

  phases: {
    work: {
      hint: 'DIFF = A XOR B. BORROW = NOT(A) AND B. A fans out to both XOR input and NOT gate.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: false, inB: true },
    },
    break: {
      hint: 'A is not reaching the NOT gate. NOT gate input is floating — BORROW is wrong for A=1, B=0.',
      faultNodeId: 'notA',
      nodes: NODES_FULL,
      inputs: { inA: false, inB: true },
      wires: [
        { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
        { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'notA', pin: 'input', index: 0 }, broken: true },
        { id: 'w4', from: { nodeId: 'notA', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
        { id: 'w5', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
        { id: 'w6', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'diff', pin: 'input', index: 0 } },
        { id: 'w7', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'borrow', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'A feeds both XOR input[0] AND the NOT gate. NOT gate output → AND input[0]. B → XOR input[1] AND AND input[1].',
      nodes: [
        { id: 'inA',    type: 'INPUT',  x: 60,  y: 110, scale: 1,   locked: false },
        { id: 'inB',    type: 'INPUT',  x: 60,  y: 260, scale: 1,   locked: false },
        { id: 'notA',   type: 'NOT',    x: 190, y: 290, scale: 1.1, locked: false },
        { id: 'xor1',   type: 'XOR',    x: 310, y: 130, scale: 1.2, locked: false },
        { id: 'and1',   type: 'AND',    x: 310, y: 310, scale: 1.2, locked: false },
        { id: 'diff',   type: 'OUTPUT', x: 510, y: 155, scale: 1 },
        { id: 'borrow', type: 'OUTPUT', x: 510, y: 335, scale: 1 },
      ],
      inputs: { inA: false, inB: false },
      wires: [],
    },
  },
}