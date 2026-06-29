/**
 * Unit III · Lesson 08 — Ring Counter (4-bit)
 *
 * Narrative context:
 *   Work Order WO-0108 — Deck 7, Plasma Injector Sequencer.
 *   The plasma injector fires four nozzles in strict round-robin order:
 *   nozzle 0, nozzle 1, nozzle 2, nozzle 3, nozzle 0, ...
 *   A 4-bit ring counter handles the sequencing: one and only one output
 *   is HIGH at any time, circulating a single 1 through the chain.
 *   D flip-flop stage 0 normally recirculates from Q3 (the last stage).
 *   The fault: the feedback wire from Q3 back to D0 has broken.
 *   Instead of circulating, the ring loses the '1' after it falls off the
 *   end — all outputs go dark and the injector sequence halts.
 *   Player reconnects Q3 → D0 to restore the ring.
 *
 * Engineering framing:
 *   Ring counter: N D flip-flops in a shift register with the last Q
 *   fed back to the first D. One 1 circulates through the chain.
 *   Sequence (initialized 1000): 1000→0100→0010→0001→1000→...
 *   Exactly one output active at a time — a one-hot encoded state machine.
 *   No decode logic needed: each Q IS the nozzle-enable signal.
 *   Initialization: preset D0=1, rest=0 before first clock edge.
 */

// 4-bit ring counter: 4 D flip-flops in shift register, Q3 feeds back to D0
// D FF: modeled as NAND-latch with NOT gate (D → S path, NOT(D) → R path)
// Shift register: each stage's Q connects to next stage's D input

const NODES_FULL = [
  { id: 'CLK',    type: 'INPUT',  x: 50,  y: 430, scale: 1 },
  // Preset: initial value 1 for stage 0 (normally this is set by a RESET circuit)
  // We model the recirculation feedback from Q3 → D0 directly
  // Each FF: D → NOT → R path, D → S path, CLK to both gates, Q cross-coupled

  // Stage 0
  { id: 'D0',     type: 'INPUT',  x: 50,  y: 60,  scale: 1 },
  { id: 'inv0',   type: 'NOT',    x: 170, y: 120, scale: 1 },
  { id: 'ff0_s',  type: 'NAND',   x: 270, y: 60,  scale: 1.1 },
  { id: 'ff0_r',  type: 'NAND',   x: 270, y: 200, scale: 1.1 },
  { id: 'ff0_q',  type: 'NAND',   x: 410, y: 75,  scale: 1.1 },
  { id: 'ff0_qb', type: 'NAND',   x: 410, y: 210, scale: 1.1 },
  { id: 'Q0',     type: 'OUTPUT', x: 590, y: 100, scale: 1 },

  // Stage 1
  { id: 'inv1',   type: 'NOT',    x: 170, y: 390, scale: 1 },
  { id: 'ff1_s',  type: 'NAND',   x: 270, y: 340, scale: 1.1 },
  { id: 'ff1_r',  type: 'NAND',   x: 270, y: 480, scale: 1.1 },
  { id: 'ff1_q',  type: 'NAND',   x: 410, y: 355, scale: 1.1 },
  { id: 'ff1_qb', type: 'NAND',   x: 410, y: 490, scale: 1.1 },
  { id: 'Q1',     type: 'OUTPUT', x: 590, y: 375, scale: 1 },

  // Stage 2
  { id: 'inv2',   type: 'NOT',    x: 170, y: 650, scale: 1 },
  { id: 'ff2_s',  type: 'NAND',   x: 270, y: 600, scale: 1.1 },
  { id: 'ff2_r',  type: 'NAND',   x: 270, y: 740, scale: 1.1 },
  { id: 'ff2_q',  type: 'NAND',   x: 410, y: 615, scale: 1.1 },
  { id: 'ff2_qb', type: 'NAND',   x: 410, y: 750, scale: 1.1 },
  { id: 'Q2',     type: 'OUTPUT', x: 590, y: 635, scale: 1 },

  // Stage 3
  { id: 'inv3',   type: 'NOT',    x: 170, y: 900, scale: 1 },
  { id: 'ff3_s',  type: 'NAND',   x: 270, y: 855, scale: 1.1 },
  { id: 'ff3_r',  type: 'NAND',   x: 270, y: 990, scale: 1.1 },
  { id: 'ff3_q',  type: 'NAND',   x: 410, y: 870, scale: 1.1 },
  { id: 'ff3_qb', type: 'NAND',   x: 410, y: 1000, scale: 1.1 },
  { id: 'Q3',     type: 'OUTPUT', x: 590, y: 890, scale: 1 },
]

