/**
 * Unit III · Lesson 04 — D Flip-Flop
 *
 * Narrative context:
 *   Work Order WO-0104 — Deck 9, Life Support Sensor Latch Array.
 *   Life support sensors feed a D flip-flop bank — each D flip-flop
 *   captures a sensor reading on each clock edge and holds it stable
 *   until the next sample. The D flip-flop eliminates the SR forbidden
 *   state by tying S and R together through a NOT gate: D always goes to
 *   S, and NOT(D) always goes to R. You cannot accidentally set both.
 *   Fault: the NOT gate inverter feeding D̄ into the R path has failed
 *   (output stuck HIGH). The flip-flop behaves like a pure SR with R
 *   always HIGH — Q gets reset every clock pulse regardless of D.
 *   Player replaces the inverter and restores D̄ → R path.
 *
 * Engineering framing:
 *   D flip-flop = SR flip-flop with a NOT gate: R = NOT(D) = D̄
 *   D=1 → S=1, R=0 → Q=1 on clock edge
 *   D=0 → S=0, R=1 → Q=0 on clock edge
 *   No forbidden state possible. On every clock edge: Q = D.
 *   Most common flip-flop in digital design. Every register is made of these.
 */

// D Flip-Flop: NAND-latch core + clock gates + NOT on D path
const NODES_FULL = [
  { id: 'D',     type: 'INPUT',  x: 50,  y: 195, scale: 1 },
  { id: 'CLK',   type: 'INPUT',  x: 50,  y: 320, scale: 1 },

  { id: 'inv1',  type: 'NOT',    x: 180, y: 270, scale: 1 },   // D̄

  { id: 'nand1', type: 'NAND',   x: 310, y: 110, scale: 1.1 }, // S gate: NAND(D, CLK)
  { id: 'nand2', type: 'NAND',   x: 310, y: 310, scale: 1.1 }, // R gate: NAND(D̄, CLK)

  { id: 'nand3', type: 'NAND',   x: 470, y: 130, scale: 1.1 }, // Q
  { id: 'nand4', type: 'NAND',   x: 470, y: 300, scale: 1.1 }, // Q-bar

  { id: 'Q',     type: 'OUTPUT', x: 620, y: 160, scale: 1 },
  { id: 'Qbar',  type: 'OUTPUT', x: 620, y: 330, scale: 1 },
]

const WIRES_FULL = [
  // D direct → NAND1 (S gate)
  { id: 'w1', from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  // D through NOT → NAND2 (R gate)
  { id: 'w2', from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'inv1',  pin: 'input', index: 0 } },
  { id: 'w3', from: { nodeId: 'inv1',  pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  // CLK to both gates
  { id: 'w4', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
  { id: 'w5', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
  // NAND latch core
  { id: 'w6', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
  { id: 'w7', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
  { id: 'w8', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
  { id: 'w9', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
  // Outputs
  { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  { id: 'w11', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-04',
    title:       'D Flip-Flop',
    unit:        3,
    lessonIndex: 3,
    concept:     'D_FF',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0104',
    location:    'Deck 9 · Life Support Sensor Array',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Life support readings are being wiped on every clock cycle. O2, CO2, pressure — all reading zero after each sample pulse. The sensors themselves are fine. The latch array that's supposed to hold each reading until the next one is the problem.\n\nD flip-flop does one thing: on the clock edge, Q becomes whatever D is. The trick is that it feeds D into S and NOT(D) into R, so you can never accidentally set both. That NOT gate — the inverter on the D̄ path — has its output stuck HIGH. So R is always HIGH. Every clock pulse sees R=1 and clears Q regardless of what D is doing.\n\nThat's not a flip-flop. That's a reset circuit with extra steps.",
    briefing: 'Life support D flip-flop latch array clearing Q on every clock pulse. Inverter (NOT gate) on D̄-to-R path output stuck HIGH — R path always active. Sensor readings wiped each cycle.',
    fault:    'INCIDENT REPORT: NOT gate (inverter) in D flip-flop D̄ path failed with output stuck HIGH at junction LS-3. Flip-flop R input permanently driven HIGH. Q cleared every clock edge. Life support log shows all-zero readings for 14 minutes.',
    dispatch: 'Restore the D flip-flop. D feeds directly into NAND1 (S gate) and through the NOT gate into NAND2 (R gate). CLK gates both NAND1 and NAND2. NAND3 and NAND4 form the latch core.',
    success:  'D flip-flop D̄ path restored. Life support sensor latch nominal. Readings logging correctly. WO-0104 closed by Beta Shift.',
    lore:     'The D flip-flop is the most common flip-flop in the world. Nearly every register in every processor — including the ones running this ship — is a bank of D flip-flops. The elegance is in the simplicity: S and R are no longer independent. They are always complementary. D goes to S. NOT(D) goes to R. You can never set both. The forbidden state ceases to exist. On every clock edge, Q captures D. That\'s it. Shift registers, pipeline stages, memory — all of it is just D flip-flops clocked in sequence.',
  },

  phases: {
    work: {
      hint: 'CLK rising edge: Q captures D. D=1 → Q=1. D=0 → Q=0. NOT gate ensures R is always opposite to S.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { D: false, CLK: false },
    },
    break: {
      hint: 'NOT gate output stuck HIGH — R path always HIGH. Q gets cleared every clock pulse regardless of D.',
      faultNodeId: 'inv1',
      nodes: NODES_FULL,
      inputs: { D: true, CLK: false },
      wires: [
        { id: 'w1', from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'inv1',  pin: 'input', index: 0 } },
        { id: 'w3', from: { nodeId: 'inv1',  pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 }, broken: true },
        { id: 'w4', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
        { id: 'w6', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
        { id: 'w7', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
        { id: 'w8', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
        { id: 'w9', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
        { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w11', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'D → NAND1 input 0 (direct). D → NOT gate → NAND2 input 0. CLK → NAND1 input 1 and NAND2 input 1. NAND3 and NAND4 cross-coupled as latch core.',
      nodes: [
        { id: 'D',     type: 'INPUT',  x: 50,  y: 195, scale: 1,   locked: false },
        { id: 'CLK',   type: 'INPUT',  x: 50,  y: 320, scale: 1,   locked: false },
        { id: 'inv1',  type: 'NOT',    x: 180, y: 270, scale: 1,   locked: false },
        { id: 'nand1', type: 'NAND',   x: 310, y: 110, scale: 1.1, locked: false },
        { id: 'nand2', type: 'NAND',   x: 310, y: 310, scale: 1.1, locked: false },
        { id: 'nand3', type: 'NAND',   x: 470, y: 130, scale: 1.1, locked: false },
        { id: 'nand4', type: 'NAND',   x: 470, y: 300, scale: 1.1, locked: false },
        { id: 'Q',     type: 'OUTPUT', x: 620, y: 160, scale: 1 },
        { id: 'Qbar',  type: 'OUTPUT', x: 620, y: 330, scale: 1 },
      ],
      inputs: { D: false, CLK: false },
      wires: [],
    },
  },
}