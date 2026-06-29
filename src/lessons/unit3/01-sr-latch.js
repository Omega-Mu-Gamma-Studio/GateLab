/**
 * Unit III · Lesson 01 — SR Latch
 *
 * Narrative context:
 *   Work Order WO-0101 — Deck 9, Airlock Pressure Memory Panel.
 *   The airlock system uses an SR latch to "remember" whether cabin pressure
 *   was last set or cleared — critical for safe cycling. The latch is built
 *   from two cross-coupled NOR gates. Someone pulled a feedback wire during
 *   a panel inspection and the latch lost its memory state entirely.
 *   Player restores the feedback path, restoring persistent state.
 *
 * Engineering framing:
 *   SR Latch = simplest memory element. Two NOR gates cross-coupled.
 *   S (Set) = 1 → Q = 1. R (Reset) = 1 → Q = 0.
 *   S = 0, R = 0 → Q holds its last value. That's the memory.
 *   S = 1, R = 1 → forbidden state (both outputs try to be 0).
 *   First sequential circuit — output depends on HISTORY, not just current inputs.
 */

// SR Latch: two cross-coupled NOR gates
// NOR1: inputs = S, Q_bar  → output = Q
// NOR2: inputs = R, Q      → output = Q_bar
const NODES_FULL = [
  { id: 'S',     type: 'INPUT',  x: 60,  y: 100, scale: 1 },
  { id: 'R',     type: 'INPUT',  x: 60,  y: 320, scale: 1 },
  { id: 'nor1',  type: 'NOR',    x: 230, y: 120, scale: 1.2 },
  { id: 'nor2',  type: 'NOR',    x: 230, y: 300, scale: 1.2 },
  { id: 'Q',     type: 'OUTPUT', x: 480, y: 155, scale: 1 },
  { id: 'Qbar',  type: 'OUTPUT', x: 480, y: 330, scale: 1 },
]

const WIRES_FULL = [
  // S → NOR1 input 0
  { id: 'w1', from: { nodeId: 'S',    pin: 'output' }, to: { nodeId: 'nor1', pin: 'input', index: 0 } },
  // NOR2 output (Q_bar) → NOR1 input 1  [feedback]
  { id: 'w2', from: { nodeId: 'nor2', pin: 'output' }, to: { nodeId: 'nor1', pin: 'input', index: 1 } },
  // NOR1 output (Q) → output node
  { id: 'w3', from: { nodeId: 'nor1', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  // R → NOR2 input 0
  { id: 'w4', from: { nodeId: 'R',    pin: 'output' }, to: { nodeId: 'nor2', pin: 'input', index: 0 } },
  // NOR1 output (Q) → NOR2 input 1  [feedback]
  { id: 'w5', from: { nodeId: 'nor1', pin: 'output' }, to: { nodeId: 'nor2', pin: 'input', index: 1 } },
  // NOR2 output (Q_bar) → output node
  { id: 'w6', from: { nodeId: 'nor2', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit3-01',
    title:       'SR Latch',
    unit:        3,
    lessonIndex: 0,
    concept:     'SR_LATCH',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0101',
    location:    'Deck 9 · Airlock Control Bay',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Deck 9 airlock panel lost pressure state memory about six hours ago. Nobody noticed until third shift tried to cycle the airlock and the system had no idea what the last confirmed pressure reading was.\n\nThe memory here is a latch — two NOR gates wired back into each other. It's elegant and fragile. If one of those feedback paths breaks, the latch forgets. It doesn't fail noisily. It just goes blank.\n\nI found the open wire. Someone pulled NOR2's feedback line during the last inspection and didn't log it. Classic.",
    briefing: 'Airlock pressure memory offline. SR latch — two cross-coupled NOR gates — has a broken feedback wire. Latch cannot hold state. Pressure readings unverifiable.',
    fault:    'INCIDENT REPORT: Feedback wire from NOR2 output to NOR1 input disconnected at junction A-9 during panel inspection. SR latch feedback loop broken. Memory state lost. Airlock system non-operational.',
    dispatch: 'Restore the SR latch feedback path. S input into NOR1. R input into NOR2. NOR1 output feeds NOR2 input AND drives Q. NOR2 output feeds NOR1 input AND drives Q-bar. Cross-couple the gates.',
    success:  'Airlock pressure memory restored. SR latch holding state nominally. WO-0101 closed by Beta Shift.',
    lore:     'The SR latch is the first circuit in this curriculum where output depends not just on current inputs, but on history. With S=0 and R=0, the latch holds whatever Q was last set to — that is memory. Every register, flip-flop, RAM cell, and state machine on this ship is descended from this cross-coupled pair. The forbidden state (S=1, R=1) causes both Q and Q-bar to try to be 0 simultaneously — a logical contradiction that resolves unpredictably when S and R return to 0. Avoid it.',
  },

  phases: {
    work: {
      hint: 'S=1 sets Q=1. R=1 resets Q=0. S=0, R=0 holds last state. Two NOR gates, cross-coupled feedback.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { S: false, R: false },
    },
    break: {
      hint: 'Feedback wire from NOR2 → NOR1 is broken. Latch cannot hold state — Q follows S directly with no memory.',
      faultNodeId: 'nor1',
      nodes: NODES_FULL,
      inputs: { S: false, R: false },
      wires: [
        { id: 'w1', from: { nodeId: 'S',    pin: 'output' }, to: { nodeId: 'nor1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'nor2', pin: 'output' }, to: { nodeId: 'nor1', pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'nor1', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w4', from: { nodeId: 'R',    pin: 'output' }, to: { nodeId: 'nor2', pin: 'input', index: 0 } },
        { id: 'w5', from: { nodeId: 'nor1', pin: 'output' }, to: { nodeId: 'nor2', pin: 'input', index: 1 } },
        { id: 'w6', from: { nodeId: 'nor2', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Cross-couple two NOR gates. S → NOR1 input. R → NOR2 input. NOR1 output → Q and NOR2 input. NOR2 output → Q-bar and NOR1 input. Both feedbacks are required.',
      nodes: [
        { id: 'S',     type: 'INPUT',  x: 60,  y: 100, scale: 1,   locked: false },
        { id: 'R',     type: 'INPUT',  x: 60,  y: 320, scale: 1,   locked: false },
        { id: 'nor1',  type: 'NOR',    x: 230, y: 120, scale: 1.2, locked: false },
        { id: 'nor2',  type: 'NOR',    x: 230, y: 300, scale: 1.2, locked: false },
        { id: 'Q',     type: 'OUTPUT', x: 480, y: 155, scale: 1 },
        { id: 'Qbar',  type: 'OUTPUT', x: 480, y: 330, scale: 1 },
      ],
      inputs: { S: false, R: false },
      wires: [],
    },
  },
}