// Helper: wires for one D-FF stage
// ff_s = S gate NAND, ff_r = R gate NAND, ff_q = Q latch NAND, ff_qb = Qbar latch NAND
// inv = NOT gate for D-bar path, D_nodeId = source of D input
function ffWires(prefix, D_nodeId, inv_id, ff_s, ff_r, ff_q, ff_qb, Q_out) {
  return [
    // D → S gate input 0, D → NOT input
    { id: `${prefix}_w1`, from: { nodeId: D_nodeId, pin: 'output' }, to: { nodeId: ff_s, pin: 'input', index: 0 } },
    { id: `${prefix}_w2`, from: { nodeId: D_nodeId, pin: 'output' }, to: { nodeId: inv_id, pin: 'input', index: 0 } },
    // NOT(D) → R gate input 0
    { id: `${prefix}_w3`, from: { nodeId: inv_id, pin: 'output' }, to: { nodeId: ff_r, pin: 'input', index: 0 } },
    // CLK → both S and R gates at input 1
    { id: `${prefix}_w4`, from: { nodeId: 'CLK', pin: 'output' }, to: { nodeId: ff_s, pin: 'input', index: 1 } },
    { id: `${prefix}_w5`, from: { nodeId: 'CLK', pin: 'output' }, to: { nodeId: ff_r, pin: 'input', index: 1 } },
    // Latch cross-coupling
    { id: `${prefix}_w6`, from: { nodeId: ff_s,  pin: 'output' }, to: { nodeId: ff_q,  pin: 'input', index: 0 } },
    { id: `${prefix}_w7`, from: { nodeId: ff_qb, pin: 'output' }, to: { nodeId: ff_q,  pin: 'input', index: 1 } },
    { id: `${prefix}_w8`, from: { nodeId: ff_r,  pin: 'output' }, to: { nodeId: ff_qb, pin: 'input', index: 0 } },
    { id: `${prefix}_w9`, from: { nodeId: ff_q,  pin: 'output' }, to: { nodeId: ff_qb, pin: 'input', index: 1 } },
    // Q → output
    { id: `${prefix}_w10`, from: { nodeId: ff_q, pin: 'output' }, to: { nodeId: Q_out, pin: 'input', index: 0 } },
  ]
}

const WIRES_FULL = [
  ...ffWires('s0', 'D0',   'inv0', 'ff0_s', 'ff0_r', 'ff0_q', 'ff0_qb', 'Q0'),
  // Shift: Q0 → D1 (ff1 S gate)
  { id: 'sh1', from: { nodeId: 'ff0_q', pin: 'output' }, to: { nodeId: 'inv1',  pin: 'input', index: 0 } },
  { id: 'sh1b',from: { nodeId: 'ff0_q', pin: 'output' }, to: { nodeId: 'ff1_s', pin: 'input', index: 0 } },

  ...ffWires('s1', 'ff0_q', 'inv1', 'ff1_s', 'ff1_r', 'ff1_q', 'ff1_qb', 'Q1').filter(w => w.id !== 's1_w1' && w.id !== 's1_w2'),
  // Shift: Q1 → D2
  { id: 'sh2', from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'inv2',  pin: 'input', index: 0 } },
  { id: 'sh2b',from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'ff2_s', pin: 'input', index: 0 } },

  ...ffWires('s2', 'ff1_q', 'inv2', 'ff2_s', 'ff2_r', 'ff2_q', 'ff2_qb', 'Q2').filter(w => w.id !== 's2_w1' && w.id !== 's2_w2'),
  // Shift: Q2 → D3
  { id: 'sh3', from: { nodeId: 'ff2_q', pin: 'output' }, to: { nodeId: 'inv3',  pin: 'input', index: 0 } },
  { id: 'sh3b',from: { nodeId: 'ff2_q', pin: 'output' }, to: { nodeId: 'ff3_s', pin: 'input', index: 0 } },

  ...ffWires('s3', 'ff2_q', 'inv3', 'ff3_s', 'ff3_r', 'ff3_q', 'ff3_qb', 'Q3').filter(w => w.id !== 's3_w1' && w.id !== 's3_w2'),
  // Ring feedback: Q3 → D0 (closes the ring)
  { id: 'ring', from: { nodeId: 'ff3_q', pin: 'output' }, to: { nodeId: 'D0', pin: 'input', index: 0 } },
]

