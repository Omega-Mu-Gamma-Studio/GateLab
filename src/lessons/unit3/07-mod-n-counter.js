/**
 * Unit III · Lesson 07 — Mod-N Counter (Mod-5 via Synchronous Reset)
 *
 * Narrative context:
 *   Work Order WO-0107 — Deck 3, Navigation Pulse Divider.
 *   The navigation system needs a 5-pulse strobe cycle to synchronize
 *   with an external beacon: pulses 0, 1, 2, 3, 4, then back to 0.
 *   A mod-5 counter (3-bit ripple counter + NAND reset gate) handles this.
 *   When Q2 Q1 Q0 reaches 101 (5), the NAND gate detects Q0=1 AND Q2=1
 *   and pulls all flip-flops CLR HIGH, resetting to 000 — count never
 *   reaches 5, so the sequence is 0→1→2→3→4→0.
 *   Fault: the NAND reset gate's output wire to the CLR inputs has been
 *   cut. The counter counts freely to 7 instead of wrapping at 5.
 *   Player reconnects the NAND gate output to all three CLR inputs.
 *
 * Engineering framing:
 *   Mod-N counter: a binary counter with a feedback decode gate that
 *   resets the counter when the count reaches N.
 *   Mod-5: decode state 5 (Q2=1, Q0=1) via NAND, tie NAND output (via
 *   NOT, for active-HIGH) to CLR on all three stages.
 *   State 5 is glitch-brief — it appears for one gate delay then resets.
 *   The actual output sequence is 0,1,2,3,4 — 5 states — hence Mod-5.
 *
 * Block Mode note:
 *   This is a "compose it" lesson, same family as 06/08/09 — the concept
 *   being taught is decode-and-reset feedback, not flip-flop internals
 *   (those were 01-05). Each stage is a COMPOSITE JK flip-flop with an
 *   added CLR pin (blockKind: 'jk_flipflop_clr' — see BlockDefs.js):
 *   CLK/J/K/CLR in, Q/Qbar out. J and K are tied HIGH on all three
 *   stages (JK toggle mode — same divide-by-2 cascade as the ripple
 *   counter), and CLR is driven by the decode-NAND → NOT reset line.
 *   The fault is still the reset fan-out wire, now drawn from one
 *   labeled decode gate into three labeled boxes' CLR pins instead of
 *   into eight buried NAND-latch internals.
 *
 * Known modeling quirk (present in both this version and the original
 * raw-gate version — not introduced by the Block Mode conversion): the
 * 2-input NAND(Q0, Q2) decode can't distinguish state 5 (101) from state
 * 7 (111) — both have Q0=1 and Q2=1, regardless of Q1. Combined with this
 * evaluator's one-evaluate()-call-per-tick model (no fixed-point settling
 * within a single tick — see canvasStore.runEval and the `feedback` note
 * in GraphEvaluator.js), a full reset-to-000 can, on the very next master
 * clock edge, ripple all three stages back to 111 in the same pass rather
 * than counting cleanly up through 0,1,2,3,4. The decode/reset logic
 * itself is correct per the lesson's stated fault (severed reset wire);
 * this is a separate, pre-existing timing edge case in the underlying
 * mod-5 design worth revisiting — e.g. a 3-input exact-match decode
 * (Q0 AND NOT-Q1 AND Q2) instead of the 2-input NAND, or a synchronous
 * (not async) reset — rather than something this patch attempts to fix.
 */

// COMPOSITE input pin order for jk_flipflop_clr is ['CLK','J','K','CLR'] —
// index 0 = CLK, 1 = J, 2 = K, 3 = CLR. Output pin order is always
// ['Q','Qbar'] — index 0 = Q, index 1 = Qbar.

const NODES_FULL = [
  { id: 'CLK', type: 'INPUT', x: 40,  y: 300, scale: 1 },
  { id: 'vcc',  type: 'CONST', x: 40, y: 60,  scale: 1, value: true },

  { id: 'stage0', type: 'COMPOSITE', blockKind: 'jk_flipflop_clr', x: 180, y: 100, scale: 1, label: 'STAGE 0' },
  { id: 'Q0',     type: 'OUTPUT',    x: 460, y: 145, scale: 1 },

  { id: 'stage1', type: 'COMPOSITE', blockKind: 'jk_flipflop_clr', x: 180, y: 280, scale: 1, label: 'STAGE 1' },
  { id: 'Q1',     type: 'OUTPUT',    x: 460, y: 325, scale: 1 },

  { id: 'stage2', type: 'COMPOSITE', blockKind: 'jk_flipflop_clr', x: 180, y: 460, scale: 1, label: 'STAGE 2' },
  { id: 'Q2',     type: 'OUTPUT',    x: 460, y: 505, scale: 1 },

  // Mod-5 decode: NAND(Q0, Q2) → LOW when count=5 (Q2=1, Q0=1), then NOT
  // to get the active-HIGH reset line the CLR pins expect.
  { id: 'decode',  type: 'NAND', x: 620, y: 300, scale: 1.2 },
  { id: 'rst_inv', type: 'NOT',  x: 720, y: 300, scale: 1 },
]

