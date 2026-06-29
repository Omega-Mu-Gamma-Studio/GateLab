/**
 * Unit III · Lesson 06 — Ripple Counter (3-Bit Asynchronous)
 *
 * Narrative context:
 *   Work Order WO-0106 — Deck 5, Cargo Bay Access Log Sequencer.
 *   The cargo bay access log uses a 3-bit ripple counter to stamp entry
 *   sequences 0–7 on each door-open event. The counter cascades three
 *   T flip-flop stages: Q0 clocks Q1, Q1 clocks Q2. The fault: the wire
 *   carrying Q0 to the CLK input of Stage 1 has corroded and broken.
 *   Stages 1 and 2 are frozen at 0. The log counter only counts 0 and 1.
 *   Player rewires Q0 → CLK1 to restore the cascade.
 *
 * Engineering framing:
 *   Ripple counter: each stage's Q output clocks the next stage.
 *   Each stage divides frequency by 2, so Stage 0 = CLK/2 (Q0),
 *   Stage 1 = CLK/4 (Q1), Stage 2 = CLK/8 (Q2).
 *   Reading Q2 Q1 Q0 gives a 3-bit binary count: 000→001→010→...→111→000.
 *   "Ripple" because the clock signal ripples through the chain — propagation
 *   delay accumulates, unlike a synchronous counter. Simple but can glitch.
 */

const NODES_FULL = [
  { id: 'CLK',    type: 'INPUT',  x: 40,  y: 200, scale: 1 },

  // Stage 0 (LSB)
  { id: 'vcc0',   type: 'CONST',  x: 40,  y: 80,  scale: 1, value: true },
  { id: 's0_j',   type: 'NAND',   x: 160, y: 60,  scale: 1.1 },
  { id: 's0_k',   type: 'NAND',   x: 160, y: 230, scale: 1.1 },
  { id: 's0_q',   type: 'NAND',   x: 310, y: 80,  scale: 1.1 },
  { id: 's0_qb',  type: 'NAND',   x: 310, y: 220, scale: 1.1 },
  { id: 'Q0',     type: 'OUTPUT', x: 470, y: 110, scale: 1 },

  // Stage 1
  { id: 'vcc1',   type: 'CONST',  x: 40,  y: 360, scale: 1, value: true },
  { id: 's1_j',   type: 'NAND',   x: 160, y: 340, scale: 1.1 },
  { id: 's1_k',   type: 'NAND',   x: 160, y: 500, scale: 1.1 },
  { id: 's1_q',   type: 'NAND',   x: 310, y: 355, scale: 1.1 },
  { id: 's1_qb',  type: 'NAND',   x: 310, y: 490, scale: 1.1 },
  { id: 'Q1',     type: 'OUTPUT', x: 470, y: 385, scale: 1 },

  // Stage 2 (MSB)
  { id: 'vcc2',   type: 'CONST',  x: 40,  y: 620, scale: 1, value: true },
  { id: 's2_j',   type: 'NAND',   x: 160, y: 600, scale: 1.1 },
  { id: 's2_k',   type: 'NAND',   x: 160, y: 740, scale: 1.1 },
  { id: 's2_q',   type: 'NAND',   x: 310, y: 615, scale: 1.1 },
  { id: 's2_qb',  type: 'NAND',   x: 310, y: 750, scale: 1.1 },
  { id: 'Q2',     type: 'OUTPUT', x: 470, y: 645, scale: 1 },
]

