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
 */

const NODES_FULL = [
  { id: 'CLK',     type: 'INPUT',  x: 50,  y: 430, scale: 1 },

  // Stage 0
  { id: 'inv_fb',  type: 'NOT',    x: 50,  y: 60,  scale: 1 },  // inverted feedback: NOT(Q3) → D0
  { id: 'inv0',    type: 'NOT',    x: 170, y: 120, scale: 1 },
  { id: 'ff0_s',   type: 'NAND',   x: 270, y: 60,  scale: 1.1 },
  { id: 'ff0_r',   type: 'NAND',   x: 270, y: 200, scale: 1.1 },
  { id: 'ff0_q',   type: 'NAND',   x: 410, y: 75,  scale: 1.1 },
  { id: 'ff0_qb',  type: 'NAND',   x: 410, y: 210, scale: 1.1 },
  { id: 'Q0',      type: 'OUTPUT', x: 590, y: 100, scale: 1 },

  // Stage 1
  { id: 'inv1',    type: 'NOT',    x: 170, y: 390, scale: 1 },
  { id: 'ff1_s',   type: 'NAND',   x: 270, y: 340, scale: 1.1 },
  { id: 'ff1_r',   type: 'NAND',   x: 270, y: 480, scale: 1.1 },
  { id: 'ff1_q',   type: 'NAND',   x: 410, y: 355, scale: 1.1 },
  { id: 'ff1_qb',  type: 'NAND',   x: 410, y: 490, scale: 1.1 },
  { id: 'Q1',      type: 'OUTPUT', x: 590, y: 375, scale: 1 },

  // Stage 2
  { id: 'inv2',    type: 'NOT',    x: 170, y: 650, scale: 1 },
  { id: 'ff2_s',   type: 'NAND',   x: 270, y: 600, scale: 1.1 },
  { id: 'ff2_r',   type: 'NAND',   x: 270, y: 740, scale: 1.1 },
  { id: 'ff2_q',   type: 'NAND',   x: 410, y: 615, scale: 1.1 },
  { id: 'ff2_qb',  type: 'NAND',   x: 410, y: 750, scale: 1.1 },
  { id: 'Q2',      type: 'OUTPUT', x: 590, y: 635, scale: 1 },

  // Stage 3
  { id: 'inv3',    type: 'NOT',    x: 170, y: 900, scale: 1 },
  { id: 'ff3_s',   type: 'NAND',   x: 270, y: 855, scale: 1.1 },
  { id: 'ff3_r',   type: 'NAND',   x: 270, y: 990, scale: 1.1 },
  { id: 'ff3_q',   type: 'NAND',   x: 410, y: 870, scale: 1.1 },
  { id: 'ff3_qb',  type: 'NAND',   x: 410, y: 1000, scale: 1.1 },
  { id: 'Q3',      type: 'OUTPUT', x: 590, y: 890, scale: 1 },
]