// Broken wires: everything except the ring feedback
const WIRES_BROKEN = [
  ...WIRES_FULL.filter(w => w.id !== 'ring'),
  { id: 'ring', from: { nodeId: 'ff3_q', pin: 'output' }, to: { nodeId: 'D0', pin: 'input', index: 0 }, broken: true },
]

export default {
  meta: {
    id:          'unit3-08',
    title:       'Ring Counter',
    unit:        3,
    lessonIndex: 7,
    concept:     'RING_COUNTER',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0108',
    location:    'Deck 7 · Plasma Injector Sequencer',
    shift:       'Gamma Shift',
    commandSpeaker: 'ENGINEER KWON',
  },

  narrative: {
    recap:    "Plasma injector sequence has halted. Nozzles 0 through 3 are supposed to fire in a rolling wave — 0, 1, 2, 3, 0, 1, 2, 3 — but they all went dark after four pulses.\n\nThe sequencer is a 4-bit ring counter: four D flip-flops in a shift register chain with the last output fed back to the first input. At startup, nozzle 0 is activated (1000). Each clock pulse shifts the '1' one position to the right. When it falls off the end of stage 3, it should return to stage 0 via the feedback wire. That's the ring.\n\nThe feedback wire is cut. The '1' shifted through all four stages and vanished. Now every stage holds 0 and nothing is moving.\n\nReconnect Q3 to D0.",
    briefing: '4-bit ring counter: D flip-flop shift register, Q3 feeds back to D0. Feedback wire severed — the circulating \'1\' falls off the end and all outputs go to 0. Plasma injector sequence halted.',
    fault:    'INCIDENT REPORT: Ring feedback wire RING-FB at junction RFB-0 open-circuit. Q3 output not connected to D0 input. Counter lost circulating bit after first full cycle. All four Q outputs at 0. Injector sequence halted.',
    dispatch: 'Reconnect Q3 (ff3_q output) to D0 input. Feedback must close the ring. Verify injector sequence: one-hot pattern 1000→0100→0010→0001→1000. Exactly one nozzle active at a time.',
    success:  'Ring feedback restored. Circulating bit re-injected. Sequence 1000→0100→0010→0001 cycling correctly. All four plasma nozzles firing in sequence. WO-0108 closed by Gamma Shift.',
    lore:     "The ring counter is digital's version of a relay baton: a single '1' laps around a track, activating exactly one output at each position. It's a one-hot state machine — always one bit high, the rest low. This makes it ideal for sequencing: no decoder needed, each Q line directly drives its load. The cost is efficiency: N stages encode only N states instead of 2^N. A 4-bit binary counter encodes 16 states; a 4-bit ring counter encodes only 4. But simplicity has value. The ring counter is used in token-ring bus arbitration, round-robin schedulers, and anywhere you need a clean, glitch-free one-at-a-time enable signal. Its close cousin, the Johnson counter, is even more efficient — it encodes 2N states with N flip-flops by twisting the feedback.",
  },

  phases: {
    work: {
      hint: 'Four D flip-flops in a shift register. Q of each stage feeds D of the next. Q3 feeds back to D0 — that\'s the ring.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false, D0: true },
    },
    break: {
      hint: 'The feedback wire from Q3 back to D0 is cut. The \'1\' circulates four stages then disappears.',
      faultNodeId: 'ff3_q',
      nodes: NODES_FULL,
      inputs: { CLK: false, D0: true },
      wires: WIRES_BROKEN,
    },
    try: {
      hint: 'Build a 4-bit ring counter: four D flip-flops, each Q→D of next, and Q3 fed back to D0. CLK drives all stages.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false, D0: true },
      wires: [],
    },
  },
}