const WIRES_FULL = [
  // Stage 0: T=vcc0, CLK=master CLK, feedback
  { id: 'a1',  from: { nodeId: 'vcc0',  pin: 'output' }, to: { nodeId: 's0_j',  pin: 'input', index: 0 } },
  { id: 'a2',  from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 's0_j',  pin: 'input', index: 1 } },
  { id: 'a3',  from: { nodeId: 's0_qb', pin: 'output' }, to: { nodeId: 's0_j',  pin: 'input', index: 2 } },
  { id: 'a4',  from: { nodeId: 'vcc0',  pin: 'output' }, to: { nodeId: 's0_k',  pin: 'input', index: 0 } },
  { id: 'a5',  from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 's0_k',  pin: 'input', index: 1 } },
  { id: 'a6',  from: { nodeId: 's0_q',  pin: 'output' }, to: { nodeId: 's0_k',  pin: 'input', index: 2 } },
  { id: 'a7',  from: { nodeId: 's0_j',  pin: 'output' }, to: { nodeId: 's0_q',  pin: 'input', index: 0 } },
  { id: 'a8',  from: { nodeId: 's0_qb', pin: 'output' }, to: { nodeId: 's0_q',  pin: 'input', index: 1 } },
  { id: 'a9',  from: { nodeId: 's0_k',  pin: 'output' }, to: { nodeId: 's0_qb', pin: 'input', index: 0 } },
  { id: 'a10', from: { nodeId: 's0_q',  pin: 'output' }, to: { nodeId: 's0_qb', pin: 'input', index: 1 } },
  { id: 'a11', from: { nodeId: 's0_q',  pin: 'output' }, to: { nodeId: 'Q0',    pin: 'input', index: 0 } },
  // Cascade: Q0 → CLK of Stage 1
  { id: 'c1',  from: { nodeId: 's0_q',  pin: 'output' }, to: { nodeId: 's1_j',  pin: 'input', index: 1 } },
  { id: 'c2',  from: { nodeId: 's0_q',  pin: 'output' }, to: { nodeId: 's1_k',  pin: 'input', index: 1 } },

  // Stage 1: T=vcc1, CLK=Q0, feedback
  { id: 'b1',  from: { nodeId: 'vcc1',  pin: 'output' }, to: { nodeId: 's1_j',  pin: 'input', index: 0 } },
  { id: 'b2',  from: { nodeId: 's1_qb', pin: 'output' }, to: { nodeId: 's1_j',  pin: 'input', index: 2 } },
  { id: 'b3',  from: { nodeId: 'vcc1',  pin: 'output' }, to: { nodeId: 's1_k',  pin: 'input', index: 0 } },
  { id: 'b4',  from: { nodeId: 's1_q',  pin: 'output' }, to: { nodeId: 's1_k',  pin: 'input', index: 2 } },
  { id: 'b5',  from: { nodeId: 's1_j',  pin: 'output' }, to: { nodeId: 's1_q',  pin: 'input', index: 0 } },
  { id: 'b6',  from: { nodeId: 's1_qb', pin: 'output' }, to: { nodeId: 's1_q',  pin: 'input', index: 1 } },
  { id: 'b7',  from: { nodeId: 's1_k',  pin: 'output' }, to: { nodeId: 's1_qb', pin: 'input', index: 0 } },
  { id: 'b8',  from: { nodeId: 's1_q',  pin: 'output' }, to: { nodeId: 's1_qb', pin: 'input', index: 1 } },
  { id: 'b9',  from: { nodeId: 's1_q',  pin: 'output' }, to: { nodeId: 'Q1',    pin: 'input', index: 0 } },
  // Cascade: Q1 → CLK of Stage 2
  { id: 'd1',  from: { nodeId: 's1_q',  pin: 'output' }, to: { nodeId: 's2_j',  pin: 'input', index: 1 } },
  { id: 'd2',  from: { nodeId: 's1_q',  pin: 'output' }, to: { nodeId: 's2_k',  pin: 'input', index: 1 } },

  // Stage 2: T=vcc2, CLK=Q1, feedback
  { id: 'e1',  from: { nodeId: 'vcc2',  pin: 'output' }, to: { nodeId: 's2_j',  pin: 'input', index: 0 } },
  { id: 'e2',  from: { nodeId: 's2_qb', pin: 'output' }, to: { nodeId: 's2_j',  pin: 'input', index: 2 } },
  { id: 'e3',  from: { nodeId: 'vcc2',  pin: 'output' }, to: { nodeId: 's2_k',  pin: 'input', index: 0 } },
  { id: 'e4',  from: { nodeId: 's2_q',  pin: 'output' }, to: { nodeId: 's2_k',  pin: 'input', index: 2 } },
  { id: 'e5',  from: { nodeId: 's2_j',  pin: 'output' }, to: { nodeId: 's2_q',  pin: 'input', index: 0 } },
  { id: 'e6',  from: { nodeId: 's2_qb', pin: 'output' }, to: { nodeId: 's2_q',  pin: 'input', index: 1 } },
  { id: 'e7',  from: { nodeId: 's2_k',  pin: 'output' }, to: { nodeId: 's2_qb', pin: 'input', index: 0 } },
  { id: 'e8',  from: { nodeId: 's2_q',  pin: 'output' }, to: { nodeId: 's2_qb', pin: 'input', index: 1 } },
  { id: 'e9',  from: { nodeId: 's2_q',  pin: 'output' }, to: { nodeId: 'Q2',    pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-06',
    title:       'Ripple Counter',
    unit:        3,
    lessonIndex: 5,
    concept:     'RIPPLE_COUNTER',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0106',
    location:    'Deck 5 · Cargo Bay Access Sequencer',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Cargo bay access log is stuck — it's only recording event codes 0 and 1. Should be cycling through 0 to 7 on every door-open event.\n\nThe sequencer uses a 3-bit ripple counter: three T flip-flop stages in cascade. Stage 0 takes the master clock. Stage 1 takes Q0. Stage 2 takes Q1. Each stage divides frequency by 2. Reading Q2 Q1 Q0 together gives a 3-bit binary count.\n\nThe cascade link between Stage 0 and Stage 1 is severed. Q0 isn't reaching Stage 1's clock input. Stages 1 and 2 are frozen at zero. The counter wraps at 001 and starts over.\n\nRewire Q0 to Stage 1's clock input.",
    briefing: '3-bit ripple counter: three cascaded T flip-flop stages. Q0 clocks Stage 1, Q1 clocks Stage 2. Cascade wire Q0→CLK1 open-circuit. Stages 1 and 2 frozen. Counter limited to 0–1.',
    fault:    'INCIDENT REPORT: Interconnect at junction RC-1A open-circuit. Q0 (Stage 0 output) not reaching CLK input of Stage 1. Stage 1 and Stage 2 receive no clock — frozen at 0. Counter outputs Q2=0, Q1=0 always. Q0 normal. Log codes 0 and 1 only.',
    dispatch: 'Reconnect Q0 to Stage 1 CLK (J and K clock pins, index 1). Q1→Stage 2 is intact. After repair, counter sequences 000→001→010→011→100→101→110→111→000. Verify all three output bits cycle.',
    success:  'Q0 cascade rewired. Stage 1 and Stage 2 clocking correctly. Full 3-bit count restored: 000 through 111. Access log sequencer nominal. WO-0106 closed.',
    lore:     "The ripple counter is the most natural counter you can build from flip-flops. Each stage uses the previous stage's Q output as its own clock — the clock signal ripples through the chain. It's asynchronous: the stages don't all update at the same moment. At low frequencies this is fine, but at high speeds, the propagation delay between stages causes brief incorrect states — called ripple glitches or decoding hazards. If you AND or OR the outputs together to decode a specific count, you can get spurious pulses during transitions. The fix is a synchronous counter: all flip-flops share the same clock, and combinational logic precomputes the next state for each bit. More gates, no glitches. The ripple counter trades cleanliness for simplicity. Sometimes the trade is worth it.",
  },

  phases: {
    work: {
      hint: 'Three T flip-flop stages. All T inputs (index 0 and 2 feedback) are wired. CLK of each stage feeds both J and K at index 1.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: "The cascade wire from Q0 to Stage 1's clock input is broken. Stage 1 and Stage 2 receive no clock.",
      faultNodeId: 's1_j',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: [
        ...WIRES_FULL.filter(w => w.id !== 'c1' && w.id !== 'c2'),
        { id: 'c1', from: { nodeId: 's0_q', pin: 'output' }, to: { nodeId: 's1_j', pin: 'input', index: 1 }, broken: true },
        { id: 'c2', from: { nodeId: 's0_q', pin: 'output' }, to: { nodeId: 's1_k', pin: 'input', index: 1 }, broken: true },
      ],
    },
    try: {
      hint: 'Three T flip-flop stages. Each T is held HIGH by a CONST. Q of each stage feeds the CLK (input index 1) of the next. Build the cascade.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}