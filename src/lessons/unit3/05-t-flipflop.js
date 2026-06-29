/**
 * Unit III · Lesson 05 — T Flip-Flop
 *
 * Narrative context:
 *   Work Order WO-0105 — Deck 9, Clock Divider / Frequency Prescaler.
 *   The ship's precision timing system uses a chain of T flip-flops as a
 *   frequency divider — each T flip-flop (with T always tied HIGH) toggles
 *   on every clock edge, dividing frequency by 2. The prescaler is running
 *   fast — the second stage is outputting at full clock speed instead of
 *   half. The T input on the second flip-flop has been disconnected from
 *   the VCC rail and is floating LOW. With T=0, the flip-flop holds instead
 *   of toggling. Player reconnects T to HIGH and restores the divide-by-2.
 *
 * Engineering framing:
 *   T (Toggle) flip-flop: simplest possible sequential circuit.
 *   T=1, CLK edge → Q toggles.
 *   T=0, CLK edge → Q holds.
 *   Implemented as JK flip-flop with J=K=T.
 *   Divide-by-2: tie T=1 permanently → Q toggles every clock → f_out = f_clk / 2.
 *   Chain N stages → divide by 2^N.
 */

// T Flip-Flop: JK flip-flop with J and K tied together as T
// Simplified canvas: show both stages of the prescaler (T1 and T2)
const NODES_FULL = [
  { id: 'T1',    type: 'INPUT',  x: 50,  y: 110, scale: 1 },  // T for stage 1 — HIGH
  { id: 'CLK',   type: 'INPUT',  x: 50,  y: 230, scale: 1 },  // master clock

  // Stage 1 T flip-flop (represented as single FF node)
  { id: 'ff1_j', type: 'NAND',   x: 190, y: 80,  scale: 1.1 }, // J gate
  { id: 'ff1_k', type: 'NAND',   x: 190, y: 270, scale: 1.1 }, // K gate
  { id: 'ff1_q', type: 'NAND',   x: 360, y: 100, scale: 1.1 }, // Q latch
  { id: 'ff1_qb',type: 'NAND',   x: 360, y: 270, scale: 1.1 }, // Q-bar latch
  { id: 'Q1',    type: 'OUTPUT', x: 540, y: 130, scale: 1 },

  // Stage 2 T flip-flop
  { id: 'T2',    type: 'INPUT',  x: 50,  y: 400, scale: 1 },  // T for stage 2 — should be HIGH
  { id: 'ff2_j', type: 'NAND',   x: 190, y: 370, scale: 1.1 },
  { id: 'ff2_k', type: 'NAND',   x: 190, y: 500, scale: 1.1 },
  { id: 'ff2_q', type: 'NAND',   x: 360, y: 385, scale: 1.1 },
  { id: 'ff2_qb',type: 'NAND',   x: 360, y: 500, scale: 1.1 },
  { id: 'Q2',    type: 'OUTPUT', x: 540, y: 415, scale: 1 },
]

