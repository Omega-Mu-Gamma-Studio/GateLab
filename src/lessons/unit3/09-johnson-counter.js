/**
 * Unit III · Lesson 09 — Johnson Counter (4-bit)
 *
 * Narrative context:
 *   Work Order WO-0109 — Deck 2, Airlock Cycle Controller.
 *   The airlock cycles through 8 states: inner-door-open, pressurize,
 *   inner-door-close, equalize, outer-door-open, depressurize,
 *   outer-door-close, and standby. A 4-bit Johnson counter drives the
 *   state machine — it produces 8 unique output patterns with only 4
 *   flip-flop stages, doubling the state count of a ring counter.
 *   The Johnson counter is a shift register with inverted feedback:
 *   Q3-bar (NOT Q3) feeds back to D0 instead of Q3 directly.
 *   Fault: the inverter in the feedback path has failed (output stuck HIGH).
 *   The counter is feeding Q3 (non-inverted) back to D0 — it's now
 *   behaving like a broken ring counter and locking up after 4 states.
 *   Player replaces the stuck inverter with a working NOT gate.
 *
 * Engineering framing:
 *   Johnson counter = shift register with inverted (twisted) feedback.
 *   4-bit sequence (starting 0000):
 *   0000 → 1000 → 1100 → 1110 → 1111 → 0111 → 0011 → 0001 → 0000
 *   8 unique states from 4 flip-flops: 2N states from N stages.
 *   Each adjacent pair of states differs in exactly one bit — Gray-code-like.
 *   The twisted feedback fills then drains: first all 1s propagate in,
 *   then all 0s propagate in after the inversion feeds back.
 *
 * Block Mode note:
 *   Four COMPOSITE D flip-flops, Q of each feeding D of the next. The
 *   original gate-level version fed Stage 0's D input directly from a real
 *   NOT gate (inv_fb), not through an inert INPUT-node trick like the ring
 *   counter did — so that part carries over unchanged: Q3 → inv_fb →
 *   Stage 0's D pin.
 *
 *   One thing this conversion did surface: Q3 → inv_fb → Stage 0 closes a
 *   loop across the whole chain (stage0→stage1→stage2→stage3→inv_fb→stage0),
 *   a genuine cycle at the graph level. This evaluator runs one pass per
 *   tick, not an iterative settle — so without help, whichever node in that
 *   cycle evaluates first each pass reads the wire closing the loop as
 *   not-yet-computed this tick, forever. Wire fb1 (Stage 3 Q → inv_fb) is
 *   marked `feedback: true`, which tells GraphEvaluator to read it from last
 *   tick's signals instead of this tick's, and to leave it out of the
 *   topological ordering — the twist becomes a clean forward chain plus one
 *   deliberate one-tick register tap, same as the ring counter's fix.
 *
 *   The fault — inv_fb's output not reaching Stage 0 — still sits on the
 *   ordinary (non-feedback) wire fb2, between two blocks exactly like
 *   before, so the puzzle itself is unchanged, just with three fewer gates
 *   per stage cluttering the view.
 */

const NODES_FULL = [
  { id: 'CLK',    type: 'INPUT', x: 50,  y: 380, scale: 1 },
  { id: 'inv_fb', type: 'NOT',   x: 90,  y: 40,  scale: 1 },  // inverted feedback: NOT(Q3) → Stage 0 D

  { id: 'stage0', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 220, y: 60,  scale: 1, label: 'STAGE 0' },
  { id: 'Q0',     type: 'OUTPUT',    x: 480, y: 105, scale: 1 },

  { id: 'stage1', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 220, y: 240, scale: 1, label: 'STAGE 1' },
  { id: 'Q1',     type: 'OUTPUT',    x: 480, y: 285, scale: 1 },

  { id: 'stage2', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 220, y: 420, scale: 1, label: 'STAGE 2' },
  { id: 'Q2',     type: 'OUTPUT',    x: 480, y: 465, scale: 1 },

  { id: 'stage3', type: 'COMPOSITE', ffKind: 'd_flipflop', x: 220, y: 600, scale: 1, label: 'STAGE 3' },
  { id: 'Q3',     type: 'OUTPUT',    x: 480, y: 645, scale: 1 },
]

