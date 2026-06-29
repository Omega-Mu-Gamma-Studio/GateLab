/**
 * Unit III · Lesson 07 — Mod-N Counter (Mod-5 via Synchronous Reset)
 *
 * Narrative context:
 *   Work Order WO-0107 — Deck 3, Navigation Pulse Divider.
 *   The navigation system needs a 5-pulse strobe cycle to synchronize
 *   with an external beacon: pulses 0, 1, 2, 3, 4, then back to 0.
 *   A mod-5 counter (3-bit ripple counter + NAND reset gate) handles this.
 *   When Q2 Q1 Q0 reaches 101 (5), the NAND gate detects Q0=1 AND Q2=1
 *   and pulls all flip-flops CLR low, resetting to 000 — count never
 *   reaches 5, so the sequence is 0→1→2→3→4→0.
 *   Fault: the NAND reset gate's output wire to the CLR inputs has been
 *   cut. The counter counts freely to 7 instead of wrapping at 5.
 *   Player reconnects the NAND gate output to all three CLR inputs.
 *
 * Engineering framing:
 *   Mod-N counter: a binary counter with a feedback decode gate that
 *   resets the counter when the count reaches N.
 *   Mod-5: decode state 5 (Q2=1, Q0=1) via NAND, tie NAND output to CLR.
 *   State 5 is glitch-brief — it appears for one gate delay then resets.
 *   The actual output sequence is 0,1,2,3,4 — 5 states — hence Mod-5.
 *   CLR is active-LOW on these NAND-based FFs (NAND output LOW = reset).
 */

// Simplified representation: 3-bit ripple counter + a NAND decode gate for reset
// We model CLR with a NOR on the Q-latch (active-low NAND output forces Q=0)
// For lesson purposes: NAND(Q0,Q2) output feeds a NOT to produce active-HIGH CLR
// driving into extra inputs on each stage's Q-bar latch gate (forces Q-bar HIGH → Q LOW)

const NODES_FULL = [
  { id: 'CLK',    type: 'INPUT',  x: 40,  y: 220, scale: 1 },

  // Stage 0 (LSB)
  { id: 'vcc0',   type: 'CONST',  x: 40,  y: 80,  scale: 1, value: true },
  { id: 's0_j',   type: 'NAND',   x: 150, y: 60,  scale: 1.1 },
  { id: 's0_k',   type: 'NAND',   x: 150, y: 240, scale: 1.1 },
  { id: 's0_q',   type: 'NAND',   x: 290, y: 80,  scale: 1.1 },
  { id: 's0_qb',  type: 'NAND',   x: 290, y: 230, scale: 1.1 },
  { id: 'Q0',     type: 'OUTPUT', x: 620, y: 110, scale: 1 },

  // Stage 1
  { id: 'vcc1',   type: 'CONST',  x: 40,  y: 380, scale: 1, value: true },
  { id: 's1_j',   type: 'NAND',   x: 150, y: 360, scale: 1.1 },
  { id: 's1_k',   type: 'NAND',   x: 150, y: 520, scale: 1.1 },
  { id: 's1_q',   type: 'NAND',   x: 290, y: 375, scale: 1.1 },
  { id: 's1_qb',  type: 'NAND',   x: 290, y: 510, scale: 1.1 },
  { id: 'Q1',     type: 'OUTPUT', x: 620, y: 400, scale: 1 },

  // Stage 2 (MSB)
  { id: 'vcc2',   type: 'CONST',  x: 40,  y: 640, scale: 1, value: true },
  { id: 's2_j',   type: 'NAND',   x: 150, y: 620, scale: 1.1 },
  { id: 's2_k',   type: 'NAND',   x: 150, y: 760, scale: 1.1 },
  { id: 's2_q',   type: 'NAND',   x: 290, y: 635, scale: 1.1 },
  { id: 's2_qb',  type: 'NAND',   x: 290, y: 760, scale: 1.1 },
  { id: 'Q2',     type: 'OUTPUT', x: 620, y: 660, scale: 1 },

  // Mod-5 decode: NAND(Q0, Q2) → when both HIGH (state=5), output goes LOW
  // Then NOT to get active-HIGH reset signal that forces Q-bar latches
  { id: 'decode', type: 'NAND',   x: 460, y: 390, scale: 1.2 },
  { id: 'rst_inv',type: 'NOT',    x: 530, y: 490, scale: 1 },
]