const WIRES_FULL = [
  // Stage 0: master CLK, J/K tied HIGH (toggle mode)
  { id: 'a1', from: { nodeId: 'CLK', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 0 } },
  { id: 'a2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 1 } },
  { id: 'a3', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 2 } },
  { id: 'a4', from: { nodeId: 'stage0', pin: 'output', index: 0 }, to: { nodeId: 'Q0', pin: 'input', index: 0 } },

  // Cascade: Q0 → CLK of Stage 1
  { id: 'c1', from: { nodeId: 'stage0', pin: 'output', index: 0 }, to: { nodeId: 'stage1', pin: 'input', index: 0 } },
  { id: 'b2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 1 } },
  { id: 'b3', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 2 } },
  { id: 'b4', from: { nodeId: 'stage1', pin: 'output', index: 0 }, to: { nodeId: 'Q1', pin: 'input', index: 0 } },

  // Cascade: Q1 → CLK of Stage 2
  { id: 'd1', from: { nodeId: 'stage1', pin: 'output', index: 0 }, to: { nodeId: 'stage2', pin: 'input', index: 0 } },
  { id: 'e2', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 1 } },
  { id: 'e3', from: { nodeId: 'vcc', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 2 } },
  { id: 'e4', from: { nodeId: 'stage2', pin: 'output', index: 0 }, to: { nodeId: 'Q2', pin: 'input', index: 0 } },

  // Mod-5 decode: NAND(Q0, Q2) — goes LOW when count = 5 (Q2=1, Q0=1)
  { id: 'f1', from: { nodeId: 'stage0', pin: 'output', index: 0 }, to: { nodeId: 'decode', pin: 'input', index: 0 } },
  { id: 'f2', from: { nodeId: 'stage2', pin: 'output', index: 0 }, to: { nodeId: 'decode', pin: 'input', index: 1 } },
  { id: 'f3', from: { nodeId: 'decode', pin: 'output' }, to: { nodeId: 'rst_inv', pin: 'input', index: 0 } },

  // Reset fan-out into CLR (index 3) on all three stages
  { id: 'r1', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 3 }, feedback: true },
  { id: 'r2', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 3 }, feedback: true },
  { id: 'r3', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 3 }, feedback: true },
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
    recap:    "Navigation beacon sync is out. The pulse divider is supposed to emit a 5-count strobe cycle — 0, 1, 2, 3, 4, then back to 0. It's counting 0 through 7 instead. Eight pulses per cycle, not five. Beacon handshake is failing on every seventh pulse.\n\nThe counter is three JK flip-flop stages cascaded like the cargo bay's ripple counter, with one addition: a NAND that fires when Q2 and Q0 are both HIGH (count=5), feeding a reset line back into every stage's CLR pin. When the count hits 5, the reset pulls all outputs back to 0 immediately — so the counter never actually dwells at 5. The sequence is clean: 0, 1, 2, 3, 4, 0.\n\nThe reset wire between the NAND decode gate (via inverter) and the three stage boxes is severed. The counter ignores state 5 and keeps going to 7.\n\nReconnect the inverter's output to all three stage CLR pins.",
    briefing: 'Mod-5 counter: 3-bit JK cascade + NAND decode gate detecting state 5 (Q2=1, Q0=1). NAND output (via NOT) feeds CLR on all stages. Reset wire cut — counter runs free to 7. Navigation sync fails.',
    fault:    "INCIDENT REPORT: Reset interconnect wires R1, R2, R3 between the inverter and each stage's CLR pin (index 3) open-circuit. Counter ignores state 5, counts to 7 freely. Navigation pulse strobe out of spec: 8-count cycle instead of 5.",
    dispatch: 'Reconnect rst_inv output to stage0, stage1, and stage2 CLR pins (index 3). Decode gate and cascade intact — only the reset fan-out is broken. Verify counter wraps at 4→0 and never reaches 5, 6, or 7.',
    success:  'Reset fan-out restored. Decode gate firing at state 5. Counter wrapping 4→0. Navigation pulse divider outputting correct 5-count strobe. Beacon handshake nominal. WO-0107 closed.',
    lore:     "Mod-N counters are everywhere: mod-10 for decimal (BCD) displays, mod-60 for seconds and minutes, mod-12 for clocks. The recipe is always the same: binary counter + a decode gate that spots the target count + a reset path back to all stages. The tricky part is that state N appears only as a glitch — the counter reaches it, the gate fires, and the reset clears it almost immediately. On an oscilloscope you might see a tiny spike at state N before it vanishes. At low clock speeds this is harmless. At high speeds, that glitch can propagate and cause errors downstream. CMOS counters like the 74HC163 solve this with synchronous reset — the reset is latched and takes effect on the next clock edge, never producing a glitch state. The asynchronous CLR we used here is simpler but less clean. Choose your weapon.",
  },

  phases: {
    work: {
      hint: "Three cascaded JK-with-CLR stages plus a NAND decode gate detecting Q0=1 AND Q2=1. Decode output (via NOT) resets all three stages' CLR pins.",
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { CLK: false },
    },
    break: {
      hint: 'The reset wires from rst_inv to the three stage CLR pins are cut. The counter ignores the decode gate and counts freely to 7.',
      faultNodeId: 'rst_inv',
      nodes: NODES_FULL,
      inputs: { CLK: false },
      wires: [
        ...WIRES_FULL.filter(w => !['r1', 'r2', 'r3'].includes(w.id)),
        { id: 'r1', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage0', pin: 'input', index: 3 }, feedback: true, broken: true },
        { id: 'r2', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage1', pin: 'input', index: 3 }, feedback: true, broken: true },
        { id: 'r3', from: { nodeId: 'rst_inv', pin: 'output' }, to: { nodeId: 'stage2', pin: 'input', index: 3 }, feedback: true, broken: true },
      ],
    },
    try: {
      hint: "Build the mod-5 counter: 3-stage JK-with-CLR cascade, a NAND gate sensing Q0 and Q2, a NOT to invert the reset, and wires from the reset output back to all three stages' CLR pins.",
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { CLK: false },
      wires: [],
    },
  },
}
