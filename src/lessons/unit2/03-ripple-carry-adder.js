/**
 * Unit II · Lesson 03 — Ripple-Carry Adder
 *
 * Narrative context:
 *   Work Order WO-0062 — Deck 9, Navigation Compute Bay.
 *   The nav accumulator is a 4-bit ripple-carry adder — four full adder cells
 *   chained so each COUT feeds the next cell's CIN.
 *   A firmware patch last night accidentally cleared the inter-cell carry links
 *   in the physical wiring model. The carry chain is broken between FA0 and FA1.
 *   Without carry ripple, the adder produces garbage for any sum > 1.
 *
 * Engineering framing:
 *   4-bit ripple-carry adder: FA0 (CIN tied to 0) chains to FA1, FA2, FA3.
 *   Each COUT is the next cell's CIN — the carry "ripples" through.
 *   This lesson uses a simplified 2-bit version on canvas (FA0 + FA1) to keep it
 *   readable, but the lore covers the full 4-bit picture.
 *   Key tradeoff: simplicity vs. propagation delay — carry must traverse every stage.
 *
 * Block Mode note:
 *   This is a "compose it" lesson, same family as the unit-3 counters —
 *   the concept being taught is carry propagation BETWEEN cells, not full
 *   adder internals (that was Lesson 02, immediately before this one).
 *   Each cell is a COMPOSITE full adder (blockKind: 'full_adder' — see
 *   BlockDefs.js): A/B/Cin in, Sum/Cout out. Unlike every other COMPOSITE
 *   block so far, a full adder is purely combinational — no clock, no
 *   internal state, recomputed fresh from its current inputs every pass,
 *   same contract as an ordinary gate (see BlockDefs.BLOCK_DEFS.full_adder
 *   and the `stateful: false` path in GraphEvaluator.evaluateComposite).
 *   The fault is still the FA0→FA1 carry link, now a single wire between
 *   two labeled boxes' Cout/Cin pins instead of two wires buried in a
 *   five-gate netlist per cell.
 *
 *   Verilog export note: VerilogEmitter.js only knows how to instantiate
 *   GATE_PRIMITIVES (and/or/not/nand/nor/xor/xnor) — it has no concept of
 *   a COMPOSITE node yet, so it can't emit a structural full_adder
 *   instance. Rather than ship a Verilog panel that silently produces an
 *   incomplete netlist for this circuit, the 'verilog' panel has been
 *   dropped from this lesson's meta.panels until VerilogEmitter grows a
 *   matching COMPOSITE case (candidate follow-up: emit each full_adder as
 *   a `module full_adder(...)` instantiation, mirroring how GATE_PRIMITIVES
 *   maps gate types to Verilog's built-in primitives today).
 */

// COMPOSITE input pin order for full_adder is ['A','B','Cin'] — index 0 =
// A, 1 = B, 2 = Cin. Output pin order is ['Sum','Cout'] — index 0 = Sum,
// index 1 = Cout.

const NODES_FULL = [
  // FA0 inputs — CIN tied to GND (this is the LSB cell)
  { id: 'a0',  type: 'INPUT', x: 40,  y: 60,  scale: 1 },
  { id: 'b0',  type: 'INPUT', x: 40,  y: 160, scale: 1 },
  { id: 'gnd', type: 'CONST', x: 40,  y: 260, scale: 1, value: false },
  { id: 'fa0', type: 'COMPOSITE', blockKind: 'full_adder', x: 200, y: 100, scale: 1, label: 'FA0' },
  { id: 's0',  type: 'OUTPUT', x: 480, y: 115, scale: 1 },

  // FA1 inputs — CIN comes from FA0's Cout (the carry link)
  { id: 'a1',   type: 'INPUT',  x: 40,  y: 380, scale: 1 },
  { id: 'b1',   type: 'INPUT',  x: 40,  y: 480, scale: 1 },
  { id: 'fa1',  type: 'COMPOSITE', blockKind: 'full_adder', x: 200, y: 420, scale: 1, label: 'FA1' },
  { id: 's1',   type: 'OUTPUT', x: 480, y: 435, scale: 1 },
  { id: 'cout', type: 'OUTPUT', x: 480, y: 495, scale: 1 },
]

