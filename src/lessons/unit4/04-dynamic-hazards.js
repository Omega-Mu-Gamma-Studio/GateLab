/**
 * Unit IV · Lesson 04 — Dynamic Hazards
 *
 * Narrative context:
 *   Work Order WO-0203 — Deck 8, Life Support CO2 Scrubber Trigger.
 *   The CO2 scrubber fires on a rising edge of signal G. G is derived
 *   from a multi-level logic circuit: G = ((A AND B) OR C) AND D.
 *   A dynamic hazard occurs because the signal travels three different
 *   path lengths to reach the final AND gate (and3). When C transitions
 *   0→1, the output should make one clean 0→1 transition. Instead it
 *   oscillates — briefly going 0→1→0→1 — because C reaches and3
 *   directly (1 gate), via OR (2 gates), and via AND+OR (3 gates) with
 *   different arrival times. Each path takes over from the next, causing
 *   multiple output transitions.
 *   Fault: A buffer on the direct C path was meant to time-equalize the
 *   direct route. That buffer's output is stuck LOW — the direct C path
 *   is being suppressed, which distorts the hazard pattern.
 *   Player restores the buffer wire to re-expose (and diagnose) the
 *   correct multi-path structure. In lesson 05 they'll eliminate it.
 *
 * Engineering framing:
 *   Dynamic hazard: output makes 3+ transitions when it should make 1.
 *   Caused by signal reaching a multi-level circuit via three or more
 *   paths with 3 different delays. Cannot be fixed by adding redundant
 *   terms (unlike static hazards) — the fix is either two-level logic
 *   reduction or synchronous design. Always detected by timing diagrams.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 90,  scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 230, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 380, scale: 1 },
  { id: 'D',    type: 'INPUT',  x: 50,  y: 520, scale: 1 },
  // Level 1: AB
  { id: 'and1',  type: 'AND',   x: 220, y: 130, scale: 1.2 },
  // Level 2: (AB) OR C  — C takes short path here
  { id: 'or1',   type: 'OR',    x: 390, y: 240, scale: 1.2 },
  // Buffer on C's direct-to-or path (for path equalization — was the "fix attempt")
  { id: 'bufC',  type: 'NOT',   x: 220, y: 440, scale: 1 },  // actually double-NOT via next
  { id: 'notC2', type: 'NOT',   x: 320, y: 440, scale: 1 },
  // Level 3: ((AB) OR C) AND D
  { id: 'and2',  type: 'AND',   x: 560, y: 360, scale: 1.2 },
  { id: 'G',     type: 'OUTPUT', x: 720, y: 380, scale: 1 },
]

const WIRES_FULL = [
  // AB path
  { id: 'ab1', from: { nodeId: 'A',     pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
  { id: 'ab2', from: { nodeId: 'B',     pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
  { id: 'ab3', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 0 } },
  // C path through double-NOT buffer (net transparent)
  { id: 'cb1', from: { nodeId: 'C',     pin: 'output' }, to: { nodeId: 'bufC',  pin: 'input', index: 0 } },
  { id: 'cb2', from: { nodeId: 'bufC',  pin: 'output' }, to: { nodeId: 'notC2', pin: 'input', index: 0 } },
  { id: 'cb3', from: { nodeId: 'notC2', pin: 'output' }, to: { nodeId: 'or1',   pin: 'input', index: 1 } },
  // D path + final AND
  { id: 'or2', from: { nodeId: 'or1',   pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
  { id: 'd1',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
  { id: 'g1',  from: { nodeId: 'and2',  pin: 'output' }, to: { nodeId: 'G',     pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-04',
    title:       'Dynamic Hazards',
    unit:        4,
    lessonIndex: 3,
    concept:     'DYNAMIC_HAZARD',
    panels:      ['timing'],
    workOrder:   'WO-0203',
    location:    'Deck 8 · Life Support CO2 Scrubber Trigger',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "CO2 scrubber is cycling on and off three times when C goes high. It should only fire once. That's a dynamic hazard — G oscillates 0→1→0→1 on a transition that should be a single 0→1 edge.\n\nThe scrubber's enable logic is G = ((A AND B) OR C) AND D. C reaches the final AND through three paths: direct through the double-NOT buffer to OR (2 gate delays), from OR output (3 delays), and through AND+OR (4 delays). Three arrival times. Three transitions.\n\nSomeone tried to fix it by equalizing paths using a double-NOT buffer on the C line. But the first NOT (bufC) has its output stuck LOW, killing the C path entirely. Without C, the circuit computes (AB AND D) — wrong logic AND the hazard is hidden. Fix the broken NOT gate wire, re-expose the real circuit, and read the timing diagram. Next lesson covers the elimination.\n\nRestore the wire from C to bufC input.",
    briefing: 'Dynamic hazard on G: CO2 scrubber triggering 3× on C rising edge. bufC (NOT gate) output stuck LOW — C path suppressed. Circuit running incorrect reduced logic. Restore C path to expose full multi-level circuit.',
    fault:    'INCIDENT REPORT: Wire cb1 from C to bufC input disconnected at J-99. bufC input floating LOW. bufC output HIGH, notC2 output LOW. C signal not reaching OR gate. G = (AB AND D) — missing C path. Dynamic hazard present but masked.',
    dispatch: 'Reconnect C to bufC input[0]. Verify C propagates through double-NOT to or1 input[1]. With A=1,B=1,D=1, toggle C 0→1: observe timing diagram for triple-transition glitch on G.',
    success:  'C path restored. bufC input reconnected. Full circuit G = ((AB) OR C) AND D active. Dynamic hazard visible in timing diagram on C transitions. Scrubber cycling confirmed triple-firing. Dynamic hazard documented for follow-up repair. WO-0203 closed.',
    lore:     "Dynamic hazards are the ghost in the machine that makes async multi-level logic terrifying to debug. A static hazard produces one brief wrong-direction glitch. A dynamic hazard produces three or more output transitions on a single input change. The only guaranteed cures are: reduce to two-level logic (SOP/POS form — one AND layer, one OR layer) where all paths have at most two gate delays; or abandon combinational async design and use a clocked flip-flop to register G. Every synchronous CPU you've ever used is partly a monument to engineers who got tired of dynamic hazards in the 1970s.",
  },

  phases: {
    work: {
      hint: 'G = ((AB) OR C) AND D. C feeds through double-NOT buffer then into OR. The double-NOT is net-transparent but adds two gate delays — that\'s how the multi-path dynamic hazard forms.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: true, C: false, D: true },
    },
    break: {
      hint: 'bufC input wire is cut. C is not reaching the OR gate. G is computing (AB) AND D only — wrong.',
      faultNodeId: 'bufC',
      nodes: NODES_FULL,
      inputs: { A: true, B: true, C: false, D: true },
      wires: WIRES_FULL.map(w => w.id === 'cb1' ? { ...w, broken: true } : w),
    },
    try: {
      hint: 'A,B → and1. C → bufC → notC2 → or1 input[1]. and1 → or1 input[0]. or1 + D → and2. and2 → G.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { A: true, B: true, C: false, D: true },
      wires: [],
    },
  },
}