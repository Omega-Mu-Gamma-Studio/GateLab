/**
 * Unit I · Lesson 03 — NOT Gate (Inverter)
 *
 * Narrative context:
 *   Work Order WO-0051 — Deck 7, Airlock 3 pressure interlock.
 *   The interlock logic reads "NO FAULT DETECTED" as LOW → NOT gate flips to HIGH → door stays unlocked.
 *   Fault: the NOT gate's output wire pulled loose. Door is stuck locked even with no fault present.
 *   Player wires: fault sensor → NOT gate → lock relay.
 *   Concept: absence of a fault signal is what keeps the door open. Passive-safe design.
 *
 * Engineering framing:
 *   NOT = inverter. Output is always opposite of input.
 *   "Fail-safe" logic: default LOW (no fault) → NOT outputs HIGH → system operates.
 *   If sensor goes HIGH (fault detected) → NOT outputs LOW → system locks.
 *   Also: if sensor DIES (stuck LOW) → still locks. Fails toward safety.
 */

const NODES_FULL = [
  { id: 'fault', type: 'INPUT',  x: 80,  y: 185, scale: 1 },
  { id: 'g1',   type: 'NOT',    x: 250, y: 160, scale: 1.3 },
  { id: 'out',  type: 'OUTPUT', x: 480, y: 195, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'fault', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'g1',   pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-03',
    title:       'NOT Gate',
    unit:        1,
    lessonIndex: 2,
    concept:     'NOT',
    panels:      [],
    workOrder:   'WO-0051',
    location:    'Deck 7 · Airlock 3',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Airlock 3 is reporting a fault-lock it shouldn't have. Pressure reads nominal, atmosphere reads nominal — diagnostics show no active faults. But the interlock is holding the door closed anyway.\n\nThe way this lock works: the fault sensor reads LOW when everything's fine. That LOW goes through a NOT gate, flips to HIGH, and HIGH keeps the door unlocked. It's backward on purpose. If the sensor fails, the door locks — not opens.\n\nSomebody pulled the NOT gate's output wire when they were rerouting cable bundles last shift. Door logic never got the HIGH it needed. Airlock's been stuck for six hours.",
    briefing: 'Airlock 3 interlock uses passive-safe NOT gate logic. Fault sensor LOW → NOT outputs HIGH → door authorized. No active fault detected — interlock should be cleared.',
    fault:    'INCIDENT REPORT: NOT gate output wire disconnected at junction J-31 during cable re-routing. Lock relay receiving no signal. Airlock held closed on no-fault condition.',
    dispatch: 'Wire the fault sensor into the NOT gate. Wire the NOT gate output to the lock relay. With no fault present, the inverter will authorize the door.',
    success:  'Airlock 3 interlock cleared. Door authorized. WO-0051 closed by Alpha Shift.',
    lore:     'The NOT gate is the ship\'s most common single-input device — and the least appreciated. Passive-safe design uses inversion deliberately: the normal operating state produces a LOW signal, which the NOT gate flips to HIGH. Any failure, including complete sensor death, drives the output LOW and locks the system down. You cannot make a system safer than one that defaults to locked.',
  },

  phases: {
    work: {
      hint: 'Fault sensor is LOW — no fault. NOT gate flips it to HIGH. Airlock is cleared.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { fault: false },
    },
    break: {
      hint: 'NOT gate output wire is missing. Lock relay receives nothing — airlock stays closed even without a fault.',
      faultNodeId: 'g1',
      nodes: NODES_FULL,
      inputs: { fault: false },
      wires: [
        { id: 'w1', from: { nodeId: 'fault', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'g1',   pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 }, broken: true },
      ],
    },
    try: {
      hint: 'One input, one gate, one output. Wire the fault sensor → NOT gate → relay. The inversion does the rest.',
      nodes: [
        { id: 'fault', type: 'INPUT',  x: 80,  y: 185, scale: 1,   locked: false },
        { id: 'g1',   type: 'NOT',    x: 250, y: 160, scale: 1.3, locked: false },
        { id: 'out',  type: 'OUTPUT', x: 480, y: 195, scale: 1 },
      ],
      inputs: { fault: false },
      wires: [],
    },
  },
}