const WIRES_FULL = [
  // Stage 1 — T1 (HIGH) with CLK, feedback cross-coupled
  { id: 'a1', from: { nodeId: 'T1',     pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 0 } },
  { id: 'a2', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 1 } },
  { id: 'a3', from: { nodeId: 'ff1_qb', pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 2 } },
  { id: 'a4', from: { nodeId: 'T1',     pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 0 } },
  { id: 'a5', from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 1 } },
  { id: 'a6', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 2 } },
  { id: 'a7', from: { nodeId: 'ff1_j',  pin: 'output' }, to: { nodeId: 'ff1_q', pin: 'input', index: 0 } },
  { id: 'a8', from: { nodeId: 'ff1_qb', pin: 'output' }, to: { nodeId: 'ff1_q', pin: 'input', index: 1 } },
  { id: 'a9', from: { nodeId: 'ff1_k',  pin: 'output' }, to: { nodeId: 'ff1_qb',pin: 'input', index: 0 } },
  { id: 'a10', from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'ff1_qb',pin: 'input', index: 1 } },
  { id: 'a11', from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'Q1',    pin: 'input', index: 0 } },
  // Q1 feeds CLK of stage 2 (divided clock)
  { id: 'a12', from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 1 } },
  { id: 'a13', from: { nodeId: 'ff1_q', pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 1 } },

  // Stage 2 — T2 (HIGH) with Q1 as clock
  { id: 'b1', from: { nodeId: 'T2',     pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 0 } },
  { id: 'b2', from: { nodeId: 'ff2_qb', pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 2 } },
  { id: 'b3', from: { nodeId: 'T2',     pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 0 } },
  { id: 'b4', from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 2 } },
  { id: 'b5', from: { nodeId: 'ff2_j',  pin: 'output' }, to: { nodeId: 'ff2_q', pin: 'input', index: 0 } },
  { id: 'b6', from: { nodeId: 'ff2_qb', pin: 'output' }, to: { nodeId: 'ff2_q', pin: 'input', index: 1 } },
  { id: 'b7', from: { nodeId: 'ff2_k',  pin: 'output' }, to: { nodeId: 'ff2_qb',pin: 'input', index: 0 } },
  { id: 'b8', from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff2_qb',pin: 'input', index: 1 } },
  { id: 'b9', from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'Q2',    pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-05',
    title:       'T Flip-Flop',
    unit:        3,
    lessonIndex: 4,
    concept:     'T_FF',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0105',
    location:    'Deck 9 · Precision Timing Array',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Precision timing array is running at double speed on the second prescaler stage. Everything downstream of stage 2 is getting twice the pulses it should — chronometer drift, navigation sync errors, even the comm system timestamp is off by almost a factor of two.\n\nThe prescaler chain is two T flip-flops. Stage 1 takes the master clock and divides by 2. Stage 2 takes Stage 1's output and divides again. Each stage needs T tied HIGH to toggle on every edge.\n\nStage 2's T input is floating. It's reading LOW. So instead of toggling, it holds. Q2 isn't dividing anything — it's just passing the divided clock straight through to the output. Stage 2 might as well not exist.\n\nWire T2 HIGH.",
    briefing: 'Precision timing prescaler: two-stage T flip-flop divide-by-4 chain. Stage 2 T input disconnected from VCC — floating LOW. Stage 2 holds instead of toggles. Output at half intended frequency.',
    fault:    'INCIDENT REPORT: T input on Stage 2 T flip-flop disconnected from VCC rail at junction PT-2. T2 = LOW. Stage 2 holds state instead of toggling. Prescaler divide-by-4 reduced to divide-by-2. Downstream timing systems off by 2x.',
    dispatch: 'Connect T2 (Stage 2 T input) HIGH. T1 should already be HIGH. Both stages should toggle on every clock edge they receive — Stage 1 on CLK, Stage 2 on Q1. Restore divide-by-4 chain.',
    success:  'T2 reconnected. Stage 2 toggling correctly. Prescaler divide-by-4 restored. Timing array nominal. WO-0105 closed by Beta Shift.',
    lore:     'The T flip-flop is the toggle flip-flop — a JK with J and K permanently tied together. When T=1, it toggles on every clock edge. When T=0, it holds. Chain them and you get a binary counter: Stage 1 divides by 2, Stage 2 by 4, Stage 3 by 8, N stages by 2^N. This is the foundation of every ripple counter, clock prescaler, and frequency divider in digital electronics. The T flip-flop\'s simplicity is its power — one input, one output, perfect binary counting.',
  },

  phases: {
    work: {
      hint: 'Both T inputs HIGH. Stage 1 toggles on CLK. Stage 2 toggles on Q1. Q2 = CLK ÷ 4.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { T1: true, CLK: false, T2: true },
    },
    break: {
      hint: 'T2 disconnected — Stage 2 T input floating LOW. Stage 2 holds instead of toggles. Q2 tracks Q1 instead of dividing it.',
      faultNodeId: 'ff2_j',
      nodes: NODES_FULL,
      inputs: { T1: true, CLK: false, T2: false },
      wires: [
        { id: 'a1',  from: { nodeId: 'T1',     pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 0 } },
        { id: 'a2',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 1 } },
        { id: 'a3',  from: { nodeId: 'ff1_qb', pin: 'output' }, to: { nodeId: 'ff1_j', pin: 'input', index: 2 } },
        { id: 'a4',  from: { nodeId: 'T1',     pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 0 } },
        { id: 'a5',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 1 } },
        { id: 'a6',  from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff1_k', pin: 'input', index: 2 } },
        { id: 'a7',  from: { nodeId: 'ff1_j',  pin: 'output' }, to: { nodeId: 'ff1_q', pin: 'input', index: 0 } },
        { id: 'a8',  from: { nodeId: 'ff1_qb', pin: 'output' }, to: { nodeId: 'ff1_q', pin: 'input', index: 1 } },
        { id: 'a9',  from: { nodeId: 'ff1_k',  pin: 'output' }, to: { nodeId: 'ff1_qb',pin: 'input', index: 0 } },
        { id: 'a10', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff1_qb',pin: 'input', index: 1 } },
        { id: 'a11', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'Q1',    pin: 'input', index: 0 } },
        { id: 'a12', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 1 } },
        { id: 'a13', from: { nodeId: 'ff1_q',  pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 1 } },
        { id: 'b1',  from: { nodeId: 'T2',     pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 0 }, broken: true },
        { id: 'b2',  from: { nodeId: 'ff2_qb', pin: 'output' }, to: { nodeId: 'ff2_j', pin: 'input', index: 2 } },
        { id: 'b3',  from: { nodeId: 'T2',     pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 0 }, broken: true },
        { id: 'b4',  from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff2_k', pin: 'input', index: 2 } },
        { id: 'b5',  from: { nodeId: 'ff2_j',  pin: 'output' }, to: { nodeId: 'ff2_q', pin: 'input', index: 0 } },
        { id: 'b6',  from: { nodeId: 'ff2_qb', pin: 'output' }, to: { nodeId: 'ff2_q', pin: 'input', index: 1 } },
        { id: 'b7',  from: { nodeId: 'ff2_k',  pin: 'output' }, to: { nodeId: 'ff2_qb',pin: 'input', index: 0 } },
        { id: 'b8',  from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'ff2_qb',pin: 'input', index: 1 } },
        { id: 'b9',  from: { nodeId: 'ff2_q',  pin: 'output' }, to: { nodeId: 'Q2',    pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Two T flip-flop stages. Both T inputs must be HIGH to toggle. Stage 2 CLK comes from Q1. Q2 should be CLK divided by 4.',
      nodes: [
        { id: 'T1',     type: 'INPUT',  x: 50,  y: 110, scale: 1,   locked: false },
        { id: 'CLK',    type: 'INPUT',  x: 50,  y: 230, scale: 1,   locked: false },
        { id: 'ff1_j',  type: 'NAND',   x: 190, y: 80,  scale: 1.1, locked: false },
        { id: 'ff1_k',  type: 'NAND',   x: 190, y: 270, scale: 1.1, locked: false },
        { id: 'ff1_q',  type: 'NAND',   x: 360, y: 100, scale: 1.1, locked: false },
        { id: 'ff1_qb', type: 'NAND',   x: 360, y: 270, scale: 1.1, locked: false },
        { id: 'Q1',     type: 'OUTPUT', x: 540, y: 130, scale: 1 },
        { id: 'T2',     type: 'INPUT',  x: 50,  y: 400, scale: 1,   locked: false },
        { id: 'ff2_j',  type: 'NAND',   x: 190, y: 370, scale: 1.1, locked: false },
        { id: 'ff2_k',  type: 'NAND',   x: 190, y: 500, scale: 1.1, locked: false },
        { id: 'ff2_q',  type: 'NAND',   x: 360, y: 385, scale: 1.1, locked: false },
        { id: 'ff2_qb', type: 'NAND',   x: 360, y: 500, scale: 1.1, locked: false },
        { id: 'Q2',     type: 'OUTPUT', x: 540, y: 415, scale: 1 },
      ],
      inputs: { T1: true, CLK: false, T2: false },
      wires: [],
    },
  },
}