/**
 * Unit I · Lesson 02 — OR Gate
 *
 * Narrative context:
 *   Work Order WO-0049 — Deck 7, Bay 6 emergency lighting.
 *   Either of two power feeds can supply the emergency strip.
 *   Fault: Feed A's junction has corroded — the OR gate still holds on Feed B,
 *   but someone yanked the whole wire during the last inspection.
 *   Player rewires: both feeds go into OR gate, OR gate drives the light relay.
 *
 * Engineering framing:
 *   OR gate = redundancy logic. One or both inputs HIGH → output HIGH.
 *   Contrast with AND: OR is "either will do", AND is "both must agree".
 */

const NODES_FULL = [
  { id: 'feedA', type: 'INPUT',  x: 80,  y: 110, scale: 1 },
  { id: 'feedB', type: 'INPUT',  x: 80,  y: 240, scale: 1 },
  { id: 'g1',   type: 'OR',     x: 260, y: 145, scale: 1.3 },
  { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'feedA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'feedB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'g1',   pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-02',
    title:       'OR Gate',
    unit:        1,
    lessonIndex: 1,
    concept:     'OR',
    panels:      [],
    workOrder:   'WO-0049',
    location:    'Deck 7 · Bay 6',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Bay 6 emergency lighting is down. Not critical right now — shift is lit, no active emergencies — but it's a code violation and Reyes is already logged three this quarter.\n\nTwo power feeds run to that bay. Either one is enough to keep the lights on. That's the whole point of redundancy. Except right now, neither of them is reaching the relay.\n\nI pulled the panel. Someone disconnected both feeds at the OR gate during the last inspection and didn't log it. Classic.",
    briefing: 'Bay 6 emergency lighting requires OR gate confirmation from Feed A or Feed B. Either supply line being active is sufficient to authorize the relay.',
    fault:    'INCIDENT REPORT: Both OR gate inputs disconnected at junction J-22 during routine inspection. Relay de-energized. Emergency lighting offline.',
    dispatch: 'Restore both feed lines to the OR gate and connect the gate output to the lighting relay. Either feed HIGH will restore emergency lighting.',
    success:  'Emergency lighting restored. Bay 6 compliant. WO-0049 closed by Alpha Shift.',
    lore:     'The OR gate is the foundation of redundant system design. Where the AND gate demands consensus, the OR gate demands only participation — any active input is sufficient. Most life-safety systems pair both: OR for detection, AND for authorization.',
  },

  phases: {
    work: {
      hint: 'Feed A is HIGH, Feed B is HIGH. Either input active → OR gate outputs HIGH.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { feedA: true, feedB: true },
    },
    break: {
      hint: 'Both feeds disconnected. OR gate has no active inputs — output is LOW. Lights are off.',
      faultNodeId: 'g1',
      nodes: NODES_FULL,
      inputs: { feedA: false, feedB: false },
      wires: [
        { id: 'w1', from: { nodeId: 'feedA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 }, broken: true },
        { id: 'w2', from: { nodeId: 'feedB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'g1',   pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Wire Feed A and Feed B into the OR gate. Wire the OR gate to the relay output. Either feed HIGH will light the bay.',
      nodes: [
        { id: 'feedA', type: 'INPUT',  x: 80,  y: 110, scale: 1,   locked: false },
        { id: 'feedB', type: 'INPUT',  x: 80,  y: 240, scale: 1,   locked: false },
        { id: 'g1',   type: 'OR',     x: 260, y: 145, scale: 1.3, locked: false },
        { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
      ],
      inputs: { feedA: false, feedB: false },
      wires: [],
    },
  },
}