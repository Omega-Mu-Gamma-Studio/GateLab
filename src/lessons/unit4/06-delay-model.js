/**
 * Unit IV · Lesson 06 — Gate Delay Model & Propagation Analysis
 *
 * Narrative context:
 *   Work Order WO-0205 — Deck 4, Docking Clamp Interlock System.
 *   The docking clamp release is guarded by a critical path checker:
 *   the release signal SAFE must settle within 30 ns of any input
 *   change, or the interlock trips. SAFE = (A XNOR B) AND (C OR D).
 *   The circuit uses: XOR + NOT (for XNOR), then AND with OR output.
 *   Critical path: longest delay chain = A → xor1 → notX → and1 → SAFE
 *   = 3 gate delays. At 10 ns/gate: 30 ns — just within spec.
 *   Fault: A second NOT gate (not2) was inserted after notX as a "signal
 *   booster" by a previous technician. This adds a 4th gate delay (40 ns),
 *   causing interlock trips on valid release commands. Docking is locked.
 *   Player removes the extra NOT by rewiring notX output directly to and1.
 *
 * Engineering framing:
 *   Gate delay model: each logic gate introduces a propagation delay tpd.
 *   The critical path is the longest combinational path from any input to
 *   any output. It determines the maximum operating speed and the minimum
 *   input-to-output settling time.
 *   Typical gate delays: NOT/BUF ≈ 1–2 tpd, AND/OR/NAND/NOR ≈ 2–3 tpd,
 *   XOR/XNOR ≈ 3–4 tpd (implemented as multiple NANDs).
 *   For hazard-free async circuits, the settling time must be less than
 *   the minimum input hold time of any downstream latch or register.
 *   Adding gates always increases delay — "signal boosters" don't exist
 *   in digital logic. Buffer trees are used for fan-out, not gain.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 100, scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 250, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 420, scale: 1 },
  { id: 'D',    type: 'INPUT',  x: 50,  y: 550, scale: 1 },
  // XNOR = XOR + NOT
  { id: 'xor1', type: 'XOR',    x: 220, y: 155, scale: 1.2 },
  { id: 'notX', type: 'NOT',    x: 390, y: 175, scale: 1 },
  // C OR D
  { id: 'or1',  type: 'OR',     x: 220, y: 470, scale: 1.2 },
  // Final AND
  { id: 'and1', type: 'AND',    x: 560, y: 310, scale: 1.2 },
  { id: 'SAFE', type: 'OUTPUT', x: 720, y: 330, scale: 1 },
]

const WIRES_FULL = [
  // XNOR path
  { id: 'x1',   from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 0 } },
  { id: 'x2',   from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'xor1', pin: 'input', index: 1 } },
  { id: 'x3',   from: { nodeId: 'xor1', pin: 'output' }, to: { nodeId: 'notX', pin: 'input', index: 0 } },
  { id: 'x4',   from: { nodeId: 'notX', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  // OR path
  { id: 'o1',   from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 0 } },
  { id: 'o2',   from: { nodeId: 'D',    pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 1 } },
  { id: 'o3',   from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  // Output
  { id: 'f1',   from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'SAFE', pin: 'input', index: 0 } },
]

// Broken: extra NOT gate (not2) inserted after notX, creating 4-gate critical path
const NODES_BROKEN = [
  ...NODES_FULL,
  { id: 'not2', type: 'NOT', x: 480, y: 175, scale: 1 },
]

const WIRES_BROKEN = [
  ...WIRES_FULL.filter(w => !['x4'].includes(w.id)),
  { id: 'x4',  from: { nodeId: 'notX', pin: 'output' }, to: { nodeId: 'not2', pin: 'input', index: 0 } },
  { id: 'x4b', from: { nodeId: 'not2', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-06',
    title:       'Gate Delay Model',
    unit:        4,
    lessonIndex: 5,
    concept:     'DELAY_MODEL',
    panels:      ['timing'],
    workOrder:   'WO-0205',
    location:    'Deck 4 · Docking Clamp Interlock System',
    shift:       'Beta Shift',
    commandSpeaker: 'COMMANDER VALE',
  },

  narrative: {
    recap:    "Docking clamp is tripping the interlock on every release attempt. Ship is stuck — we can't undock. The release signal SAFE = (A XNOR B) AND (C OR D) must settle in under 30 ns. At 10 ns per gate, the critical path through XOR → NOT → AND is 30 ns — exactly on spec.\n\nSomeone inserted a second NOT gate (not2) after notX, claiming it was a 'signal booster.' Digital logic doesn't work that way. Gates don't boost signals — they invert, gate, and delay them. The extra NOT re-inverts the XNOR back to XOR, producing WRONG LOGIC, and adds 10 ns. Critical path is now 40 ns. Every release attempt times out.\n\nRemove the not2 gate from the circuit. Reconnect notX output directly to and1 input[0]. Verify SAFE = (A XNOR B) AND (C OR D): goes HIGH when A=B and at least one of C or D is HIGH. Check timing: critical path back to 3 gates.",
    briefing: 'Docking interlock tripping. Extra NOT gate (not2) inserted between notX and and1. Critical path extended from 3 to 4 gates — exceeds 30 ns settle spec. Logic also inverted to XOR instead of XNOR.',
    fault:    'INCIDENT REPORT: NOT gate not2 illegally inserted between notX output and and1 input[0] at junction P-07. Critical path now 4 gates (40 ns). SAFE logic wrong: XNOR path becomes XOR due to double-inversion reversal. Interlock timing fault + logic fault. Release impossible.',
    dispatch: 'Remove not2 from path. Wire notX output directly to and1 input[0]. Verify SAFE=1 when A=B=1, C=1 (or D=1). Verify SAFE=1 when A=B=0, C=1. Verify SAFE=0 when A≠B. Check timing diagram: SAFE settles in 3 gate delays from any input change.',
    success:  'Extra NOT gate removed. notX wired directly to and1. SAFE = (A XNOR B) AND (C OR D) restored. Critical path 3 gates = 30 ns. Interlock timing spec met. Docking clamp release functional. WO-0205 closed by Beta Shift. Unit IV complete — async circuits, race conditions, hazards, and delay models signed off.',
    lore:     "In the early days of TTL logic (1960s–70s), a common misconception was that adding a buffer or extra inverter pair could 'strengthen' a signal. While line drivers and buffers do exist for fan-out (driving many loads at once), they still add propagation delay and can never speed up combinational timing. Every gate in a digital circuit is a liability in the critical path. Modern synthesis tools perform 'gate sizing' — choosing larger (faster but more power-hungry) transistors on critical-path gates while shrinking off-path gates. They also perform 'logic restructuring' to shorten paths. The 'delay budget' — dividing the clock period among all pipeline stages — is the core constraint that drives every microprocessor architecture decision ever made.",
  },

  phases: {
    work: {
      hint: 'SAFE = (A XNOR B) AND (C OR D). XNOR = XOR + NOT. Critical path: A → xor1 → notX → and1 → SAFE = 3 gate delays.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: true, C: true, D: false },
    },
    break: {
      hint: 'An extra NOT gate (not2) is inserted between notX and and1. This re-inverts XNOR back to XOR AND adds a 4th gate delay. SAFE logic is wrong and too slow.',
      faultNodeId: 'not2',
      nodes: NODES_BROKEN,
      inputs: { A: true, B: true, C: true, D: false },
      wires: WIRES_BROKEN,
    },
    try: {
      hint: 'A,B → xor1 → notX → and1 input[0]. C,D → or1 → and1 input[1]. and1 → SAFE. Three gate delays on critical path.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { A: true, B: true, C: true, D: false },
      wires: [],
    },
  },
}