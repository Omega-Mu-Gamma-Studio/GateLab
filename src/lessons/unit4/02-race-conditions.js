/**
 * Unit IV · Lesson 02 — Race Conditions
 *
 * Narrative context:
 *   Work Order WO-0201 — Deck 6, Thruster Firing Sequencer.
 *   The port thruster fires when signal F = AB + A'B' (XNOR: fires when
 *   A and B agree). The circuit uses two AND gates and an OR gate. But
 *   signal A passes through an extra NOT gate on the A'B' path, giving
 *   that path one more gate delay than the AB path.
 *   When A transitions 1→0 while B=1, both paths flip — but A'B' lags
 *   behind AB by one gate delay. For ~10 ns, BOTH outputs are LOW,
 *   producing a glitch spike of 0 on the output. The thruster fires a
 *   false inhibit pulse — a race condition.
 *   Fault: The technician who "repaired" the delay issue added a second
 *   NOT gate on the AB path to balance delays. Now that gate's output
 *   is stuck HIGH — AB path always reads A as HIGH, producing wrong
 *   output for A=0, B=0.
 *
 * Engineering framing:
 *   A race condition occurs when two signal paths competing to reach
 *   the same output have different propagation delays. Whichever signal
 *   arrives first "wins" the race, but during the transition window
 *   the output is wrong. In a static-1 hazard, the output dips to 0
 *   momentarily when it should stay 1. Recognizing race conditions
 *   requires timing diagrams — the glitch is invisible to truth tables.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 120, scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 350, scale: 1 },
  // Path 1: AB
  { id: 'notA1', type: 'NOT',   x: 190, y: 80,  scale: 1.1 },  // delay balancer (was buggy fix)
  { id: 'notA2', type: 'NOT',   x: 300, y: 80,  scale: 1.1 },  // double-NOT restores A
  { id: 'and1',  type: 'AND',   x: 430, y: 120, scale: 1.2 },
  // Path 2: A'B'
  { id: 'notA3', type: 'NOT',   x: 190, y: 290, scale: 1.1 },
  { id: 'notB',  type: 'NOT',   x: 190, y: 400, scale: 1.1 },
  { id: 'and2',  type: 'AND',   x: 430, y: 330, scale: 1.2 },
  // OR output
  { id: 'or1',   type: 'OR',    x: 580, y: 215, scale: 1.2 },
  { id: 'F',     type: 'OUTPUT', x: 730, y: 235, scale: 1 },
]

const WIRES_FULL = [
  // Path 1: A → notA1 → notA2 → and1 input[0], B → and1 input[1]
  { id: 'p1a', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'notA1', pin: 'input', index: 0 } },
  { id: 'p1b', from: { nodeId: 'notA1',pin: 'output' }, to: { nodeId: 'notA2', pin: 'input', index: 0 } },
  { id: 'p1c', from: { nodeId: 'notA2',pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
  { id: 'p1d', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
  // Path 2: A → notA3, B → notB, both → and2
  { id: 'p2a', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'notA3', pin: 'input', index: 0 } },
  { id: 'p2b', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'notB',  pin: 'input', index: 0 } },
  { id: 'p2c', from: { nodeId: 'notA3',pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
  { id: 'p2d', from: { nodeId: 'notB', pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
  // OR
  { id: 'r1',  from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
  { id: 'r2',  from: { nodeId: 'and2', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
  { id: 'r3',  from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'F',     pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-02',
    title:       'Race Conditions',
    unit:        4,
    lessonIndex: 1,
    concept:     'RACE_CONDITION',
    panels:      ['timing'],
    workOrder:   'WO-0201',
    location:    'Deck 6 · Thruster Firing Sequencer',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Port thruster sequencer is misfiring. F should be HIGH whenever A and B agree — it's an XNOR: AB + A'B'. But someone tried to balance the path delays by adding a NOT gate on the AB path. They used two NOTs to preserve the logic — a double inversion, which should cancel out. Problem is the first of those NOTs has its output stuck HIGH, making the AB path permanently read A as HIGH.\n\nWatch the timing diagram: when A=0 and B=0, the circuit should fire (A'B' term is 1). Instead F reads 0 because the AB path is feeding a phantom A=1 into and1. The two NOT gates were a hack — remove one of them. A single wire from A into and1 is correct and eliminates the extra delay that caused the original race condition to begin with.\n\nA race condition is what happens when two paths to the same gate have unequal delay. The faster path wins. For a window equal to the delay difference, the output is wrong. Now fix the stuck gate.",
    briefing: 'XNOR thruster sequencer. Delay-balancing double-NOT on AB path — first NOT stuck HIGH. AB path reads A as permanently 1. F wrong for A=0 cases.',
    fault:    'INCIDENT REPORT: Node notA1 output stuck HIGH. AND1 input[0] sees constant 1 regardless of A. F incorrect for A=0, B=0 (should be 1, reads 0) and A=0, B=1 (should be 0, reads 1). Thruster sequencer producing false enable pulses.',
    dispatch: 'Remove notA1 from the AB path. Wire A directly to and1 input[0], bypassing both inverters. Single NOT on A\'B\' path (notA3) is correct. Verify: F = AB + A\'B\'. Truth table: 00→1, 01→0, 10→0, 11→1.',
    success:  'Double-NOT chain removed. A wired directly to and1. XNOR function restored. Thruster sequencer nominal. Race condition on A transition still present — that\'s the next work order. WO-0201 closed by Beta Shift.',
    lore:     "Race conditions in combinational logic look invisible on a truth table — the output is logically correct for all stable input states. The glitch only appears during a transition, for a window measured in nanoseconds. Before oscilloscopes with 1 GHz bandwidth became routine, these glitches were blamed on noise or component failure. Today we know better: different path lengths always produce different arrival times. The cure isn't to add inverters to 'slow down' the fast path — it's to add a consensus term that covers the transition, or to use synchronous design where a clock edge absorbs the glitch. We'll get there.",
  },

  phases: {
    work: {
      hint: 'F = AB + A\'B\'. Two AND gates feed an OR. The AB path has a double-NOT (cancels to A) for delay matching. A\'B\' path has single NOT on each input.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: true },
    },
    break: {
      hint: 'notA1 output is stuck HIGH. and1 always sees A=1 on input[0]. F is wrong whenever A is actually 0.',
      faultNodeId: 'notA1',
      nodes: NODES_FULL,
      inputs: { A: false, B: false },
      wires: WIRES_FULL.map(w => w.id === 'p1a' ? { ...w, broken: true } : w),
    },
    try: {
      hint: 'Wire A directly to and1 input[0] — skip both NOTs. B to and1 input[1]. A to notA3, B to notB, both to and2. and1 + and2 into or1 into F.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { A: true, B: true },
      wires: [],
    },
  },
}