// COMPOSITE input pin order for d_flipflop is ['CLK', 'D'] — index 0 = CLK, index 1 = D.
// COMPOSITE output pin order is always ['Q', 'Qbar'] — index 0 = Q, index 1 = Qbar.
const WIRES_FULL = [
  // Twisted feedback: Q3 → NOT → Stage 0 D
  { id: 'fb1', from: { nodeId: 'stage3', pin: 'output' }, to: { nodeId: 'inv_fb', pin: 'input', index: 0 }, feedback: true },
  { id: 'fb2', from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 1 } },

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
]

// Broken: inv_fb output not reaching Stage 0's D pin
const WIRES_BROKEN = [
  ...WIRES_FULL.filter(w => w.id !== 'fb2'),
  { id: 'fb2', from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 1 }, broken: true },
]

export default {
  meta: {
    id:          'unit3-09',
    title:       'Johnson Counter',
    unit:        3,
    lessonIndex: 8,
    concept:     'JOHNSON_COUNTER',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0109',
    location:    'Deck 2 · Airlock Cycle Controller',
    shift:       'Alpha Shift',
    commandSpeaker: 'COMMANDER VALE',
  },

  narrative: {
    recap:    "Airlock cycle controller is malfunctioning. The sequence should run eight steps: inner door open, pressurize, inner door close, equalize, outer door open, depressurize, outer door close, standby. It's only cycling through four steps then locking up.\n\nThe controller uses a 4-bit Johnson counter — a shift register with inverted feedback. NOT(Q3) feeds back to Stage 0's D pin. Starting from 0000, each clock pulse shifts a 1 in from the left until all stages are 1. Then the inversion flips — NOT(1)=0 — and 0s propagate back in until all stages are 0 again. Eight unique states total.\n\nThe feedback inverter has failed. Its output isn't reaching Stage 0. The counter's D input floats — Stage 0 holds. Two full airlock phases are unreachable.\n\nReplace the stuck inverter's connection — reconnect inv_fb's output to Stage 0's D pin.",
    briefing: '4-bit Johnson counter: shift register with inverted feedback NOT(Q3)→D0. Feedback inverter\'s output wire cut. Counter locked to a 4-state loop instead of the 8-state Johnson sequence. Airlock controller missing 4 phases.',
    fault:    'INCIDENT REPORT: Inverter node inv_fb output wire FB2 open-circuit. Q3 reaches inv_fb but the inverted signal is not connected to Stage 0\'s D pin. Stage 0 receives no data — holds. Johnson counter degrades to a 4-state loop. Airlock phases 5–8 unreachable.',
    dispatch: 'Reconnect inv_fb\'s output to Stage 0\'s D pin. Verify: after repair, sequence must be 0000→1000→1100→1110→1111→0111→0011→0001→0000 (8 unique states).',
    success:  'Inverted feedback restored. Johnson counter cycling all 8 states. Airlock controller running full 8-phase cycle: inner open, pressurize, inner close, equalize, outer open, depressurize, outer close, standby. WO-0109 closed by Alpha Shift.',
    lore:     "The Johnson counter, also called a twisted ring counter or Moebius counter, doubles the ring counter's efficiency: N flip-flops produce 2N states instead of N. The trick is the twist — feeding back the complement of the last stage. As the shift register fills with 1s, the inversion eventually sends 0s back in, creating a second wave that drains the register. The result is a smooth Gray-code-like sequence where only one bit changes per clock. This makes Johnson counters ideal for driving display multiplexers, stepper motor controllers, and anything sensitive to glitches — no two outputs go high at the same time, and transitions are always clean. The standard 74HC4017 decade Johnson counter was once ubiquitous in LED chasers and timing circuits. Look it up if you want to feel like it's 1985.\n\nEach STAGE box is the same D flip-flop from Lesson 04. The whole Johnson twist lives in one gate — inv_fb — sitting between Stage 3's Q and Stage 0's D.",
  },

  phases: {
    work: {
      hint: 'Four D flip-flop stages in a shift register. Q of each stage feeds D of the next. NOT(Q3) feeds back to Stage 0\'s D pin — that\'s the Johnson twist.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: "The inverter's output wire to Stage 0 is broken. Stage 0 gets no data and holds. Counter stuck in a 4-state loop.",
      faultNodeId: 'stage0',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: WIRES_BROKEN,
    },
    try: {
      hint: 'Build a 4-bit Johnson counter: four D flip-flop stages, Q of each to D of the next, and NOT(Q3) fed back to Stage 0\'s D pin. CLK drives all stages.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}