// Full working wires
const WIRES_FULL = [
  // Stage 0 internals
  { id: 'a1',  from: { nodeId: 'vcc0',   pin: 'output' }, to: { nodeId: 's0_j',   pin: 'input', index: 0 } },
  { id: 'a2',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 's0_j',   pin: 'input', index: 1 } },
  { id: 'a3',  from: { nodeId: 's0_qb',  pin: 'output' }, to: { nodeId: 's0_j',   pin: 'input', index: 2 } },
  { id: 'a4',  from: { nodeId: 'vcc0',   pin: 'output' }, to: { nodeId: 's0_k',   pin: 'input', index: 0 } },
  { id: 'a5',  from: { nodeId: 'CLK',    pin: 'output' }, to: { nodeId: 's0_k',   pin: 'input', index: 1 } },
  { id: 'a6',  from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 's0_k',   pin: 'input', index: 2 } },
  { id: 'a7',  from: { nodeId: 's0_j',   pin: 'output' }, to: { nodeId: 's0_q',   pin: 'input', index: 0 } },
  { id: 'a8',  from: { nodeId: 's0_qb',  pin: 'output' }, to: { nodeId: 's0_q',   pin: 'input', index: 1 } },
  { id: 'a9',  from: { nodeId: 's0_k',   pin: 'output' }, to: { nodeId: 's0_qb',  pin: 'input', index: 0 } },
  { id: 'a10', from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 's0_qb',  pin: 'input', index: 1 } },
  { id: 'a11', from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 'Q0',     pin: 'input', index: 0 } },
  // Cascade Q0→Stage1 CLK
  { id: 'c1',  from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 's1_j',   pin: 'input', index: 1 } },
  { id: 'c2',  from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 's1_k',   pin: 'input', index: 1 } },

  // Stage 1 internals
  { id: 'b1',  from: { nodeId: 'vcc1',   pin: 'output' }, to: { nodeId: 's1_j',   pin: 'input', index: 0 } },
  { id: 'b2',  from: { nodeId: 's1_qb',  pin: 'output' }, to: { nodeId: 's1_j',   pin: 'input', index: 2 } },
  { id: 'b3',  from: { nodeId: 'vcc1',   pin: 'output' }, to: { nodeId: 's1_k',   pin: 'input', index: 0 } },
  { id: 'b4',  from: { nodeId: 's1_q',   pin: 'output' }, to: { nodeId: 's1_k',   pin: 'input', index: 2 } },
  { id: 'b5',  from: { nodeId: 's1_j',   pin: 'output' }, to: { nodeId: 's1_q',   pin: 'input', index: 0 } },
  { id: 'b6',  from: { nodeId: 's1_qb',  pin: 'output' }, to: { nodeId: 's1_q',   pin: 'input', index: 1 } },
  { id: 'b7',  from: { nodeId: 's1_k',   pin: 'output' }, to: { nodeId: 's1_qb',  pin: 'input', index: 0 } },
  { id: 'b8',  from: { nodeId: 's1_q',   pin: 'output' }, to: { nodeId: 's1_qb',  pin: 'input', index: 1 } },
  { id: 'b9',  from: { nodeId: 's1_q',   pin: 'output' }, to: { nodeId: 'Q1',     pin: 'input', index: 0 } },
  // Cascade Q1→Stage2 CLK
  { id: 'd1',  from: { nodeId: 's1_q',   pin: 'output' }, to: { nodeId: 's2_j',   pin: 'input', index: 1 } },
  { id: 'd2',  from: { nodeId: 's1_q',   pin: 'output' }, to: { nodeId: 's2_k',   pin: 'input', index: 1 } },

  // Stage 2 internals
  { id: 'e1',  from: { nodeId: 'vcc2',   pin: 'output' }, to: { nodeId: 's2_j',   pin: 'input', index: 0 } },
  { id: 'e2',  from: { nodeId: 's2_qb',  pin: 'output' }, to: { nodeId: 's2_j',   pin: 'input', index: 2 } },
  { id: 'e3',  from: { nodeId: 'vcc2',   pin: 'output' }, to: { nodeId: 's2_k',   pin: 'input', index: 0 } },
  { id: 'e4',  from: { nodeId: 's2_q',   pin: 'output' }, to: { nodeId: 's2_k',   pin: 'input', index: 2 } },
  { id: 'e5',  from: { nodeId: 's2_j',   pin: 'output' }, to: { nodeId: 's2_q',   pin: 'input', index: 0 } },
  { id: 'e6',  from: { nodeId: 's2_qb',  pin: 'output' }, to: { nodeId: 's2_q',   pin: 'input', index: 1 } },
  { id: 'e7',  from: { nodeId: 's2_k',   pin: 'output' }, to: { nodeId: 's2_qb',  pin: 'input', index: 0 } },
  { id: 'e8',  from: { nodeId: 's2_q',   pin: 'output' }, to: { nodeId: 's2_qb',  pin: 'input', index: 1 } },
  { id: 'e9',  from: { nodeId: 's2_q',   pin: 'output' }, to: { nodeId: 'Q2',     pin: 'input', index: 0 } },

  // Mod-5 decode: NAND(Q0, Q2) — goes LOW when count = 5 (Q2=1, Q0=1)
  { id: 'f1',  from: { nodeId: 's0_q',   pin: 'output' }, to: { nodeId: 'decode',  pin: 'input', index: 0 } },
  { id: 'f2',  from: { nodeId: 's2_q',   pin: 'output' }, to: { nodeId: 'decode',  pin: 'input', index: 1 } },
  // NOT → active-HIGH reset
  { id: 'f3',  from: { nodeId: 'decode',  pin: 'output' }, to: { nodeId: 'rst_inv', pin: 'input', index: 0 } },
  // Reset feeds into Q-bar latch (forcing Q-bar HIGH → Q forced LOW = reset) on all 3 stages
  { id: 'r1',  from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's0_qb',  pin: 'input', index: 2 } },
  { id: 'r2',  from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's1_qb',  pin: 'input', index: 2 } },
  { id: 'r3',  from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's2_qb',  pin: 'input', index: 2 } },
]

