/**
 * Unit IV · Lesson 03 — Static Hazards
 *
 * Narrative context:
 *   Work Order WO-0202 — Deck 1, Reactor Coolant Flow Controller.
 *   The reactor coolant pump enable signal is driven by:
 *   F = AB + BC (enable pump when both sensors A&B agree, OR B&C agree).
 *   A static-1 hazard exists on the AB + BC circuit: when A=1, B=1, C=1
 *   and A transitions 1→0, the output should stay 1 (BC still TRUE).
 *   But the AB path drops before BC's NOT-A delay settles —
 *   a ~10 ns glitch to 0 disrupts the pump relay. This is a static-1 hazard.
 *   Fix: add a consensus term BC (already in circuit). The REAL fault here:
 *   the consensus AND gate's wire to the OR gate was disconnected during
 *   last week's panel swap, removing the hazard cover term.
 *   The player must reconnect the consensus term wire.
 *
 * Engineering framing:
 *   Static-1 hazard: output should stay 1 but briefly glitches to 0.
 *   Detected via K-Map: if two 1-cells adjacent on the K-Map are covered
 *   by separate prime implicants (no shared term), the transition between
 *   them can glitch. Fix: add a consensus/redundant term that covers both
 *   cells — the "hazard cover" term. For F = AB + BC, the hazard cover
 *   is the term AC (the third prime implicant of the K-Map). Adding AC
 *   means during A=1→0 with B=1, C=1, AC's output ensures the OR output
 *   never drops. The extra gate has no effect on steady-state truth table.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 90,  scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 250, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 420, scale: 1 },
  // AB term
  { id: 'andAB', type: 'AND',   x: 250, y: 130, scale: 1.2 },
  // BC term
  { id: 'andBC', type: 'AND',   x: 250, y: 320, scale: 1.2 },
  // AC consensus / hazard cover term
  { id: 'andAC', type: 'AND',   x: 250, y: 510, scale: 1.2 },
  // 3-input OR
  { id: 'or1',   type: 'OR',    x: 460, y: 290, scale: 1.2 },
  { id: 'F',     type: 'OUTPUT', x: 620, y: 310, scale: 1 },
]

const WIRES_FULL = [
  { id: 'ab1', from: { nodeId: 'A',     pin: 'output' }, to: { nodeId: 'andAB', pin: 'input', index: 0 } },
  { id: 'ab2', from: { nodeId: 'B',     pin: 'output' }, to: { nodeId: 'andAB', pin: 'input', index: 1 } },
  { id: 'bc1', from: { nodeId: 'B',     pin: 'output' }, to: { nodeId: 'andBC', pin: 'input', index: 0 } },
  { id: 'bc2', from: { nodeId: 'C',     pin: 'output' }, to: { nodeId: 'andBC', pin: 'input', index: 1 } },
  { id: 'ac1', from: { nodeId: 'A',     pin: 'output' }, to: { nodeId: 'andAC', pin: 'input', index: 0 } },
  { id: 'ac2', from: { nodeId: 'C',     pin: 'output' }, to: { nodeId: 'andAC', pin: 'input', index: 1 } },
  { id: 'r1',  from: { nodeId: 'andAB', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
  { id: 'r2',  from: { nodeId: 'andBC', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
  { id: 'r3',  from: { nodeId: 'andAC', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 2 } },
  { id: 'r4',  from: { nodeId: 'or1',   pin: 'output' }, to: { nodeId: 'F',     pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-03',
    title:       'Static-1 Hazard',
    unit:        4,
    lessonIndex: 2,
    concept:     'STATIC_HAZARD',
    panels:      ['timing'],
    workOrder:   'WO-0202',
    location:    'Deck 1 · Reactor Coolant Flow Controller',
    shift:       'Alpha Shift',
    commandSpeaker: 'COMMANDER VALE',
  },

  narrative: {
    recap:    "Reactor coolant pump is intermittently dropping off for a microsecond during sensor transitions. The pump enable circuit is F = AB + BC. On the K-Map, the AB and BC prime implicants overlap at B=1 — but during the A=1→0 transition with B=C=1, the AB term drops before the BC path settles. We get a glitch to 0. That's a static-1 hazard.\n\nThe fix is a consensus (hazard cover) term: AC. AC = AND(A,C). Adding AC to the OR ensures that during any transition where A and C are both 1 — exactly the conditions that cause the hazard — the output has a standing 1 to bridge the gap. It adds no new logic to the steady-state truth table. Pure glitch suppression.\n\nThe AC AND gate was installed by a previous tech. The wire from andAC to the OR input was disconnected during last week's panel swap. Reconnect it.",
    briefing: 'Reactor coolant pump enable glitching during A transitions. Static-1 hazard on F=AB+BC. Consensus term andAC disconnected from OR gate. Hazard cover missing.',
    fault:    'INCIDENT REPORT: Wire r3 from andAC output to or1 input[2] disconnected at connector J-12. Consensus term AC not reaching OR gate. Static-1 hazard active on A=1→0 transition with B=C=1. Pump relay sees false disable pulse.',
    dispatch: 'Reconnect andAC output to or1 input[2]. Verify F = AB + BC + AC. With A=1,B=1,C=1 and A toggled: F must hold HIGH throughout the transition. Check timing diagram — no dip on F output.',
    success:  'Consensus term reconnected. andAC output driving or1 input[2]. Static-1 hazard eliminated. Coolant pump enable signal stable across all input transitions. Reactor thermal margins nominal. WO-0202 closed by Alpha Shift.',
    lore:     "Static hazards were first formally described by Edward McCluskey in 1956, building on Huffman's earlier work on asynchronous sequential circuits. The K-Map method for hazard detection is elegant: a static-1 hazard exists wherever two adjacent 1-cells on the K-Map are covered by different prime implicants with no shared grouping. The cure — add an extra prime implicant (the consensus term) to cover that transition — was also the solution to what we now call the consensus theorem in Boolean algebra. The math and the hardware are the same problem viewed from different angles.",
  },

  phases: {
    work: {
      hint: 'F = AB + BC + AC. Three AND gates, one 3-input OR. AC is the consensus/hazard-cover term — it prevents the static-1 glitch on B=C=1 transitions.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: true, C: true },
    },
    break: {
      hint: 'The andAC output wire to the OR gate is missing. Without it, F = AB + BC only, and the static-1 hazard is active on A transitions.',
      faultNodeId: 'andAC',
      nodes: NODES_FULL,
      inputs: { A: true, B: true, C: true },
      wires: WIRES_FULL.map(w => w.id === 'r3' ? { ...w, broken: true } : w),
    },
    try: {
      hint: 'Wire A,B → andAB. Wire B,C → andBC. Wire A,C → andAC. All three AND outputs → or1 (3 inputs). or1 → F.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { A: true, B: true, C: true },
      wires: [],
    },
  },
}