/**
 * Unit II · Lesson 06 — Decoder
 *
 * Narrative context:
 *   Work Order WO-0065 — Deck 11, Crew Alert Panel.
 *   The alert router receives the 2-bit encoded signal and uses a 2-to-4
 *   decoder to activate exactly one of four alert systems (PA, medical,
 *   engineering, emergency bulkheads). A loose terminal block means the
 *   decoder's ENABLE line is intermittently floating LOW — when it drops,
 *   ALL decoder outputs go to zero regardless of input code, and no alert
 *   system activates at all. Currently stuck LOW. No alerts are routing.
 *
 * Engineering framing:
 *   2-to-4 decoder: A1, A0 inputs → one of D0–D3 active (active HIGH).
 *   ENABLE input: when LOW, all outputs forced to 0.
 *   D0 = ~A1 AND ~A0 AND EN
 *   D1 = ~A1 AND  A0 AND EN
 *   D2 =  A1 AND ~A0 AND EN
 *   D3 =  A1 AND  A0 AND EN
 *   Four AND gates, two NOT gates, one ENABLE input.
 */

const NODES_FULL = [
  { id: 'a1',   type: 'INPUT',  x: 50,  y: 80,  scale: 1 },
  { id: 'a0',   type: 'INPUT',  x: 50,  y: 190, scale: 1 },
  { id: 'en',   type: 'INPUT',  x: 50,  y: 320, scale: 1 },

  { id: 'notA1', type: 'NOT',   x: 170, y: 80,  scale: 1.0 },
  { id: 'notA0', type: 'NOT',   x: 170, y: 190, scale: 1.0 },

  { id: 'and0',  type: 'AND',   x: 310, y: 55,  scale: 1.1 },
  { id: 'and1',  type: 'AND',   x: 310, y: 175, scale: 1.1 },
  { id: 'and2',  type: 'AND',   x: 310, y: 295, scale: 1.1 },
  { id: 'and3',  type: 'AND',   x: 310, y: 415, scale: 1.1 },

  { id: 'd0',   type: 'OUTPUT', x: 500, y: 70,  scale: 1 },
  { id: 'd1',   type: 'OUTPUT', x: 500, y: 190, scale: 1 },
  { id: 'd2',   type: 'OUTPUT', x: 500, y: 310, scale: 1 },
  { id: 'd3',   type: 'OUTPUT', x: 500, y: 430, scale: 1 },
]

