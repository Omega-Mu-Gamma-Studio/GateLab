/**
 * Unit II · Lesson 03 — Ripple-Carry Adder
 *
 * Narrative context:
 *   Work Order WO-0062 — Deck 9, Navigation Compute Bay.
 *   The nav accumulator is a 4-bit ripple-carry adder — four full adder cells
 *   chained so each COUT feeds the next cell's CIN.
 *   A firmware patch last night accidentally cleared the inter-cell carry links
 *   in the physical wiring model. The carry chain is broken at the BIT-1 to BIT-2
 *   junction and the BIT-2 to BIT-3 junction.
 *   Without carry ripple, the adder produces garbage for any sum > 1.
 *
 * Engineering framing:
 *   4-bit ripple-carry adder: FA0 (half-adder style, CIN=0) chains to FA1, FA2, FA3.
 *   Each COUT is the next cell's CIN — the carry "ripples" through.
 *   This lesson uses a simplified 2-bit version on canvas (FA0 + FA1) to keep it
 *   readable, but the lore covers the full 4-bit picture.
 *   Key tradeoff: simplicity vs. propagation delay — carry must traverse every stage.
 */

// 2-bit ripple carry: FA0 and FA1
// FA0: A0, B0, CIN0=0 → S0, C0
// FA1: A1, B1, CIN1=C0 → S1, COUT

const NODES_FULL = [
  // FA0 inputs
  { id: 'a0',    type: 'INPUT',  x: 40,  y: 60,  scale: 1 },
  { id: 'b0',    type: 'INPUT',  x: 40,  y: 160, scale: 1 },
  // FA0 internals
  { id: 'xor0a', type: 'XOR',   x: 170, y: 80,  scale: 1.0 },
  { id: 'and0a', type: 'AND',   x: 170, y: 190, scale: 1.0 },
  { id: 'xor0b', type: 'XOR',   x: 290, y: 100, scale: 1.0 },
  { id: 'and0b', type: 'AND',   x: 290, y: 230, scale: 1.0 },
  { id: 'or0',   type: 'OR',    x: 390, y: 195, scale: 1.0 },
  // FA0 outputs
  { id: 's0',    type: 'OUTPUT', x: 490, y: 115, scale: 1 },

  // FA1 inputs
  { id: 'a1',    type: 'INPUT',  x: 40,  y: 330, scale: 1 },
  { id: 'b1',    type: 'INPUT',  x: 40,  y: 430, scale: 1 },
  // FA1 internals
  { id: 'xor1a', type: 'XOR',   x: 170, y: 350, scale: 1.0 },
  { id: 'and1a', type: 'AND',   x: 170, y: 460, scale: 1.0 },
  { id: 'xor1b', type: 'XOR',   x: 290, y: 370, scale: 1.0 },
  { id: 'and1b', type: 'AND',   x: 290, y: 490, scale: 1.0 },
  { id: 'or1',   type: 'OR',    x: 390, y: 455, scale: 1.0 },
  // FA1 outputs
  { id: 's1',    type: 'OUTPUT', x: 490, y: 385, scale: 1 },
  { id: 'cout',  type: 'OUTPUT', x: 580, y: 470, scale: 1 },
]

