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
 *
 * Block Mode note:
 *   Four COMPOSITE D flip-flops in a shift register, Q of each feeding D of
 *   the next. Two corrections from the gate-level version worth flagging:
 *
 *   1. The original wired the Q3→D0 feedback into a standalone D0 INPUT
 *      node. This engine's INPUT nodes always read their driven toggle
 *      value and ignore incoming wires — so that feedback wire was
 *      cosmetic, not functional; D0 was really just pinned to whatever the
 *      D0 toggle was set to. A COMPOSITE node's D pin is a real, simulated
 *      input, so here Q3 feeds Stage 0's D pin directly through `presetOr`.
 *
 *   2. Closing that loop for real exposed a second, more fundamental issue:
 *      this evaluator does one pass per tick (see canvasStore.runEval), not
 *      an iterative settle-to-fixed-point. A ring closes stage3 → ... →
 *      stage0 → ... → stage3, a genuine cycle at the graph level — and
 *      without special handling, whichever node gets evaluated first each
 *      pass reads the "closing" wire's source as not-yet-computed this
 *      tick, forever, regardless of node declaration order. The wire
 *      p2 (Stage 3 Q → presetOr) is marked `feedback: true`, which tells
 *      GraphEvaluator to read that one connection from last tick's signals
 *      instead of this tick's, and to leave it out of the topological
 *      ordering entirely — turning "graph cycle with no correct evaluation
 *      order" into "clean forward chain plus one deliberate one-tick
 *      register tap", which is what a real shift register's wrap-around
 *      actually is.
 *
 *   PRESET is modeled the same way the original intended it: an initial
 *   pulse on Stage 0's D pin before the first CLK edge seeds the single 1.
 */

const NODES_FULL = [
  { id: 'CLK',    type: 'INPUT', x: 50,  y: 460, scale: 1 },
  { id: 'PRESET', type: 'INPUT', x: 50,  y: 40,  scale: 1 },

  { id: 'stage0', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 200, y: 60,  scale: 1, label: 'STAGE 0' },
  { id: 'Q0',     type: 'OUTPUT',    x: 460, y: 105, scale: 1 },

  { id: 'stage1', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 200, y: 260, scale: 1, label: 'STAGE 1' },
  { id: 'Q1',     type: 'OUTPUT',    x: 460, y: 305, scale: 1 },

  { id: 'stage2', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 200, y: 460, scale: 1, label: 'STAGE 2' },
  { id: 'Q2',     type: 'OUTPUT',    x: 460, y: 505, scale: 1 },

  { id: 'stage3', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 200, y: 660, scale: 1, label: 'STAGE 3' },
  { id: 'Q3',     type: 'OUTPUT',    x: 460, y: 705, scale: 1 },

  // PRESET ORs with the ring feedback into Stage 0's D pin — one pulse to
  // seed the '1', then it's out of the loop and pure recirculation takes over.
  { id: 'presetOr', type: 'OR', x: 90, y: 150, scale: 1 },
]

// COMPOSITE input pin order for d_flipflop is ['CLK', 'D'] — index 0 = CLK, index 1 = D.
// COMPOSITE output pin order is always ['Q', 'Qbar'] — index 0 = Q, index 1 = Qbar.
const WIRES_FULL = [
  // Seed: PRESET OR ring-feedback (Q3) → Stage 0 D pin
  { id: 'p1', from: { nodeId: 'PRESET',  pin: 'output' }, to: { nodeId: 'presetOr', pin: 'input', index: 0 } },
  { id: 'p2', from: { nodeId: 'stage3',  pin: 'output' }, to: { nodeId: 'presetOr', pin: 'input', index: 1 }, feedback: true },
  { id: 'p3', from: { nodeId: 'presetOr',pin: 'output' }, to: { nodeId: 'stage0',   pin: 'input', index: 1 } },

  { id: 'a1', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 0 } },
  { id: 'a2', from: { nodeId: 'stage0', pin: 'output' }, to: { nodeId: 'Q0',     pin: 'input', index: 0 } },

  // Shift: Q0 → D1
  { id: 'sh1', from: { nodeId: 'stage0', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 1 }, feedback: true },
  { id: 'b1',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 0 } },
  { id: 'b2',  from: { nodeId: 'stage1', pin: 'output' }, to: { nodeId: 'Q1',     pin: 'input', index: 0 } },

  // Shift: Q1 → D2
  { id: 'sh2', from: { nodeId: 'stage1', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 1 }, feedback: true },
  { id: 'c1',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 0 } },
  { id: 'c2',  from: { nodeId: 'stage2', pin: 'output' }, to: { nodeId: 'Q2',     pin: 'input', index: 0 } },

  // Shift: Q2 → D3
  { id: 'sh3', from: { nodeId: 'stage2', pin: 'output' }, to: { nodeId: 'stage3', pin: 'input', index: 1 }, feedback: true },
  { id: 'd1',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'stage3', pin: 'input', index: 0 } },
  { id: 'd2',  from: { nodeId: 'stage3', pin: 'output' }, to: { nodeId: 'Q3',     pin: 'input', index: 0 } },

  // Ring feedback: Q3 → Stage 0 D pin (via presetOr, wire p2 above)
]