const WIRES_FULL = [
  // FA0: A0, B0, CIN=0
  { id: 'r1', from: { nodeId: 'a0',  pin: 'output' }, to: { nodeId: 'fa0', pin: 'input', index: 0 } },
  { id: 'r2', from: { nodeId: 'b0',  pin: 'output' }, to: { nodeId: 'fa0', pin: 'input', index: 1 } },
  { id: 'r3', from: { nodeId: 'gnd', pin: 'output' }, to: { nodeId: 'fa0', pin: 'input', index: 2 } },
  { id: 'r4', from: { nodeId: 'fa0', pin: 'output', index: 0 }, to: { nodeId: 's0', pin: 'input', index: 0 } },

  // Carry link: FA0 Cout (output index 1) → FA1 Cin (input index 2)
  { id: 'r5', from: { nodeId: 'fa0', pin: 'output', index: 1 }, to: { nodeId: 'fa1', pin: 'input', index: 2 } },

  // FA1: A1, B1, CIN from carry link
  { id: 'r6', from: { nodeId: 'a1',  pin: 'output' }, to: { nodeId: 'fa1', pin: 'input', index: 0 } },
  { id: 'r7', from: { nodeId: 'b1',  pin: 'output' }, to: { nodeId: 'fa1', pin: 'input', index: 1 } },
  { id: 'r8', from: { nodeId: 'fa1', pin: 'output', index: 0 }, to: { nodeId: 's1',   pin: 'input', index: 0 } },
  { id: 'r9', from: { nodeId: 'fa1', pin: 'output', index: 1 }, to: { nodeId: 'cout', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-03',
    title:       'Ripple-Carry Adder',
    unit:        2,
    lessonIndex: 2,
    concept:     'RIPPLE_CARRY',
    panels:      [],
    workOrder:   'WO-0062',
    location:    'Deck 9 · Navigation Compute Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Still in the nav bay. BIT-0 and BIT-1 are good. The firmware patch last night was supposed to recalibrate timing — instead it cleared the inter-cell carry link in the wiring model.\n\nThe carry chain from FA0 to FA1 is now severed at the software-physical boundary. The adder cells are intact. It's the connection between them — the carry ripple — that's gone.\n\nYou can think of it like a relay race where the baton got dropped between the first and second runners. Everything else is fine. The baton is on the floor.",
    briefing: 'Ripple-carry adder: FA0 Cout must feed FA1 Cin. Carry chain severed between stages at junction N-12. 2-bit addition produces correct LSB but wrong MSB and overflow whenever FA0 generates a carry.',
    fault:    'INCIDENT REPORT: Firmware patch v2.4.1 cleared carry-chain junction flag N-12. FA0 Cout wire disconnected from FA1 Cin (input index 2). Multi-bit carry propagation broken.',
    dispatch: 'Reconnect FA0 output pin Cout (index 1) to FA1 input pin Cin (index 2). Verify FA1 outputs Sum and Cout reach their output nodes.',
    success:  'Carry chain restored. Ripple-carry adder operational. 2-bit accumulation nominal. WO-0062 closed by Beta Shift.',
    lore:     'The ripple-carry adder is the simplest multi-bit adder — and the slowest. Each carry has to propagate through every stage in sequence before the final sum is valid. In a 64-bit adder, that can mean 64 gate delays before the output stabilises. Modern processors use carry-lookahead adders that pre-compute carry signals in parallel — trading gate count for speed. The ripple-carry adder is where you start. It is not where you finish.',
  },

  phases: {
    work: {
      hint: 'FA0 Cout (output pin 1) feeds FA1 Cin (input pin 2). The carry ripples left to right through the chain.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { a0: true, b0: true, a1: false, b1: true },
    },
    break: {
      hint: 'Carry chain severed. FA0 Cout is not reaching FA1 Cin. FA1 computes as if Cin=0 — wrong whenever a carry should propagate.',
      faultNodeId: 'fa0',
      nodes: NODES_FULL,
      inputs: { a0: true, b0: true, a1: false, b1: true },
      wires: [
        ...WIRES_FULL.filter(w => w.id !== 'r5'),
        { id: 'r5', from: { nodeId: 'fa0', pin: 'output', index: 1 }, to: { nodeId: 'fa1', pin: 'input', index: 2 }, broken: true },
      ],
    },
    try: {
      hint: "Key connection: FA0's Cout output (pin index 1) → FA1's Cin input (pin index 2). That is the carry link between the two cells.",
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { a0: false, b0: false, a1: false, b1: false },
      wires: [],
    },
  },
}
