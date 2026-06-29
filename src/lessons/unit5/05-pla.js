/**
 * Unit V - Lesson 05 -- Programmable Logic Array (PLA)
 *
 * Narrative context:
 *   Work Order WO-0305 -- Deck 2, Central Memory Bank, Sensor Fusion PLA.
 *   The sensor fusion board uses a small PLA to combine three raw
 *   sensor lines (A, B, C) into two derived alarm signals, F1 and F2,
 *   built from three programmable product terms feeding a fixed OR
 *   output stage. F2 has been reading HIGH under conditions it never
 *   should.
 *   Fault: one programmable AND-array link has been connected to the
 *   wrong input variable -- the term meant to read A and NOT-C is
 *   instead reading A and B, duplicating the first term and leaving
 *   the intended A-AND-NOT-C condition completely unmonitored.
 *   Player reprograms the link to the correct variable.
 *
 * Engineering framing:
 *   PLA = programmable AND array -> fixed OR array. Any product term
 *   can be programmed from any subset of the (true or complemented)
 *   inputs, and any OR gate can be wired to any subset of terms. Here:
 *     T1 = A AND B
 *     T2 = B AND C
 *     T3 = A AND NOT(C)
 *     F1 = T1 OR T2
 *     F2 = T2 OR T3
 *   Because the AND array is programmable, a PLA can implement any
 *   sum-of-products expression up to its term count -- the tradeoff is
 *   that programmable AND arrays are larger and slower than a PAL's
 *   fixed AND array.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 60,  scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 220, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 400, scale: 1 },

  { id: 'notC', type: 'NOT',    x: 200, y: 460, scale: 1 },

  { id: 'T1',   type: 'AND',    x: 350, y: 100, scale: 1.1 },
  { id: 'T2',   type: 'AND',    x: 350, y: 280, scale: 1.1 },
  { id: 'T3',   type: 'AND',    x: 350, y: 460, scale: 1.1 },

  { id: 'F1',   type: 'OR',     x: 530, y: 170, scale: 1.1 },
  { id: 'F2',   type: 'OR',     x: 530, y: 370, scale: 1.1 },

  { id: 'OUT1', type: 'OUTPUT', x: 700, y: 170, scale: 1 },
  { id: 'OUT2', type: 'OUTPUT', x: 700, y: 370, scale: 1 },
]

const WIRES_FULL = [
  { id: 'p1', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'notC', pin: 'input', index: 0 } },

  { id: 'p2', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 0 } },
  { id: 'p3', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 1 } },

  { id: 'p4', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 0 } },
  { id: 'p5', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 1 } },

  { id: 'p6', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 0 } },
  { id: 'p7', from: { nodeId: 'notC', pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 1 } },

  { id: 'p8', from: { nodeId: 'T1',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 0 } },
  { id: 'p9', from: { nodeId: 'T2',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 1 } },

  { id: 'p10', from: { nodeId: 'T2',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 0 } },
  { id: 'p11', from: { nodeId: 'T3',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 1 } },

  { id: 'p12', from: { nodeId: 'F1',  pin: 'output' }, to: { nodeId: 'OUT1', pin: 'input', index: 0 } },
  { id: 'p13', from: { nodeId: 'F2',  pin: 'output' }, to: { nodeId: 'OUT2', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-05',
    title:       'Programmable Logic Array',
    unit:        5,
    lessonIndex: 4,
    concept:     'PLA',
    panels:      ['truth'],
    workOrder:   'WO-0305',
    location:    'Deck 2 - Central Memory Bank -- Sensor Fusion PLA',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Sensor fusion alarm F2 is tripping under conditions that should never trip it. This board uses a PLA: three sensor lines feed a programmable AND array of three terms, then two fixed OR gates combine those terms into F1 and F2. T3 is supposed to be A AND NOT-C, the only term feeding F2 that doesn't also feed F1 -- it's meant to catch a specific isolated condition.\n\nI checked the AND-array programming. T3's second link isn't reading NOT-C at all -- it's reading B. So T3 has become A AND B, which is just a duplicate of T1. The actual A-AND-NOT-C condition is now monitored by nothing, and F2 is tripping on a totally different, unintended condition that happens to overlap with T1's pattern.\n\nReprogram T3's second AND-array link: disconnect it from B, connect it to notC instead. Once T3 reads A AND NOT(C) again, F2 will only assert on T2 (B AND C) or the correct isolated condition.",
    briefing: 'PLA term T3 is programmed as A AND B instead of A AND NOT(C). The intended isolated alarm condition for F2 is unmonitored; F2 trips on the wrong pattern.',
    fault:    'INCIDENT REPORT: Sensor Fusion PLA AND-array link at junction P-03 -- T3 input[1] programmed to B instead of notC. Product term T3 duplicates T1 instead of covering A AND NOT(C).',
    dispatch: 'Disconnect T3 input[1] from B. Connect T3 input[1] to notC. Verify: F2 = T2 OR T3 = (B AND C) OR (A AND NOT C). Confirm F1 is unaffected.',
    success:  'T3 reprogrammed to A AND NOT(C). F2 now asserts only on its two intended product terms. Sensor fusion alarm logic verified against spec. WO-0305 closed by Gamma Shift.',
    lore:     "A PLA's defining feature is that both the AND array and the OR array are, in principle, programmable -- giving designers maximum flexibility to implement almost any small sum-of-products function. That flexibility comes at a real cost: programmable interconnect at every AND-array junction makes PLAs larger, slower, and more expensive to fabricate than an equivalent fixed-AND design. By the late 1970s, most field-programmable designs had shifted to the PAL -- fixed AND, programmable OR -- trading away some flexibility for a much faster, denser part. The PLA never disappeared, though; it survives today buried inside the control logic of many microprocessors, exactly where its flexibility still earns its cost.",
  },

  phases: {
    work: {
      hint: 'T1=A.B, T2=B.C, T3=A.notC. F1=T1+T2. F2=T2+T3. Programmable AND array, fixed OR array.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: false, C: false },
    },
    break: {
      hint: 'T3 is programmed as A AND B instead of A AND NOT(C). F2 loses its intended isolated term and instead duplicates T1’s condition.',
      faultNodeId: 'T3',
      nodes: NODES_FULL,
      inputs: { A: true, B: false, C: false },
      wires: [
        { id: 'p1', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'notC', pin: 'input', index: 0 } },
        { id: 'p2', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 0 } },
        { id: 'p3', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 1 } },
        { id: 'p4', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 0 } },
        { id: 'p5', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 1 } },
        { id: 'p6', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 0 } },
        { id: 'p7', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 1 }, broken: true },
        { id: 'p8', from: { nodeId: 'T1',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 0 } },
        { id: 'p9', from: { nodeId: 'T2',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 1 } },
        { id: 'p10', from: { nodeId: 'T2',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 0 } },
        { id: 'p11', from: { nodeId: 'T3',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 1 } },
        { id: 'p12', from: { nodeId: 'F1',  pin: 'output' }, to: { nodeId: 'OUT1', pin: 'input', index: 0 } },
        { id: 'p13', from: { nodeId: 'F2',  pin: 'output' }, to: { nodeId: 'OUT2', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'AND array: T1(A,B), T2(B,C), T3(A,notC). Fixed OR array: F1=OR(T1,T2), F2=OR(T2,T3). NOT gate produces notC from C.',
      nodes: [
        { id: 'A',    type: 'INPUT',  x: 50,  y: 60,  scale: 1,   locked: false },
        { id: 'B',    type: 'INPUT',  x: 50,  y: 220, scale: 1,   locked: false },
        { id: 'C',    type: 'INPUT',  x: 50,  y: 400, scale: 1,   locked: false },
        { id: 'notC', type: 'NOT',    x: 200, y: 460, scale: 1,   locked: false },
        { id: 'T1',   type: 'AND',    x: 350, y: 100, scale: 1.1, locked: false },
        { id: 'T2',   type: 'AND',    x: 350, y: 280, scale: 1.1, locked: false },
        { id: 'T3',   type: 'AND',    x: 350, y: 460, scale: 1.1, locked: false },
        { id: 'F1',   type: 'OR',     x: 530, y: 170, scale: 1.1, locked: false },
        { id: 'F2',   type: 'OR',     x: 530, y: 370, scale: 1.1, locked: false },
        { id: 'OUT1', type: 'OUTPUT', x: 700, y: 170, scale: 1 },
        { id: 'OUT2', type: 'OUTPUT', x: 700, y: 370, scale: 1 },
      ],
      inputs: { A: true, B: false, C: false },
      wires: [],
    },
  },
}