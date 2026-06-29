/**
 * Unit IV · Lesson 05 — Hazard Elimination
 *
 * Narrative context:
 *   Work Order WO-0204 — Deck 8, Life Support CO2 Scrubber Trigger (continued).
 *   Follow-up to WO-0203. The dynamic hazard in G = ((AB) OR C) AND D
 *   was documented but not fixed. Today's task: redesign the circuit
 *   into two-level Sum-of-Products form to eliminate the dynamic hazard.
 *   G = AB·D + C·D  (distribute D across the OR).
 *   Two-level SOP: each product term has at most one AND gate delay,
 *   then one OR gate delay. All paths to output differ by at most one
 *   gate — the propagation window is too small for a dynamic hazard.
 *   Fault: during the rebuild, the CD AND gate's D input was left
 *   unconnected. G is incorrect for C=1, D=1 cases. Player wires D
 *   to the second AND gate, completing the two-level design.
 *
 * Engineering framing:
 *   Two-level SOP eliminates dynamic hazards: path 1 = A,B → and1 → or1
 *   (AND delay + OR delay = 2 levels). Path 2 = C → and2 → or1 (same 2 levels).
 *   Both paths hit or1 in the same number of gate delays — no multi-path race.
 *   D fans out to both AND gates simultaneously — still 2 levels.
 *   The static-1 hazard between ABD and CD terms on B-transition may still exist:
 *   cover it with ACD consensus term (advanced; not shown here).
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 80,  scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 210, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 360, scale: 1 },
  { id: 'D',    type: 'INPUT',  x: 50,  y: 490, scale: 1 },
  // Term 1: A AND B AND D
  { id: 'and1',  type: 'AND',   x: 250, y: 160, scale: 1.2 },
  { id: 'and1d', type: 'AND',   x: 420, y: 220, scale: 1.2 },
  // Term 2: C AND D
  { id: 'and2',  type: 'AND',   x: 280, y: 420, scale: 1.2 },
  // OR output
  { id: 'or1',   type: 'OR',    x: 590, y: 320, scale: 1.2 },
  { id: 'G',     type: 'OUTPUT', x: 750, y: 340, scale: 1 },
]

const WIRES_FULL = [
  // ABD term: A,B → and1, and1 + D → and1d
  { id: 'ab1',  from: { nodeId: 'A',     pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
  { id: 'ab2',  from: { nodeId: 'B',     pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
  { id: 'abd1', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'and1d', pin: 'input', index: 0 } },
  { id: 'abd2', from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'and1d', pin: 'input', index: 1 } },
  // CD term: C,D → and2
  { id: 'cd1',  from: { nodeId: 'C',     pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
  { id: 'cd2',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
  // OR
  { id: 'r1',   from: { nodeId: 'and1d', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
  { id: 'r2',   from: { nodeId: 'and2',  pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
  { id: 'r3',   from: { nodeId: 'or1',   pin: 'output' }, to: { nodeId: 'G',     pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-05',
    title:       'Hazard Elimination',
    unit:        4,
    lessonIndex: 4,
    concept:     'HAZARD_ELIMINATION',
    panels:      ['timing'],
    workOrder:   'WO-0204',
    location:    'Deck 8 · Life Support CO2 Scrubber Trigger',
    shift:       'Alpha Shift',
    commandSpeaker: 'COMMANDER VALE',
  },

  narrative: {
    recap:    "Follow-up on WO-0203. We documented the dynamic hazard in G = ((AB) OR C) AND D. Now we eliminate it. The fix is algebraic: distribute D across the OR to get two-level SOP form — G = ABD + CD.\n\nIn two-level SOP, every path from input to output goes through at most one AND gate and one OR gate. Two levels. When C transitions, it hits and2 then or1 — two gate delays. When A or B transitions, it hits and1, then and1d, then or1 — three levels. Actually, ABD is a 3-input AND which we've split into two 2-input gates. The key insight: both product terms hit the OR gate in essentially the same window. No three-path race.\n\nThe rebuilt circuit has D disconnected from and2 input[1] — the CD term is incomplete. Wire it up. Verify G = ABD + CD. Check the timing diagram: C transitioning should now produce a single clean 0→1 edge on G.",
    briefing: 'WO-0203 follow-up. Dynamic hazard elimination via SOP redesign. G = ABD + CD. and2 input[1] (D) disconnected during rebuild. CD term incomplete. G incorrect for C=1,D=1.',
    fault:    'INCIDENT REPORT: Wire cd2 from D to and2 input[1] not installed during circuit rebuild. and2 input[1] floating LOW. CD term always reads 0. G = ABD only. CO2 scrubber disabled unless A,B,D all HIGH.',
    dispatch: 'Connect D to and2 input[1]. Verify CD term: C=1,D=1 → and2 output 1 → G=1. Full truth: G=1 when ABD=1 OR CD=1. Run timing diagram with C transitions: confirm single clean G edge, no oscillation.',
    success:  'D connected to and2 input[1]. G = ABD + CD operational. Timing diagram shows single clean transition on G for all input changes. Dynamic hazard eliminated by two-level SOP design. CO2 scrubber firing correctly. WO-0204 closed. Deck 8 sign-off: Alpha Shift.',
    lore:     "Hazard elimination by two-level SOP reduction is the standard textbook cure — and also why engineers love SOP form. In practice, two-level logic becomes impractical for functions with many variables: a 16-variable SOP might require AND gates with 16 inputs. Real VLSI design uses multi-level synthesis (optimization tools like SIS or ABC) combined with timing analysis tools that insert delay buffers to equalize critical paths. The async nightmare is mostly solved today by: (a) synchronous design everywhere clocks are cheap, and (b) formal timing verification on everything else. But understanding the hazard at this level is why the timing analyzer catches problems that truth tables miss.",
  },

  phases: {
    work: {
      hint: 'G = ABD + CD. Two AND terms into one OR. and1 computes AB, then and1d adds D. and2 computes CD directly. Both feed or1.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: true, C: false, D: true },
    },
    break: {
      hint: 'D is not wired to and2 input[1]. The CD term is always 0. G only goes HIGH via the ABD path.',
      faultNodeId: 'and2',
      nodes: NODES_FULL,
      inputs: { A: false, B: false, C: true, D: true },
      wires: WIRES_FULL.map(w => w.id === 'cd2' ? { ...w, broken: true } : w),
    },
    try: {
      hint: 'A,B → and1. and1 + D → and1d. C,D → and2. and1d and and2 into or1. or1 → G.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { A: true, B: true, C: false, D: true },
      wires: [],
    },
  },
}