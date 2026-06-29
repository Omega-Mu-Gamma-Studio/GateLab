/**
 * Unit II · Lesson 08 — Demultiplexer (DEMUX)
 *
 * Narrative context:
 *   Work Order WO-0067 — Deck 5, Communications Hub.
 *   The transmission signal from the MUX needs to be demultiplexed on the
 *   receiving side — routed to either the command console or crew quarters
 *   depending on the SELECT line. The DEMUX AND gate for output Y1 had its
 *   select input ripped out — Y1 never asserts. All traffic is routing to Y0
 *   (command console), flooding it and blocking crew comms entirely.
 *
 * Engineering framing:
 *   1-to-2 DEMUX: single input, SELECT=0 → Y0, SELECT=1 → Y1.
 *   Y0 = IN AND ~SEL
 *   Y1 = IN AND SEL
 *   One NOT gate, two AND gates.
 *   DEMUX is the inverse of MUX — same circuit, different data flow direction.
 */

const NODES_FULL = [
  { id: 'inData', type: 'INPUT',  x: 60,  y: 180, scale: 1 },
  { id: 'sel',    type: 'INPUT',  x: 60,  y: 350, scale: 1 },
  { id: 'notS',   type: 'NOT',    x: 190, y: 340, scale: 1.1 },
  { id: 'and0',   type: 'AND',    x: 330, y: 100, scale: 1.2 },
  { id: 'and1',   type: 'AND',    x: 330, y: 290, scale: 1.2 },
  { id: 'y0',     type: 'OUTPUT', x: 520, y: 125, scale: 1 },
  { id: 'y1',     type: 'OUTPUT', x: 520, y: 315, scale: 1 },
]

const WIRES_FULL = [
  { id: 'dm1', from: { nodeId: 'sel',    pin: 'output' }, to: { nodeId: 'notS', pin: 'input', index: 0 } },
  { id: 'dm2', from: { nodeId: 'inData', pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 0 } },
  { id: 'dm3', from: { nodeId: 'notS',   pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 1 } },
  { id: 'dm4', from: { nodeId: 'inData', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
  { id: 'dm5', from: { nodeId: 'sel',    pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 } },
  { id: 'dm6', from: { nodeId: 'and0',   pin: 'output' }, to: { nodeId: 'y0',   pin: 'input', index: 0 } },
  { id: 'dm7', from: { nodeId: 'and1',   pin: 'output' }, to: { nodeId: 'y1',   pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-08',
    title:       'Demultiplexer',
    unit:        2,
    lessonIndex: 7,
    concept:     'DEMUX',
    panels:      ['verilog'],
    workOrder:   'WO-0067',
    location:    'Deck 5 · Communications Hub',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Still in comms, Deck 5. The MUX is fixed — signal is going out on the right channel. Now the receiving end is broken.\n\nDEMUX takes the signal and routes it to one of two outputs: Y0 is command console, Y1 is crew quarters. SELECT line picks which.\n\nThe AND gate for Y1 is missing its SELECT input wire. It got yanked during the same maintenance pass that broke the MUX. AND1 sees IN but never sees SEL — output stays LOW. Every signal is going to Y0. Command console is flooded. Crew comms are blacked out.",
    briefing: '1-to-2 DEMUX, comms receiving side. AND1 SELECT input (Y1 path) disconnected at junction C-9. Y1 always LOW. All traffic routing to Y0 (command console). Crew comms suppressed.',
    fault:    'INCIDENT REPORT: Wire at junction C-9 severed during cable maintenance. AND1 input[1] floating LOW. Y1 output permanently 0. Command console flooded; crew quarters receive no signals.',
    dispatch: 'Restore SEL wire to AND1 input[1]. Confirm IN feeds both AND0 input[0] and AND1 input[0]. NOT gate inverts SEL for AND0 input[1]. SEL=0 → Y0 active. SEL=1 → Y1 active.',
    success:  'Y1 path restored. DEMUX routing operational. Command console and crew quarters both receiving. WO-0067 closed by Beta Shift.',
    lore:     'DEMUX and MUX are circuit duals — flip the data and control flow directions and one becomes the other. In practice, many chips implement both functions with the same hardware by reversing the signal direction. DEMUX circuits appear in display drivers, memory write-enable routing, and serial-to-parallel converters. When you see a 1-to-N demultiplexer, the SELECT lines are acting as a decoder for the output address — which is why decoders and demuxes look nearly identical at the gate level.',
  },

  phases: {
    work: {
      hint: 'SEL=0 → NOT HIGH → AND0 passes IN to Y0. SEL=1 → AND1 passes IN to Y1. One active output at a time.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { inData: true, sel: true },
    },
    break: {
      hint: 'SEL wire to AND1 is cut. AND1 never sees SEL — output stuck LOW. Y1 is dead.',
      faultNodeId: 'and1',
      nodes: NODES_FULL,
      inputs: { inData: true, sel: true },
      wires: [
        { id: 'dm1', from: { nodeId: 'sel',    pin: 'output' }, to: { nodeId: 'notS', pin: 'input', index: 0 } },
        { id: 'dm2', from: { nodeId: 'inData', pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 0 } },
        { id: 'dm3', from: { nodeId: 'notS',   pin: 'output' }, to: { nodeId: 'and0', pin: 'input', index: 1 } },
        { id: 'dm4', from: { nodeId: 'inData', pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 0 } },
        { id: 'dm5', from: { nodeId: 'sel',    pin: 'output' }, to: { nodeId: 'and1', pin: 'input', index: 1 }, broken: true },
        { id: 'dm6', from: { nodeId: 'and0',   pin: 'output' }, to: { nodeId: 'y0',   pin: 'input', index: 0 } },
        { id: 'dm7', from: { nodeId: 'and1',   pin: 'output' }, to: { nodeId: 'y1',   pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'IN fans out to both AND gates input[0]. SEL → NOT → AND0 input[1]. SEL direct → AND1 input[1]. AND outputs to Y0 and Y1.',
      nodes: [
        { id: 'inData', type: 'INPUT',  x: 60,  y: 180, scale: 1,   locked: false },
        { id: 'sel',    type: 'INPUT',  x: 60,  y: 350, scale: 1,   locked: false },
        { id: 'notS',   type: 'NOT',    x: 190, y: 340, scale: 1.1, locked: false },
        { id: 'and0',   type: 'AND',    x: 330, y: 100, scale: 1.2, locked: false },
        { id: 'and1',   type: 'AND',    x: 330, y: 290, scale: 1.2, locked: false },
        { id: 'y0',     type: 'OUTPUT', x: 520, y: 125, scale: 1 },
        { id: 'y1',     type: 'OUTPUT', x: 520, y: 315, scale: 1 },
      ],
      inputs: { inData: false, sel: false },
      wires: [],
    },
  },
}