// Note: each AND gate in this decoder has 3 inputs.
// For the schema, we use index 0, 1, 2 for the three-input AND.
const WIRES_FULL = [
  // NOT gates
  { id: 'dc1',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'notA1', pin: 'input', index: 0 } },
  { id: 'dc2',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'notA0', pin: 'input', index: 0 } },
  // D0 = ~A1 AND ~A0 AND EN
  { id: 'dc3',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 0 } },
  { id: 'dc4',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 1 } },
  { id: 'dc5',  from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 2 } },
  // D1 = ~A1 AND A0 AND EN
  { id: 'dc6',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
  { id: 'dc7',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
  { id: 'dc8',  from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 2 } },
  // D2 = A1 AND ~A0 AND EN
  { id: 'dc9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
  { id: 'dc10', from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
  { id: 'dc11', from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 2 } },
  // D3 = A1 AND A0 AND EN
  { id: 'dc12', from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 0 } },
  { id: 'dc13', from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 1 } },
  { id: 'dc14', from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 2 } },
  // Outputs
  { id: 'dc15', from: { nodeId: 'and0',  pin: 'output' }, to: { nodeId: 'd0',    pin: 'input', index: 0 } },
  { id: 'dc16', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'd1',    pin: 'input', index: 0 } },
  { id: 'dc17', from: { nodeId: 'and2',  pin: 'output' }, to: { nodeId: 'd2',    pin: 'input', index: 0 } },
  { id: 'dc18', from: { nodeId: 'and3',  pin: 'output' }, to: { nodeId: 'd3',    pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-06',
    title:       'Decoder',
    unit:        2,
    lessonIndex: 5,
    concept:     'DECODER',
    panels:      ['verilog'],
    workOrder:   'WO-0065',
    location:    'Deck 11 · Alert Router Panel',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Alert router, Deck 11. Still tied to the encoder we just fixed.\n\nThe 2-bit code from the alert panel hits this decoder and it's supposed to activate exactly one of four systems — PA, medical, engineering, or emergency bulkheads. Right now the ENABLE terminal is floating LOW. Loose block, probably vibrated free in the same event as the encoder solder joint.\n\nEN=0 means all four AND gates produce zero. Every output is dead. The 2-bit code comes in correctly. The decoder ignores it. Nothing activates. Every alert on this ship that's fired in the last two days has gone into a void.",
    briefing: '2-to-4 decoder, alert router. ENABLE line at terminal block EN-3 disconnected and floating LOW. All four AND gate outputs forced to zero. Alert routing dead for all priority classes.',
    fault:    'INCIDENT REPORT: Terminal block EN-3 loose — ENABLE line floating LOW. 2-to-4 decoder outputs D0–D3 all reading 0. Alert activation circuits not receiving any signals. All alerts suppressed.',
    dispatch: 'Restore ENABLE wire from EN input to all four AND gates (and0 through and3, input index 2). Confirm NOT gates feeding ~A1 and ~A0 correctly. EN=HIGH must activate exactly one output per code.',
    success:  'ENABLE line restored. Decoder operational. Alert routing active. WO-0065 closed by Beta Shift.',
    lore:     'A decoder is the inverse of an encoder — binary code in, one-hot pattern out. The ENABLE line is standard in real decoders for chip-select logic: tie EN LOW to disable the whole decoder and force all outputs off, enabling memory banking, bus multiplexing, and power gating. The 2-to-4 decoder generalizes: a 3-to-8 decoder uses 3 address bits and 8 AND gates, a 4-to-16 uses 4 bits and 16 AND gates. Decoders are how address lines select individual memory cells in every RAM chip ever made.',
  },

  phases: {
    work: {
      hint: 'EN=HIGH activates decoder. D0=~A1~A0, D1=~A1·A0, D2=A1·~A0, D3=A1·A0. Exactly one active per code.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { a1: true, a0: false, en: true },
    },
    break: {
      hint: 'EN wire disconnected. EN input is floating — all AND gates see EN=0. All outputs are 0.',
      faultNodeId: 'and0',
      nodes: NODES_FULL,
      inputs: { a1: true, a0: false, en: true },
      wires: [
        { id: 'dc1',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'notA1', pin: 'input', index: 0 } },
        { id: 'dc2',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'notA0', pin: 'input', index: 0 } },
        { id: 'dc3',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 0 } },
        { id: 'dc4',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 1 } },
        { id: 'dc5',  from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 2 }, broken: true },
        { id: 'dc6',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
        { id: 'dc7',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
        { id: 'dc8',  from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 2 }, broken: true },
        { id: 'dc9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
        { id: 'dc10', from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
        { id: 'dc11', from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 2 }, broken: true },
        { id: 'dc12', from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 0 } },
        { id: 'dc13', from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 1 } },
        { id: 'dc14', from: { nodeId: 'en',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 2 }, broken: true },
        { id: 'dc15', from: { nodeId: 'and0',  pin: 'output' }, to: { nodeId: 'd0',    pin: 'input', index: 0 } },
        { id: 'dc16', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'd1',    pin: 'input', index: 0 } },
        { id: 'dc17', from: { nodeId: 'and2',  pin: 'output' }, to: { nodeId: 'd2',    pin: 'input', index: 0 } },
        { id: 'dc18', from: { nodeId: 'and3',  pin: 'output' }, to: { nodeId: 'd3',    pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Wire EN to all four AND gates at input[2]. Each AND gate also needs its two address bit wires (~A1 or A1, ~A0 or A0).',
      nodes: [
        { id: 'a1',    type: 'INPUT',  x: 50,  y: 80,  scale: 1,   locked: false },
        { id: 'a0',    type: 'INPUT',  x: 50,  y: 190, scale: 1,   locked: false },
        { id: 'en',    type: 'INPUT',  x: 50,  y: 320, scale: 1,   locked: false },
        { id: 'notA1', type: 'NOT',   x: 170, y: 80,  scale: 1.0, locked: false },
        { id: 'notA0', type: 'NOT',   x: 170, y: 190, scale: 1.0, locked: false },
        { id: 'and0',  type: 'AND',   x: 310, y: 55,  scale: 1.1, locked: false },
        { id: 'and1',  type: 'AND',   x: 310, y: 175, scale: 1.1, locked: false },
        { id: 'and2',  type: 'AND',   x: 310, y: 295, scale: 1.1, locked: false },
        { id: 'and3',  type: 'AND',   x: 310, y: 415, scale: 1.1, locked: false },
        { id: 'd0',   type: 'OUTPUT', x: 500, y: 70,  scale: 1 },
        { id: 'd1',   type: 'OUTPUT', x: 500, y: 190, scale: 1 },
        { id: 'd2',   type: 'OUTPUT', x: 500, y: 310, scale: 1 },
        { id: 'd3',   type: 'OUTPUT', x: 500, y: 430, scale: 1 },
      ],
      inputs: { a1: false, a0: false, en: false },
      wires: [],
    },
  },
}