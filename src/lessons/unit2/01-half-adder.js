/**
 * Unit II · Lesson 01 — Half Adder
 *
 * Narrative context:
 *   Work Order WO-0060 — Deck 9, Navigation Compute Bay.
 *   AETHER-9's nav subsystem uses a bank of adder cells for coordinate accumulation.
 *   A half adder on the lowest-order bit position has lost its carry output wire —
 *   the carry-out pin was torn free during a coolant line burst last shift.
 *   Without the carry, coordinate accumulation silently overflows.
 *
 * Engineering framing:
 *   Half adder: two inputs A, B → SUM (A XOR B) and CARRY (A AND B).
 *   "Half" because it can't accept a carry-in — that's the full adder's job.
 *   First combinational circuit beyond a single gate. Two gates, two outputs.
 */

const NODES_FULL = [
  { id: 'inA',   type: 'INPUT',  x: 60,  y: 110, scale: 1 },
  { id: 'inB',   type: 'INPUT',  x: 60,  y: 260, scale: 1 },
  { id: 'xor1',  type: 'XOR',    x: 240, y: 130, scale: 1.2 },
  { id: 'and1',  type: 'AND',    x: 240, y: 300, scale: 1.2 },
  { id: 'sum',   type: 'OUTPUT', x: 480, y: 155, scale: 1 },
  { id: 'carry', type: 'OUTPUT', x: 480, y: 320, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  { id: 'w5', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'sum',  pin: 'input', index: 0 } },
  { id: 'w6', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'carry',pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-01',
    title:       'Half Adder',
    unit:        2,
    lessonIndex: 0,
    concept:     'HALF_ADDER',
    panels:      ['verilog'],
    workOrder:   'WO-0060',
    location:    'Deck 9 · Navigation Compute Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Nav compute bay, Deck 9. Coolant line burst during the handoff from Alpha Shift — maintenance logged it as contained, but they didn't check the adder bank.\n\nLowest-order bit cell. Half adder. XOR produces the sum, AND produces the carry. The carry wire got ripped clean off the AND output during the burst cleanup. Nobody noticed because the SUM output still lights up — it's the carry that's silent.\n\nSilent carry overflow. Nav thinks it's accumulating clean coordinates. It's not.",
    briefing: 'Half adder at coordinate cell BIT-0: XOR gate produces SUM, AND gate produces CARRY-OUT. Carry output wire torn free at junction N-4. Coordinate accumulation silently overflowing.',
    fault:    'INCIDENT REPORT: Carry-out wire at junction N-4 disconnected during coolant burst cleanup. AND gate output floating. SUM output functional. CARRY-OUT not reaching next adder stage.',
    dispatch: 'Restore carry-out wire from AND gate to CARRY output. Confirm XOR gate wired to both inputs for SUM. Both A and B must feed both gates.',
    success:  'Carry-out restored. Half adder BIT-0 operational. Coordinate accumulation nominal. WO-0060 closed by Beta Shift.',
    lore:     'The half adder is the atom of binary arithmetic — two gates, two outputs, one bit of addition. XOR handles the sum because 1+1 in binary produces 0 with a carry, not 2 — and XOR is exactly the gate that outputs 0 when both inputs are 1. AND captures the carry because a carry only propagates when both bits are 1. Every processor, every GPU, every nav computer on this ship is ultimately a tower of these two-gate cells.',
  },

  phases: {
    work: {
      hint: 'Half adder: A XOR B → SUM, A AND B → CARRY. Both inputs fan out to both gates.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: true, inB: true },
    },
    break: {
      hint: 'Carry-out wire is torn. AND gate output is floating — carry never reaches the next stage.',
      faultNodeId: 'and1',
      nodes: NODES_FULL,
      inputs: { inA: true, inB: true },
      wires: [
        { id: 'w1', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
        { id: 'w3', from: { nodeId: 'inA',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
        { id: 'w4', from: { nodeId: 'inB',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'sum',  pin: 'input', index: 0 } },
        { id: 'w6', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'carry',pin: 'input', index: 0 }, broken: true },
      ],
    },
    try: {
      hint: 'Wire A and B to BOTH the XOR and AND gate. XOR output → SUM. AND output → CARRY.',
      nodes: [
        { id: 'inA',   type: 'INPUT',  x: 60,  y: 110, scale: 1,   locked: false },
        { id: 'inB',   type: 'INPUT',  x: 60,  y: 260, scale: 1,   locked: false },
        { id: 'xor1',  type: 'XOR',    x: 240, y: 130, scale: 1.2, locked: false },
        { id: 'and1',  type: 'AND',    x: 240, y: 300, scale: 1.2, locked: false },
        { id: 'sum',   type: 'OUTPUT', x: 480, y: 155, scale: 1 },
        { id: 'carry', type: 'OUTPUT', x: 480, y: 320, scale: 1 },
      ],
      inputs: { inA: false, inB: false },
      wires: [],
    },
  },
}