const WIRES_FULL = [
  // Inverted feedback: Q3 → NOT → D0 (S gate input 0 and inv0 input)
  { id: 'fb1',   from: { nodeId: 'ff3_q',  pin: 'output' }, to: { nodeId: 'inv_fb', pin: 'input', index: 0 } },
  { id: 'fb2',   from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'ff0_s',  pin: 'input', index: 0 } },
  { id: 'fb3',   from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'inv0',   pin: 'input', index: 0 } },

  // Stage 0 D-FF (D = inv_fb output, already wired above as fb2/fb3)
  { id: 's0_w3', from: { nodeId: 'inv0',   pin: 'output' }, to: { nodeId: 'ff0_r',  pin: 'input', index: 0 } },
  { id: 's0_w4', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff0_s',  pin: 'input', index: 1 } },
  { id: 's0_w5', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff0_r',  pin: 'input', index: 1 } },
  { id: 's0_w6', from: { nodeId: 'ff0_s',  pin: 'output' }, to: { nodeId: 'ff0_q',  pin: 'input', index: 0 } },
  { id: 's0_w7', from: { nodeId: 'ff0_qb', pin: 'output' }, to: { nodeId: 'ff0_q',  pin: 'input', index: 1 } },
  { id: 's0_w8', from: { nodeId: 'ff0_r',  pin: 'output' }, to: { nodeId: 'ff0_qb', pin: 'input', index: 0 } },
  { id: 's0_w9', from: { nodeId: 'ff0_q',  pin: 'output' }, to: { nodeId: 'ff0_qb', pin: 'input', index: 1 } },
  { id: 's0_w10',from: { nodeId: 'ff0_q',  pin: 'output' }, to: { nodeId: 'Q0',     pin: 'input', index: 0 } },

  // Shift: Q0 → D1
  { id: 'sh1',   from: { nodeId: 'ff0_q',  pin: 'output' }, to: { nodeId: 'ff1_s',  pin: 'input', index: 0 } },
  { id: 'sh1b',  from: { nodeId: 'ff0_q',  pin: 'output' }, to: { nodeId: 'inv1',   pin: 'input', index: 0 } },

  // Stage 1
  { id: 's1_w3', from: { nodeId: 'inv1',   pin: 'output' }, to: { nodeId: 'ff1_r',  pin: 'input', index: 0 } },
  { id: 's1_w4', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_s',  pin: 'input', index: 1 } },
  { id: 's1_w5', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_r',  pin: 'input', index: 1 } },
  { id: 's1_w6', from: { nodeId: 'ff1_s',  pin: 'output' }, to: { nodeId: 'ff1_q',  pin: 'input', index: 0 } },
  { id: 's1_w7', from: { nodeId: 'ff1_qb', pin: 'output' }, to: { nodeId: 'ff1_q',  pin: 'input', index: 1 } },
  { id: 's1_w8', from: { nodeId: 'ff1_r',  pin: 'output' }, to: { nodeId: 'ff1_qb', pin: 'input', index: 0 } },
  { id: 's1_w9', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff1_qb', pin: 'input', index: 1 } },
  { id: 's1_w10',from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'Q1',     pin: 'input', index: 0 } },

  // Shift: Q1 → D2
  { id: 'sh2',   from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff2_s',  pin: 'input', index: 0 } },
  { id: 'sh2b',  from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'inv2',   pin: 'input', index: 0 } },

  // Stage 2
  { id: 's2_w3', from: { nodeId: 'inv2',   pin: 'output' }, to: { nodeId: 'ff2_r',  pin: 'input', index: 0 } },
  { id: 's2_w4', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff2_s',  pin: 'input', index: 1 } },
  { id: 's2_w5', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff2_r',  pin: 'input', index: 1 } },
  { id: 's2_w6', from: { nodeId: 'ff2_s',  pin: 'output' }, to: { nodeId: 'ff2_q',  pin: 'input', index: 0 } },
  { id: 's2_w7', from: { nodeId: 'ff2_qb', pin: 'output' }, to: { nodeId: 'ff2_q',  pin: 'input', index: 1 } },
  { id: 's2_w8', from: { nodeId: 'ff2_r',  pin: 'output' }, to: { nodeId: 'ff2_qb', pin: 'input', index: 0 } },
  { id: 's2_w9', from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff2_qb', pin: 'input', index: 1 } },
  { id: 's2_w10',from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'Q2',     pin: 'input', index: 0 } },

  // Shift: Q2 → D3
  { id: 'sh3',   from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff3_s',  pin: 'input', index: 0 } },
  { id: 'sh3b',  from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'inv3',   pin: 'input', index: 0 } },

  // Stage 3
  { id: 's3_w3', from: { nodeId: 'inv3',   pin: 'output' }, to: { nodeId: 'ff3_r',  pin: 'input', index: 0 } },
  { id: 's3_w4', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff3_s',  pin: 'input', index: 1 } },
  { id: 's3_w5', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff3_r',  pin: 'input', index: 1 } },
  { id: 's3_w6', from: { nodeId: 'ff3_s',  pin: 'output' }, to: { nodeId: 'ff3_q',  pin: 'input', index: 0 } },
  { id: 's3_w7', from: { nodeId: 'ff3_qb', pin: 'output' }, to: { nodeId: 'ff3_q',  pin: 'input', index: 1 } },
  { id: 's3_w8', from: { nodeId: 'ff3_r',  pin: 'output' }, to: { nodeId: 'ff3_qb', pin: 'input', index: 0 } },
  { id: 's3_w9', from: { nodeId: 'ff3_q',  pin: 'output' }, to: { nodeId: 'ff3_qb', pin: 'input', index: 1 } },
  { id: 's3_w10',from: { nodeId: 'ff3_q',  pin: 'output' }, to: { nodeId: 'Q3',     pin: 'input', index: 0 } },
]

// Broken: inv_fb is stuck HIGH, bypass it — connect Q3 directly to S0 input (wrong, no inversion)
const WIRES_BROKEN = [
  ...WIRES_FULL.filter(w => !['fb1','fb2','fb3'].includes(w.id)),
  // Fault: inv_fb stuck HIGH — the inversion is missing, Q3 feeds back non-inverted
  { id: 'fb1', from: { nodeId: 'ff3_q',  pin: 'output' }, to: { nodeId: 'inv_fb', pin: 'input', index: 0 } },
  { id: 'fb2', from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'ff0_s',  pin: 'input', index: 0 }, broken: true },
  { id: 'fb3', from: { nodeId: 'inv_fb', pin: 'output' }, to: { nodeId: 'inv0',   pin: 'input', index: 0 }, broken: true },
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
    recap:    "Airlock cycle controller is malfunctioning. The sequence should run eight steps: inner door open, pressurize, inner door close, equalize, outer door open, depressurize, outer door close, standby. It's only cycling through four steps then locking up.\n\nThe controller uses a 4-bit Johnson counter — a shift register with inverted feedback. NOT(Q3) feeds back to D0. Starting from 0000, each clock pulse shifts a 1 in from the left until all stages are 1. Then the inversion flips — NOT(1)=0 — and 0s propagate back in until all stages are 0 again. Eight unique states total.\n\nThe feedback inverter has failed. Its output is stuck. The counter is feeding Q3 directly back to D0 — no inversion — which collapses the 8-state sequence into a 4-state ring. Two full airlock phases are unreachable.\n\nReplace the stuck inverter — reconnect the inv_fb output to Stage 0's D input.",
    briefing: '4-bit Johnson counter: shift register with inverted feedback NOT(Q3)→D0. Feedback inverter stuck — non-inverted Q3 fed back. Counter locked to 4-state ring instead of 8-state Johnson sequence. Airlock controller missing 4 phases.',
    fault:    'INCIDENT REPORT: Inverter node inv_fb output wires FB2 and FB3 open-circuit. Q3 reaches inv_fb but output is not connected to Stage 0 D input. Stage 0 receives no data — holds 0. Johnson counter degrades to 4-state loop. Airlock phases 5–8 unreachable.',
    dispatch: 'Reconnect inv_fb output to ff0_s (input 0) and inv0 (input 0). These are the D-input paths for Stage 0. Verify: after repair, sequence must be 0000→1000→1100→1110→1111→0111→0011→0001→0000 (8 unique states).',
    success:  'Inverted feedback restored. Johnson counter cycling all 8 states. Airlock controller running full 8-phase cycle: inner open, pressurize, inner close, equalize, outer open, depressurize, outer close, standby. WO-0109 closed by Alpha Shift.',
    lore:     "The Johnson counter, also called a twisted ring counter or Moebius counter, doubles the ring counter's efficiency: N flip-flops produce 2N states instead of N. The trick is the twist — feeding back the complement of the last stage. As the shift register fills with 1s, the inversion eventually sends 0s back in, creating a second wave that drains the register. The result is a smooth Gray-code-like sequence where only one bit changes per clock. This makes Johnson counters ideal for driving display multiplexers, stepper motor controllers, and anything sensitive to glitches — no two outputs go high at the same time, and transitions are always clean. The standard 74HC4017 decade Johnson counter was once ubiquitous in LED chasers and timing circuits. Look it up if you want to feel like it's 1985.",
  },

  phases: {
    work: {
      hint: 'Four D flip-flop stages in a shift register. Q of each stage feeds D of the next. NOT(Q3) feeds back to D0 — that\'s the Johnson twist.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: 'The inverter in the feedback path has failed — its output wires to Stage 0 are broken. Stage 0 gets no data and holds. Counter stuck in a 4-state loop.',
      faultNodeId: 'inv_fb',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: WIRES_BROKEN,
    },
    try: {
      hint: 'Build a 4-bit Johnson counter: four D flip-flops, Q of each to D of next, and NOT(Q3) fed back to D0. CLK drives all stages.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}