// Broken wires: everything except the ring feedback leg (p2)
const WIRES_BROKEN = [
  ...WIRES_FULL.filter(w => w.id !== 'p2'),
  { id: 'p2', from: { nodeId: 'stage3', pin: 'output' }, to: { nodeId: 'presetOr', pin: 'input', index: 1 }, feedback: true, broken: true },
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
    recap:    "Plasma injector sequence has halted. Nozzles 0 through 3 are supposed to fire in a rolling wave — 0, 1, 2, 3, 0, 1, 2, 3 — but they all went dark after four pulses.\n\nThe sequencer is a 4-bit ring counter: four D flip-flops in a shift register chain with the last output fed back to the first input. At startup, nozzle 0 is activated (1000). Each clock pulse shifts the '1' one position to the right. When it falls off the end of stage 3, it should return to stage 0 via the feedback wire. That's the ring.\n\nThe feedback wire is cut. The '1' shifted through all four stages and vanished. Now every stage holds 0 and nothing is moving.\n\nReconnect Q3 to Stage 0's D pin.",
    briefing: '4-bit ring counter: D flip-flop shift register, Q3 feeds back to Stage 0\'s D pin. Feedback wire severed — the circulating \'1\' falls off the end and all outputs go to 0. Plasma injector sequence halted.',
    fault:    'INCIDENT REPORT: Ring feedback wire RING-FB at junction RFB-0 open-circuit. Q3 output not connected to Stage 0 D pin. Counter lost circulating bit after first full cycle. All four Q outputs at 0. Injector sequence halted.',
    dispatch: 'Reconnect Stage 3\'s Q output to the feedback leg feeding Stage 0\'s D pin. Preset and cascade are intact — only the ring closure is broken. Verify injector sequence: one-hot pattern 1000→0100→0010→0001→1000. Exactly one nozzle active at a time.',
    success:  'Ring feedback restored. Circulating bit re-injected. Sequence 1000→0100→0010→0001 cycling correctly. All four plasma nozzles firing in sequence. WO-0108 closed by Gamma Shift.',
    lore:     "The ring counter is digital's version of a relay baton: a single '1' laps around a track, activating exactly one output at each position. It's a one-hot state machine — always one bit high, the rest low. This makes it ideal for sequencing: no decoder needed, each Q line directly drives its load. The cost is efficiency: N stages encode only N states instead of 2^N. A 4-bit binary counter encodes 16 states; a 4-bit ring counter encodes only 4. But simplicity has value. The ring counter is used in token-ring bus arbitration, round-robin schedulers, and anywhere you need a clean, glitch-free one-at-a-time enable signal. Its close cousin, the Johnson counter, is even more efficient — it encodes 2N states with N flip-flops by twisting the feedback.\n\nEach STAGE box is the same D flip-flop you built in Lesson 04 — CLK and D in, Q and Q̄ out. Stacked four deep with the last Q looped back to the first D, that's the whole ring.",
  },

  phases: {
    work: {
      hint: 'Four D flip-flop stages. Q of each stage feeds D of the next. Q3 loops back into Stage 0\'s D pin (through the preset OR) — that\'s the ring.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false, PRESET: true },
    },
    break: {
      hint: 'The feedback wire from Q3 back to Stage 0\'s D pin is cut. The \'1\' circulates four stages then disappears.',
      faultNodeId: 'stage0',
      nodes: NODES_FULL,
      inputs: { CLK: false, PRESET: true },
      wires: WIRES_BROKEN,
    },
    try: {
      hint: 'Build a 4-bit ring counter: four D flip-flop stages, each Q→D of the next, and Q3 fed back into Stage 0\'s D pin (via the preset OR). CLK drives all stages.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false, PRESET: true },
      wires: [],
    },
  },
}