export default {
  meta: {
    id:          'unit3-07',
    title:       'Mod-N Counter',
    unit:        3,
    lessonIndex: 6,
    concept:     'MOD_N_COUNTER',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0107',
    location:    'Deck 3 · Navigation Pulse Divider',
    shift:       'Beta Shift',
    commandSpeaker: 'COMMANDER VALE',
  },

  narrative: {
    recap:    "Navigation beacon sync is out. The pulse divider is supposed to emit a 5-count strobe cycle — 0, 1, 2, 3, 4, then back to 0. It's counting 0 through 7 instead. Eight pulses per cycle, not five. Beacon handshake is failing on every seventh pulse.\n\nThe counter is a 3-bit ripple counter with a mod-5 reset gate: a NAND that fires when Q2 and Q0 are both HIGH (count=5), feeding a reset line back to all three stages. When the count hits 5, the reset pulls all outputs back to 0 immediately — so the counter never actually dwells at 5. The sequence is clean: 0, 1, 2, 3, 4, 0.\n\nThe reset wire between the NAND decode gate and the flip-flop stages is severed. The counter ignores state 5 and keeps going to 7.\n\nReconnect the NAND reset output to all three stage reset inputs.",
    briefing: 'Mod-5 counter: 3-bit ripple counter + NAND decode gate detecting state 5 (Q2=1, Q0=1). NAND output feeds reset on all stages. Reset wire cut — counter runs free to 7. Navigation sync fails.',
    fault:    'INCIDENT REPORT: Reset interconnect wires R1, R2, R3 between decode NAND (via inverter) and Q-bar latch reset inputs open-circuit. Counter ignores state 5, counts to 7 freely. Navigation pulse strobe out of spec: 8-count cycle instead of 5.',
    dispatch: 'Reconnect rst_inv output to s0_qb, s1_qb, and s2_qb reset inputs (index 2). Decode gate and cascade intact — only the reset fan-out is broken. Verify counter wraps at 4→0 and never reaches 5, 6, or 7.',
    success:  'Reset fan-out restored. Decode gate firing at state 5. Counter wrapping 4→0. Navigation pulse divider outputting correct 5-count strobe. Beacon handshake nominal. WO-0107 closed.',
    lore:     "Mod-N counters are everywhere: mod-10 for decimal (BCD) displays, mod-60 for seconds and minutes, mod-12 for clocks. The recipe is always the same: binary counter + a decode gate that spots the target count + a reset path back to all stages. The tricky part is that state N appears only as a glitch — the counter reaches it, the gate fires, and the reset clears it almost immediately. On an oscilloscope you might see a tiny spike at state N before it vanishes. At low clock speeds this is harmless. At high speeds, that glitch can propagate and cause errors downstream. CMOS counters like the 74HC163 solve this with synchronous reset — the reset is latched and takes effect on the next clock edge, never producing a glitch state. The asynchronous reset we used here is simpler but less clean. Choose your weapon.",
  },

  phases: {
    work: {
      hint: 'Ripple counter stages plus NAND decode gate detecting Q0=1 AND Q2=1. Decode output (via NOT) resets all three Q-bar latches.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: 'The reset wires from rst_inv to the three stage Q-bar latches are cut. The counter ignores the decode gate and counts freely to 7.',
      faultNodeId: 'rst_inv',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: [
        ...WIRES_FULL.filter(w => !['r1','r2','r3'].includes(w.id)),
        { id: 'r1', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's0_qb', pin: 'input', index: 2 }, broken: true },
        { id: 'r2', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's1_qb', pin: 'input', index: 2 }, broken: true },
        { id: 'r3', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 's2_qb', pin: 'input', index: 2 }, broken: true },
      ],
    },
    try: {
      hint: 'Build the mod-5 counter: 3-bit ripple cascade, a NAND gate sensing Q0 and Q2, a NOT to invert the reset, and wires from the reset output back to all three stage Q-bar latches.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}