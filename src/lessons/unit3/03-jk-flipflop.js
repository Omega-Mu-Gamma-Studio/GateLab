/**
 * Unit III · Lesson 03 — JK Flip-Flop
 *
 * Narrative context:
 *   Work Order WO-0103 — Deck 9, Thruster Sequence Controller.
 *   The thruster controller uses a JK flip-flop — chosen specifically because
 *   it has no forbidden state. When J=1 and K=1 on a clock edge, Q toggles
 *   instead of entering an undefined condition. The toggle mode was a deliberate
 *   safety design choice for this system.
 *   Fault: the feedback wires carrying Q and Q-bar back to the J and K
 *   NAND gates have been reversed — Q goes to K's gate and Q-bar goes to J's.
 *   The controller is toggling backwards, reversing thruster firing order.
 *   Player unswaps the feedback lines.
 *
 * Engineering framing:
 *   JK = SR with J=S, K=R, plus feedback that PREVENTS the forbidden state.
 *   Q feeds back into the K NAND gate (inhibits K when Q=0).
 *   Q-bar feeds back into the J NAND gate (inhibits J when Q=1 AND Q-bar=0).
 *   J=1, K=1, CLK=1 → Q toggles (previous SR forbidden state is now defined).
 *   This is the most general single-bit flip-flop.
 */

// JK Flip-Flop: clocked SR core + Q and Q-bar feedback into J and K gates
const NODES_FULL = [
  { id: 'J',     type: 'INPUT',  x: 50,  y: 70,  scale: 1 },
  { id: 'CLK',   type: 'INPUT',  x: 50,  y: 195, scale: 1 },
  { id: 'K',     type: 'INPUT',  x: 50,  y: 320, scale: 1 },

  // Three-input NAND gates for J and K paths (J, CLK, Q-bar) and (K, CLK, Q)
  { id: 'nand1', type: 'NAND',   x: 200, y: 90,  scale: 1.1 },   // J gate: J · CLK · Q-bar
  { id: 'nand2', type: 'NAND',   x: 200, y: 300, scale: 1.1 },   // K gate: K · CLK · Q

  // NAND latch core
  { id: 'nand3', type: 'NAND',   x: 380, y: 110, scale: 1.1 },   // Q output
  { id: 'nand4', type: 'NAND',   x: 380, y: 290, scale: 1.1 },   // Q-bar output

  { id: 'Q',     type: 'OUTPUT', x: 560, y: 145, scale: 1 },
  { id: 'Qbar',  type: 'OUTPUT', x: 560, y: 320, scale: 1 },
]

const WIRES_FULL = [
  // J clock gate: J, CLK, and Q-bar all feed NAND1
  { id: 'w1', from: { nodeId: 'J',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 2 } }, // Q-bar feedback → J gate

  // K clock gate: K, CLK, and Q all feed NAND2
  { id: 'w4', from: { nodeId: 'K',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  { id: 'w5', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
  { id: 'w6', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 2 } }, // Q feedback → K gate

  // NAND latch core (cross-coupled)
  { id: 'w7', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
  { id: 'w8', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
  { id: 'w9', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
  { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },

  // Outputs
  { id: 'w11', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  { id: 'w12', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-03',
    title:       'JK Flip-Flop',
    unit:        3,
    lessonIndex: 2,
    concept:     'JK_FF',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0103',
    location:    'Deck 9 · Thruster Sequence Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Thruster controller has been misfiring sequence. Port thruster fires when starboard is called and vice versa. Every burn is backwards from the schedule. Whatever corrective burns the nav system queues up, the controller does the opposite.\n\nI pulled the schematic. The JK flip-flop at the center of this thing has its feedback lines crossed. Q is supposed to feed back into the K gate to prevent K from firing when Q is already low. Q-bar feeds into the J gate for the same reason. Someone swapped them — Q into J's gate, Q-bar into K's.\n\nThe latch still works. It still toggles. It just toggles at the wrong time for the wrong reason.",
    briefing: 'Thruster sequence controller JK flip-flop has reversed feedback wires. Q feeds J gate (should feed K). Q-bar feeds K gate (should feed J). Sequence firing order inverted.',
    fault:    'INCIDENT REPORT: JK flip-flop feedback wires crossed at junction T-7. Q-bar routed to K gate input, Q routed to J gate input — reversed from schematic. Thruster sequence controller firing in reverse order.',
    dispatch: 'Correct the feedback: Q-bar output must connect to J gate third input. Q output must connect to K gate third input. Restore correct JK inhibition logic.',
    success:  'JK flip-flop feedback corrected. Thruster sequence controller nominal. WO-0103 closed by Beta Shift.',
    lore:     'The JK flip-flop eliminates the one thing that made the SR flip-flop dangerous: the undefined state. When J=1 and K=1, instead of an illegal condition, Q simply toggles. This works because of the feedback: Q-bar flows into the J gate so when Q is already HIGH, J is inhibited on the next clock. Q flows into the K gate so when Q is LOW, K is inhibited. The circuit prevents itself from setting what is already set or resetting what is already clear. It is self-aware in a narrow, entirely deterministic way.',
  },

  phases: {
    work: {
      hint: 'J=1,K=0 → Set. J=0,K=1 → Reset. J=0,K=0 → Hold. J=1,K=1 → Toggle. Q-bar → J gate, Q → K gate.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { J: false, CLK: false, K: false },
    },
    break: {
      hint: 'Feedback lines swapped. Q connects to J gate (wrong). Q-bar connects to K gate (wrong). Flip-flop inhibition logic is inverted — toggle behaviour broken.',
      faultNodeId: 'nand1',
      nodes: NODES_FULL,
      inputs: { J: false, CLK: false, K: false },
      wires: [
        { id: 'w1', from: { nodeId: 'J',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
        { id: 'w3', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 2 }, broken: true }, // Q→J (wrong)
        { id: 'w4', from: { nodeId: 'K',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
        { id: 'w5', from: { nodeId: 'CLK',   pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
        { id: 'w6', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 2 }, broken: true }, // Qbar→K (wrong)
        { id: 'w7',  from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
        { id: 'w8',  from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
        { id: 'w9',  from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
        { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
        { id: 'w11', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w12', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'J, CLK, and Q-bar all feed NAND1 (J gate). K, CLK, and Q all feed NAND2 (K gate). Q-bar → J gate. Q → K gate. Latch core is NAND3 and NAND4 cross-coupled.',
      nodes: [
        { id: 'J',     type: 'INPUT',  x: 50,  y: 70,  scale: 1,   locked: false },
        { id: 'CLK',   type: 'INPUT',  x: 50,  y: 195, scale: 1,   locked: false },
        { id: 'K',     type: 'INPUT',  x: 50,  y: 320, scale: 1,   locked: false },
        { id: 'nand1', type: 'NAND',   x: 200, y: 90,  scale: 1.1, locked: false },
        { id: 'nand2', type: 'NAND',   x: 200, y: 300, scale: 1.1, locked: false },
        { id: 'nand3', type: 'NAND',   x: 380, y: 110, scale: 1.1, locked: false },
        { id: 'nand4', type: 'NAND',   x: 380, y: 290, scale: 1.1, locked: false },
        { id: 'Q',     type: 'OUTPUT', x: 560, y: 145, scale: 1 },
        { id: 'Qbar',  type: 'OUTPUT', x: 560, y: 320, scale: 1 },
      ],
      inputs: { J: false, CLK: false, K: false },
      wires: [],
    },
  },
}