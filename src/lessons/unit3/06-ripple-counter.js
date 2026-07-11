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
 *
 * Block Mode note:
 *   This is a "compose it" lesson — the concept being taught is cascading,
 *   not flip-flop internals (those were 01-05). Each stage is a COMPOSITE
 *   T flip-flop: CLK/T in, Q/Q̄ out, simulated behaviorally via
 *   FlipFlopModels.nextState() (see GraphEvaluator.js). T is tied HIGH on
 *   all three stages — a T-FF with T=1 toggles every rising CLK edge, which
 *   is exactly the divide-by-2 behavior this lesson is about. The fault is
 *   still the Q0→CLK1 cascade wire, now drawn between two labeled boxes
 *   instead of buried in two four-gate netlists.
 */

const NODES_FULL = [
  { id: 'CLK', type: 'INPUT', x: 40,  y: 190, scale: 1 },
  { id: 'vcc', type: 'CONST', x: 40,  y: 380, scale: 1, value: true },

  { id: 'stage0', type: 'COMPOSITE', ffKind: 't_flipflop', x: 160, y: 100, scale: 1, label: 'STAGE 0' },
  { id: 'Q0',     type: 'OUTPUT',    x: 420, y: 145, scale: 1 },

  { id: 'stage1', type: 'COMPOSITE', ffKind: 't_flipflop', x: 160, y: 280, scale: 1, label: 'STAGE 1' },
  { id: 'Q1',     type: 'OUTPUT',    x: 420, y: 325, scale: 1 },

  { id: 'stage2', type: 'COMPOSITE', ffKind: 't_flipflop', x: 160, y: 460, scale: 1, label: 'STAGE 2' },
  { id: 'Q2',     type: 'OUTPUT',    x: 420, y: 505, scale: 1 },
]

// COMPOSITE input pin order for t_flipflop is ['CLK', 'T'] — index 0 = CLK, index 1 = T.
// COMPOSITE output pin order is always ['Q', 'Qbar'] — index 0 = Q, index 1 = Qbar.
const WIRES_FULL = [
  // Stage 0: master CLK, T tied HIGH
  { id: 'a1', from: { nodeId: 'CLK', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 0 } },
  { id: 'a2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 1 } },
  { id: 'a3', from: { nodeId: 'stage0', pin: 'output' }, to: { nodeId: 'Q0', pin: 'input', index: 0 } },

  // Cascade: Q0 → CLK of Stage 1
  { id: 'c1', from: { nodeId: 'stage0', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 0 } },

  // Stage 1: T tied HIGH
  { id: 'b2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 1 } },
  { id: 'b3', from: { nodeId: 'stage1', pin: 'output' }, to: { nodeId: 'Q1', pin: 'input', index: 0 } },

  // Cascade: Q1 → CLK of Stage 2
  { id: 'd1', from: { nodeId: 'stage1', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 0 } },

  // Stage 2: T tied HIGH
  { id: 'e2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 1 } },
  { id: 'e3', from: { nodeId: 'stage2', pin: 'output' }, to: { nodeId: 'Q2', pin: 'input', index: 0 } },
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
    dispatch: 'Reconnect Q0 to Stage 1\'s CLK pin. Q1→Stage 2 is intact. After repair, counter sequences 000→001→010→011→100→101→110→111→000. Verify all three output bits cycle.',
    success:  'Q0 cascade rewired. Stage 1 and Stage 2 clocking correctly. Full 3-bit count restored: 000 through 111. Access log sequencer nominal. WO-0106 closed.',
    lore:     "The ripple counter is the most natural counter you can build from flip-flops. Each stage uses the previous stage's Q output as its own clock — the clock signal ripples through the chain. It's asynchronous: the stages don't all update at the same moment. At low frequencies this is fine, but at high speeds, the propagation delay between stages causes brief incorrect states — called ripple glitches or decoding hazards. If you AND or OR the outputs together to decode a specific count, you can get spurious pulses during transitions. The fix is a synchronous counter: all flip-flops share the same clock, and combinational logic precomputes the next state for each bit. More gates, no glitches. The ripple counter trades cleanliness for simplicity. Sometimes the trade is worth it.\n\nEach STAGE box here behaves exactly like the T flip-flop you wired by hand in Lesson 05 — same characteristic table, same edge-triggered behavior. It's just drawn as a black box now, because at this scale the thing worth seeing is the cascade, not the NAND gates inside each stage.",
  },

  phases: {
    work: {
      hint: 'Three T flip-flop stages. T is tied HIGH on all three — a T-FF with T=1 toggles on every rising CLK edge. Each stage\'s Q feeds the next stage\'s CLK.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: "The cascade wire from Q0 to Stage 1's CLK pin is broken. Stage 1 and Stage 2 receive no clock.",
      faultNodeId: 'stage1',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: [
        ...WIRES_FULL.filter(w => w.id !== 'c1'),
        { id: 'c1', from: { nodeId: 'stage0', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 0 }, broken: true },
      ],
    },
    try: {
      hint: 'Three T flip-flop stages, each T held HIGH by a CONST. Wire Q of each stage to the CLK pin of the next to build the cascade.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}
