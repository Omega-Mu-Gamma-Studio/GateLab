/**
 * Unit II · Lesson 07 — Multiplexer (MUX)
 *
 * Narrative context:
 *   Work Order WO-0066 — Deck 5, Communications Hub.
 *   The comms hub routes two signal feeds (primary and backup) through a
 *   2-to-1 multiplexer to a single transmission line. The SELECT line
 *   determines which feed is live. A fault in the SELECT input inverter
 *   means the select signal is being passed uninverted when it should be
 *   inverted — the MUX is selecting the wrong channel.
 *   D0 (primary) is being sent when S=0 but the NOT gate for D1 path is broken.
 *
 * Engineering framing:
 *   2-to-1 MUX: SELECT=0 → output D0, SELECT=1 → output D1.
 *   Y = (~S AND D0) OR (S AND D1)
 *   Two AND gates, one NOT gate, one OR gate.
 *   MUX is data routing — the SELECT line is an address into the input set.
 */

const NODES_FULL = [
  { id: 'd0',   type: 'INPUT',  x: 60,  y: 80,  scale: 1 },
  { id: 'd1',   type: 'INPUT',  x: 60,  y: 230, scale: 1 },
  { id: 'sel',  type: 'INPUT',  x: 60,  y: 380, scale: 1 },
  { id: 'notS', type: 'NOT',    x: 190, y: 370, scale: 1.1 },
  { id: 'and0', type: 'AND',    x: 320, y: 100, scale: 1.2 },
  { id: 'and1', type: 'AND',    x: 320, y: 270, scale: 1.2 },
  { id: 'or1',  type: 'OR',     x: 460, y: 175, scale: 1.2 },
  { id: 'out',  type: 'OUTPUT', x: 610, y: 200, scale: 1 },
]

const WIRES_FULL = [
  { id: 'm1', from: { nodeId: 'sel',  pin: 'output' }, to: { nodeId: 'notS', pin: 'input', index: 0 } },
  { id: 'm2', from: { nodeId: 'd0',   pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 0 } },
  { id: 'm3', from: { nodeId: 'notS', pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 1 } },
  { id: 'm4', from: { nodeId: 'd1',   pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  { id: 'm5', from: { nodeId: 'sel',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  { id: 'm6', from: { nodeId: 'and0', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 0 } },
  { id: 'm7', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 1 } },
  { id: 'm8', from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'out',  pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-07',
    title:       'Multiplexer',
    unit:        2,
    lessonIndex: 6,
    concept:     'MUX',
    panels:      ['verilog'],
    workOrder:   'WO-0066',
    location:    'Deck 5 · Communications Hub',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Comms hub, Deck 5. Two feeds into a 2-to-1 MUX — D0 is the primary encrypted channel, D1 is the backup public-band relay. SELECT line picks which one gets through to the transmission line.\n\nThe NOT gate that's supposed to invert the SELECT signal for the D0 AND gate is the problem. The NOT gate output is shorted to ground — it reads LOW regardless. AND gate for D0 always sees its second input as LOW. D0 can never assert. We're transmitting D1 — the backup band — exclusively, including on traffic that should be encrypted.",
    briefing: '2-to-1 MUX, comms channel select. NOT gate output shorted to ground — always LOW. AND0 (D0 path) permanently blocked. D1 active regardless of SELECT. Encrypted channel inaccessible.',
    fault:    'INCIDENT REPORT: NOT gate output shorted at junction C-4. AND0 input[1] always LOW. Primary channel (D0) never selects through. All traffic routing through backup (D1), including classified signals.',
    dispatch: 'Restore NOT gate: SEL → NOT gate input, NOT gate output → AND0 input[1]. Confirm AND1 input[1] takes direct SEL. OR gate merges both AND outputs. SELECT=0 → D0, SELECT=1 → D1.',
    success:  'MUX select path restored. Primary channel selectable. Encrypted routing operational. WO-0066 closed by Beta Shift.',
    lore:     'The multiplexer is data routing hardware — the SELECT line is a binary address into the input set. A 4-to-1 MUX needs 2 select bits and 4 AND gates; an 8-to-1 needs 3 select bits and 8 AND gates. MUXes are everywhere: CPU buses, memory banking, display signal routing. The equation Y = (~S·D0) + (S·D1) is worth memorising — it\'s the template for all MUX logic. Note that a MUX can also implement any Boolean function: load a truth table into the data inputs and use the function\'s variables as SELECT lines.',
  },

  phases: {
    work: {
      hint: 'SEL=0 → NOT gate HIGH → AND0 passes D0. SEL=1 → NOT gate LOW → AND0 blocked, AND1 passes D1.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { d0: true, d1: false, sel: false },
    },
    break: {
      hint: 'NOT gate output shorted LOW. AND0 always blocked. D0 can never get through regardless of SELECT.',
      faultNodeId: 'notS',
      nodes: NODES_FULL,
      inputs: { d0: true, d1: false, sel: false },
      wires: [
        { id: 'm1', from: { nodeId: 'sel',  pin: 'output' }, to: { nodeId: 'notS', pin: 'input', index: 0 } },
        { id: 'm2', from: { nodeId: 'd0',   pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 0 } },
        { id: 'm3', from: { nodeId: 'notS', pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 1 }, broken: true },
        { id: 'm4', from: { nodeId: 'd1',   pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
        { id: 'm5', from: { nodeId: 'sel',  pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
        { id: 'm6', from: { nodeId: 'and0', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 0 } },
        { id: 'm7', from: { nodeId: 'and1', pin: 'output' }, to: { nodeId: 'or1',  pin: 'input', index: 1 } },
        { id: 'm8', from: { nodeId: 'or1',  pin: 'output' }, to: { nodeId: 'out',  pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'SEL → NOT gate → AND0 input[1]. SEL direct → AND1 input[1]. D0 → AND0 input[0]. D1 → AND1 input[0]. AND0, AND1 → OR → output.',
      nodes: [
        { id: 'd0',   type: 'INPUT',  x: 60,  y: 80,  scale: 1,   locked: false },
        { id: 'd1',   type: 'INPUT',  x: 60,  y: 230, scale: 1,   locked: false },
        { id: 'sel',  type: 'INPUT',  x: 60,  y: 380, scale: 1,   locked: false },
        { id: 'notS', type: 'NOT',    x: 190, y: 370, scale: 1.1, locked: false },
        { id: 'and0', type: 'AND',    x: 320, y: 100, scale: 1.2, locked: false },
        { id: 'and1', type: 'AND',    x: 320, y: 270, scale: 1.2, locked: false },
        { id: 'or1',  type: 'OR',     x: 460, y: 175, scale: 1.2, locked: false },
        { id: 'out',  type: 'OUTPUT', x: 610, y: 200, scale: 1 },
      ],
      inputs: { d0: false, d1: false, sel: false },
      wires: [],
    },
  },
}