/**
 * Unit I · Lesson 01 — AND Gate
 */

const NODES_FULL = [
  { id: 'inA',  type: 'INPUT',  x: 80,  y: 120, scale: 1 },
  { id: 'inB',  type: 'INPUT',  x: 80,  y: 240, scale: 1 },
  { id: 'g1',   type: 'AND',    x: 260, y: 150, scale: 1.3 },
  { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'inA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'inB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'g1',  pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-01',
    title:       'AND Gate',
    unit:        1,
    lessonIndex: 0,
    concept:     'AND',
    panels:      [],
    workOrder:   'WO-0047',
    location:    'Deck 7 · Bay 4',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Hey. You're up — good, you had me worried for a second there.\n\nQuick refresh since you'll ask in ten minutes anyway: you're a mechanic, Deck 7, this ship. You've been out of it on the short-term stuff since the accident — names, what you did an hour ago, that kind of thing. Everything else, you're sharp as ever. It just doesn't stick.\n\nI'm Ada. I work this deck too. I'll catch you up before every shift so you're not flying blind. Don't worry about it — happens, we deal, we move on.\n\nFirst job: Bay 4. Should be simple.",
    briefing: 'Bay 4 environmental controls nominal. Both pressure sensors read HIGH — the AND gate confirms joint confirmation before venting.',
    fault:    'INCIDENT REPORT: Sensor B feed disconnected at junction J-14. AND gate receiving floating input. Vent circuit locked LOW. Bay pressure rising.',
    dispatch: 'Restore the sensor feeds. Wire both inputs to the AND gate and connect the gate to the vent relay. Both sensors must read HIGH to authorize vent.',
    success:  'Vent circuit restored. Bay 4 pressure normalizing. WO-0047 closed by Alpha Shift.',
    lore:     'The AND gate is the simplest form of consensus logic. Two signals must agree before any action is authorized. Every airlock on the ship uses this principle.',
  },

  phases: {
    work: {
      hint: 'Both inputs are HIGH. The AND gate outputs HIGH — all inputs must agree.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inA: true, inB: true },
    },
    break: {
      hint: 'Input B is disconnected. The AND gate sees a floating input — output collapses to LOW.',
      faultNodeId: 'g1',
      nodes: NODES_FULL,
      inputs: { inA: true, inB: false },
      wires: [
        { id: 'w1', from: { nodeId: 'inA', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'inB', pin: 'output' }, to: { nodeId: 'g1',  pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'g1',  pin: 'output' }, to: { nodeId: 'out', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Wire input A and input B to the AND gate. Then wire the AND gate to the output.',
      nodes: [
        { id: 'inA',  type: 'INPUT',  x: 80,  y: 120, scale: 1,   locked: false },
        { id: 'inB',  type: 'INPUT',  x: 80,  y: 240, scale: 1,   locked: false },
        { id: 'g1',   type: 'AND',    x: 260, y: 150, scale: 1.3, locked: false },
        { id: 'out',  type: 'OUTPUT', x: 500, y: 195, scale: 1 },
      ],
      inputs: { inA: false, inB: false },
      wires: [],
    },
  },
}