const WIRES_FULL = [
  // FA0 HA1
  { id: 'r1',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'xor0a', pin: 'input', index: 0 } },
  { id: 'r2',  from: { nodeId: 'b0',    pin: 'output' }, to: { nodeId: 'xor0a', pin: 'input', index: 1 } },
  { id: 'r3',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and0a', pin: 'input', index: 0 } },
  { id: 'r4',  from: { nodeId: 'b0',    pin: 'output' }, to: { nodeId: 'and0a', pin: 'input', index: 1 } },
  // FA0 HA2 (CIN is 0 — no CIN node, xor0b just gets xor0a output and 0; we simplify: xor0b = xor0a here since cin=0)
  // Simplified: with CIN=0, FA0 behaves as half adder → S0 = A0 XOR B0, C0 = A0 AND B0
  { id: 'r5',  from: { nodeId: 'xor0a', pin: 'output' }, to: { nodeId: 's0',    pin: 'input', index: 0 } },
  { id: 'r6',  from: { nodeId: 'and0a', pin: 'output' }, to: { nodeId: 'or0',   pin: 'input', index: 0 } },
  // and0b, xor0b omitted for CIN=0 simplification; or0 second input handled internally
  { id: 'r7',  from: { nodeId: 'or0',   pin: 'output' }, to: { nodeId: 'xor1b', pin: 'input', index: 1 } }, // carry-out of FA0 → CIN of FA1
  { id: 'r8',  from: { nodeId: 'or0',   pin: 'output' }, to: { nodeId: 'and1b', pin: 'input', index: 1 } },

  // FA1 HA1
  { id: 'r9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'xor1a', pin: 'input', index: 0 } },
  { id: 'r10', from: { nodeId: 'b1',    pin: 'output' }, to: { nodeId: 'xor1a', pin: 'input', index: 1 } },
  { id: 'r11', from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and1a', pin: 'input', index: 0 } },
  { id: 'r12', from: { nodeId: 'b1',    pin: 'output' }, to: { nodeId: 'and1a', pin: 'input', index: 1 } },
  // FA1 HA2
  { id: 'r13', from: { nodeId: 'xor1a', pin: 'output' }, to: { nodeId: 'xor1b', pin: 'input', index: 0 } },
  { id: 'r14', from: { nodeId: 'xor1a', pin: 'output' }, to: { nodeId: 'and1b', pin: 'input', index: 0 } },
  // FA1 carry merge
  { id: 'r15', from: { nodeId: 'and1a', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
  { id: 'r16', from: { nodeId: 'and1b', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
  // Outputs
  { id: 'r17', from: { nodeId: 'xor1b', pin: 'output' }, to: { nodeId: 's1',    pin: 'input', index: 0 } },
  { id: 'r18', from: { nodeId: 'or1',   pin: 'output' }, to: { nodeId: 'cout',  pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-03',
    title:       'Ripple-Carry Adder',
    unit:        2,
    lessonIndex: 2,
    concept:     'RIPPLE_CARRY',
    panels:      ['verilog'],
    workOrder:   'WO-0062',
    location:    'Deck 9 · Navigation Compute Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Still in the nav bay. BIT-0 and BIT-1 are good. The firmware patch last night was supposed to recalibrate timing — instead it cleared the inter-cell carry link flags in the wiring model.\n\nThe carry chain from FA0 to FA1 is now severed at the software-physical boundary. The adder cells are intact. It's the connection between them — the carry ripple — that's gone.\n\nYou can think of it like a relay race where the baton got dropped between the first and second runners. Everything else is fine. The baton is on the floor.",
    briefing: 'Ripple-carry adder: FA0 COUT must feed FA1 CIN. Carry chain severed between stages at junction N-12. 2-bit addition produces correct LSB but wrong MSB and overflow whenever FA0 generates a carry.',
    fault:    'INCIDENT REPORT: Firmware patch v2.4.1 cleared carry-chain junction flag N-12. FA0 COUT wire disconnected from FA1 CIN inputs (XOR1b, AND1b). Multi-bit carry propagation broken.',
    dispatch: 'Reconnect FA0 carry-out (OR0 output) to both FA1 carry inputs: XOR1b index-1 and AND1b index-1. Verify FA1 outputs S1 and COUT reach their output nodes.',
    success:  'Carry chain restored. Ripple-carry adder operational. 2-bit accumulation nominal. WO-0062 closed by Beta Shift.',
    lore:     'The ripple-carry adder is the simplest multi-bit adder — and the slowest. Each carry has to propagate through every stage in sequence before the final sum is valid. In a 64-bit adder, that can mean 64 gate delays before the output stabilises. Modern processors use carry-lookahead adders that pre-compute carry signals in parallel — trading gate count for speed. The ripple-carry adder is where you start. It is not where you finish.',
  },

  phases: {
    work: {
      hint: 'FA0 carry-out (OR0) feeds FA1 carry-in (XOR1b, AND1b). The carry ripples left to right through the chain.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { a0: true, b0: true, a1: false, b1: true },
    },
    break: {
      hint: 'Carry chain severed. FA0 COUT is not reaching FA1 CIN. FA1 computes as if CIN=0 — wrong whenever a carry should propagate.',
      faultNodeId: 'or0',
      nodes: NODES_FULL,
      inputs: { a0: true, b0: true, a1: false, b1: true },
      wires: [
        { id: 'r1',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'xor0a', pin: 'input', index: 0 } },
        { id: 'r2',  from: { nodeId: 'b0',    pin: 'output' }, to: { nodeId: 'xor0a', pin: 'input', index: 1 } },
        { id: 'r3',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and0a', pin: 'input', index: 0 } },
        { id: 'r4',  from: { nodeId: 'b0',    pin: 'output' }, to: { nodeId: 'and0a', pin: 'input', index: 1 } },
        { id: 'r5',  from: { nodeId: 'xor0a', pin: 'output' }, to: { nodeId: 's0',    pin: 'input', index: 0 } },
        { id: 'r6',  from: { nodeId: 'and0a', pin: 'output' }, to: { nodeId: 'or0',   pin: 'input', index: 0 } },
        { id: 'r7',  from: { nodeId: 'or0',   pin: 'output' }, to: { nodeId: 'xor1b', pin: 'input', index: 1 }, broken: true },
        { id: 'r8',  from: { nodeId: 'or0',   pin: 'output' }, to: { nodeId: 'and1b', pin: 'input', index: 1 }, broken: true },
        { id: 'r9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'xor1a', pin: 'input', index: 0 } },
        { id: 'r10', from: { nodeId: 'b1',    pin: 'output' }, to: { nodeId: 'xor1a', pin: 'input', index: 1 } },
        { id: 'r11', from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and1a', pin: 'input', index: 0 } },
        { id: 'r12', from: { nodeId: 'b1',    pin: 'output' }, to: { nodeId: 'and1a', pin: 'input', index: 1 } },
        { id: 'r13', from: { nodeId: 'xor1a', pin: 'output' }, to: { nodeId: 'xor1b', pin: 'input', index: 0 } },
        { id: 'r14', from: { nodeId: 'xor1a', pin: 'output' }, to: { nodeId: 'and1b', pin: 'input', index: 0 } },
        { id: 'r15', from: { nodeId: 'and1a', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
        { id: 'r16', from: { nodeId: 'and1b', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
        { id: 'r17', from: { nodeId: 'xor1b', pin: 'output' }, to: { nodeId: 's1',    pin: 'input', index: 0 } },
        { id: 'r18', from: { nodeId: 'or1',   pin: 'output' }, to: { nodeId: 'cout',  pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Key connection: OR0 output → XOR1b input[1] AND AND1b input[1]. That is the carry link between FA0 and FA1.',
      nodes: [
        { id: 'a0',    type: 'INPUT',  x: 40,  y: 60,  scale: 1,   locked: false },
        { id: 'b0',    type: 'INPUT',  x: 40,  y: 160, scale: 1,   locked: false },
        { id: 'xor0a', type: 'XOR',   x: 170, y: 80,  scale: 1.0, locked: false },
        { id: 'and0a', type: 'AND',   x: 170, y: 190, scale: 1.0, locked: false },
        { id: 'or0',   type: 'OR',    x: 390, y: 195, scale: 1.0, locked: false },
        { id: 's0',    type: 'OUTPUT', x: 490, y: 115, scale: 1 },
        { id: 'a1',    type: 'INPUT',  x: 40,  y: 330, scale: 1,   locked: false },
        { id: 'b1',    type: 'INPUT',  x: 40,  y: 430, scale: 1,   locked: false },
        { id: 'xor1a', type: 'XOR',   x: 170, y: 350, scale: 1.0, locked: false },
        { id: 'and1a', type: 'AND',   x: 170, y: 460, scale: 1.0, locked: false },
        { id: 'xor1b', type: 'XOR',   x: 290, y: 370, scale: 1.0, locked: false },
        { id: 'and1b', type: 'AND',   x: 290, y: 490, scale: 1.0, locked: false },
        { id: 'or1',   type: 'OR',    x: 390, y: 455, scale: 1.0, locked: false },
        { id: 's1',    type: 'OUTPUT', x: 490, y: 385, scale: 1 },
        { id: 'cout',  type: 'OUTPUT', x: 580, y: 470, scale: 1 },
      ],
      inputs: { a0: false, b0: false, a1: false, b1: false },
      wires: [],
    },
  },
}