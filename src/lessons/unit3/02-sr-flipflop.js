/**
 * Unit III · Lesson 02 — SR Flip-Flop (Clocked SR Latch)
 *
 * Narrative context:
 *   Work Order WO-0102 — Deck 9, Navigation Commit Register.
 *   The nav system uses a clocked SR flip-flop to latch course corrections
 *   only on clock pulse — prevents mid-calculation glitches from corrupting
 *   the nav register. The clock-enable NAND gate on the S path is missing
 *   its connection to the clock line. Corrections are being written constantly
 *   instead of only on the clock edge, causing nav drift.
 *   Player restores the clock gating on both S and R inputs.
 *
 * Engineering framing:
 *   Clocked SR = SR latch + clock enable gate.
 *   NAND gates on S and R are controlled by CLK.
 *   When CLK=0: both NAND outputs HIGH → latch holds state (S̄=R̄=1).
 *   When CLK=1: NAND gates pass S and R (inverted) into the NAND-latch core.
 *   This gates the latch so it only responds on the clock pulse.
 */

// Clocked SR using NAND-latch core (S' = NAND(S,CLK), R' = NAND(R,CLK))
// NAND latch: nand3 and nand4 cross-coupled (active-LOW SR)
const NODES_FULL = [
  { id: 'S',     type: 'INPUT',  x: 50,  y: 70,  scale: 1 },
  { id: 'CLK',   type: 'INPUT',  x: 50,  y: 195, scale: 1 },
  { id: 'R',     type: 'INPUT',  x: 50,  y: 320, scale: 1 },

  { id: 'nand1', type: 'NAND',   x: 200, y: 90,  scale: 1.1 },   // S gating
  { id: 'nand2', type: 'NAND',   x: 200, y: 300, scale: 1.1 },   // R gating

  { id: 'nand3', type: 'NAND',   x: 370, y: 110, scale: 1.1 },   // latch Q
  { id: 'nand4', type: 'NAND',   x: 370, y: 290, scale: 1.1 },   // latch Q_bar

  { id: 'Q',     type: 'OUTPUT', x: 550, y: 145, scale: 1 },
  { id: 'Qbar',  type: 'OUTPUT', x: 550, y: 320, scale: 1 },
]

const WIRES_FULL = [
  // Clock enable gates
  { id: 'w1', from: { nodeId: 'S',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'R',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
  // NAND latch core
  { id: 'w5', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
  { id: 'w6', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
  { id: 'w7', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
  { id: 'w8', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
  // Outputs
  { id: 'w9',  from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  { id: 'w10', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-02',
    title:       'SR Flip-Flop',
    unit:        3,
    lessonIndex: 1,
    concept:     'SR_FF',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0102',
    location:    'Deck 9 · Navigation Register Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Nav system's been drifting. Not a lot — just enough that the automated correction system keeps logging micro-adjustments every few seconds when it should be batching them to the clock pulse.\n\nThe clocked SR flip-flop on the correction register has a broken clock gate. The S input is supposed to pass through a NAND gate that's controlled by the clock line — that's what makes it only latch on the clock edge. Instead, the CLK wire going into that NAND is floating. So the register just takes any correction signal the moment it arrives.\n\nThat's not memory. That's just a wire with extra steps.",
    briefing: 'Navigation correction register using clocked SR flip-flop. Clock gate on S input missing CLK connection. Register accepts corrections asynchronously — nav drift detected. Clock gating must be restored.',
    fault:    'INCIDENT REPORT: CLK wire to S-path NAND gate disconnected at junction N-4. Flip-flop clock gating non-functional. Register latching asynchronously. Navigation drift logged: 0.003° per hour.',
    dispatch: 'Restore both CLK gate connections: CLK → NAND1 (S gate), CLK → NAND2 (R gate). NAND latch core (NAND3, NAND4) cross-coupled as Q and Q-bar. Flip-flop must only respond when CLK is HIGH.',
    success:  'Clock gating restored. Navigation correction register now latches on clock edge only. Nav drift eliminated. WO-0102 closed by Beta Shift.',
    lore:     'The SR flip-flop adds one thing to the SR latch: time. The clock signal is a gatekeeper — inputs are ignored until the clock says otherwise. This is the foundation of synchronous design. When every element on a circuit waits for the same clock, you can reason about state at defined moments rather than fighting propagation chaos. The forbidden state (S=1, R=1, CLK=1) still exists — and still causes unpredictable behaviour when CLK drops. The flip-flops in the next lessons were designed specifically to eliminate that problem.',
  },

  phases: {
    work: {
      hint: 'CLK=0: latch holds. CLK=1: S and R are passed through NAND gates into the latch core. Watch Q change only when CLK is HIGH.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { S: false, CLK: false, R: false },
    },
    break: {
      hint: 'CLK wire to NAND1 is broken. S path clock gate disabled — register accepts S input at all times regardless of clock.',
      faultNodeId: 'nand1',
      nodes: NODES_FULL,
      inputs: { S: false, CLK: false, R: false },
      wires: [
        { id: 'w1', from: { nodeId: 'S',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'R',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
        { id: 'w4', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
        { id: 'w6', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
        { id: 'w7', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
        { id: 'w8', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
        { id: 'w9',  from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w10', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Three inputs: S, CLK, R. Clock gates: NAND1(S, CLK) and NAND2(R, CLK). Latch core: NAND3 and NAND4 cross-coupled. Both Q and Q-bar go to output nodes.',
      nodes: [
        { id: 'S',     type: 'INPUT',  x: 50,  y: 70,  scale: 1,   locked: false },
        { id: 'CLK',   type: 'INPUT',  x: 50,  y: 195, scale: 1,   locked: false },
        { id: 'R',     type: 'INPUT',  x: 50,  y: 320, scale: 1,   locked: false },
        { id: 'nand1', type: 'NAND',   x: 200, y: 90,  scale: 1.1, locked: false },
        { id: 'nand2', type: 'NAND',   x: 200, y: 300, scale: 1.1, locked: false },
        { id: 'nand3', type: 'NAND',   x: 370, y: 110, scale: 1.1, locked: false },
        { id: 'nand4', type: 'NAND',   x: 370, y: 290, scale: 1.1, locked: false },
        { id: 'Q',     type: 'OUTPUT', x: 550, y: 145, scale: 1 },
        { id: 'Qbar',  type: 'OUTPUT', x: 550, y: 320, scale: 1 },
      ],
      inputs: { S: false, CLK: false, R: false },
      wires: [],
    },
  },
}