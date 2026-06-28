/**
 * Unit I · Lesson 04 — NAND & NOR Gates
 *
 * Narrative context:
 *   Work Order WO-0052 — Deck 7, coolant pump interlock panel.
 *   This lesson introduces TWO gates side by side — more complex canvas.
 *   Left circuit: NAND gate controlling pump A inhibit (pump should STOP if BOTH
 *     temp sensor AND pressure sensor are simultaneously HIGH — dangerous condition).
 *   Right circuit: NOR gate controlling an alarm silence relay (alarm silences ONLY
 *     when NEITHER manual override NOR fault signal is active).
 *
 *   Fault: someone swapped the NAND output wire into the wrong terminal — it's now
 *   wired to the NOR input instead of pump inhibit. Both outputs floating.
 *   Player fixes: trace and reconnect both circuits correctly.
 *
 * Engineering framing:
 *   NAND = AND + NOT. Output LOW only when BOTH inputs HIGH. Universal gate.
 *   NOR  = OR  + NOT. Output HIGH only when BOTH inputs LOW.
 *   Key reveal: NAND is functionally complete — you can build any logic from it alone.
 */

// NAND side — pump inhibit circuit
// NAND: STOP pump if temp HIGH AND pressure HIGH simultaneously
const NAND_NODES = [
  { id: 'temp',     type: 'INPUT',  x: 60,  y: 100, scale: 1 },
  { id: 'pres',     type: 'INPUT',  x: 60,  y: 220, scale: 1 },
  { id: 'nand1',   type: 'NAND',   x: 230, y: 130, scale: 1.3 },
  { id: 'inhibit', type: 'OUTPUT', x: 470, y: 180, scale: 1 },
]

const NAND_WIRES = [
  { id: 'n1', from: { nodeId: 'temp',   pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 0 } },
  { id: 'n2', from: { nodeId: 'pres',   pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 1 } },
  { id: 'n3', from: { nodeId: 'nand1',  pin: 'output' }, to: { nodeId: 'inhibit', pin: 'input', index: 0 } },
]

// Full node list (both circuits on one canvas)
const NODES_FULL = [
  // NAND side
  { id: 'temp',     type: 'INPUT',  x: 60,  y: 80,  scale: 1 },
  { id: 'pres',     type: 'INPUT',  x: 60,  y: 200, scale: 1 },
  { id: 'nand1',   type: 'NAND',   x: 220, y: 110, scale: 1.2 },
  { id: 'inhibit', type: 'OUTPUT', x: 440, y: 155, scale: 1 },

  // NOR side
  { id: 'override', type: 'INPUT',  x: 60,  y: 330, scale: 1 },
  { id: 'faultSig', type: 'INPUT',  x: 60,  y: 440, scale: 1 },
  { id: 'nor1',    type: 'NOR',    x: 220, y: 360, scale: 1.2 },
  { id: 'silence', type: 'OUTPUT', x: 440, y: 395, scale: 1 },
]

const WIRES_FULL = [
  // NAND circuit
  { id: 'n1', from: { nodeId: 'temp',     pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 0 } },
  { id: 'n2', from: { nodeId: 'pres',     pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 1 } },
  { id: 'n3', from: { nodeId: 'nand1',   pin: 'output' }, to: { nodeId: 'inhibit', pin: 'input', index: 0 } },
  // NOR circuit
  { id: 'r1', from: { nodeId: 'override', pin: 'output' }, to: { nodeId: 'nor1',   pin: 'input', index: 0 } },
  { id: 'r2', from: { nodeId: 'faultSig', pin: 'output' }, to: { nodeId: 'nor1',   pin: 'input', index: 1 } },
  { id: 'r3', from: { nodeId: 'nor1',    pin: 'output' }, to: { nodeId: 'silence', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-04',
    title:       'NAND & NOR Gates',
    unit:        1,
    lessonIndex: 3,
    concept:     'NAND_NOR',
    panels:      [],
    workOrder:   'WO-0052',
    location:    'Deck 7 · Coolant Control Panel',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Coolant panel is showing two faults on the same board and I can't tell if they're related or if someone just had a bad afternoon in here.\n\nLeft side is the pump inhibit — a NAND gate. It should trip LOW only when both temp and pressure are simultaneously HIGH. That's the 'pump is about to die' condition. Right now the output wire is sitting loose, not connected to anything.\n\nRight side is the alarm silence relay — a NOR gate. Silence only activates when both the manual override and the fault signal are LOW. Also disconnected. Whoever was in here last just… left it.",
    briefing: 'Two circuits on panel C-7. NAND gate: pump inhibit trips LOW when temp AND pressure simultaneously HIGH. NOR gate: alarm silences only when both override and fault signal are LOW.',
    fault:    'INCIDENT REPORT: Output wires for both NAND and NOR gate circuits disconnected at junction C-7 during cable maintenance. Both pump inhibit and alarm silence relays uncontrolled.',
    dispatch: 'Restore both circuits. Wire the NAND gate to the pump inhibit output. Wire the NOR gate to the alarm silence output. Each gate has two inputs — check the labels.',
    success:  'Both circuits restored. Pump inhibit and alarm silence operational. WO-0052 closed by Alpha Shift.',
    lore:     'NAND and NOR are universal gates — mathematically, either one alone can implement any Boolean function. Every processor on this ship is built from NAND arrays. The apparent variety of gate types you see on schematics is an abstraction: underneath, it is almost certainly NAND all the way down. De Morgan\'s theorem is the bridge: NOT(A AND B) equals (NOT A) OR (NOT B). That identity is what makes the substitution possible.',
  },

  phases: {
    work: {
      hint: 'NAND outputs LOW only when BOTH inputs HIGH. NOR outputs HIGH only when BOTH inputs LOW. Both circuits nominal here.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { temp: false, pres: false, override: false, faultSig: false },
    },
    break: {
      hint: 'Output wires from both gates are disconnected. Pump inhibit and silence relay receive no signal.',
      faultNodeId: 'nand1',
      nodes: NODES_FULL,
      inputs: { temp: false, pres: false, override: false, faultSig: false },
      wires: [
        { id: 'n1', from: { nodeId: 'temp',     pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 0 } },
        { id: 'n2', from: { nodeId: 'pres',     pin: 'output' }, to: { nodeId: 'nand1',  pin: 'input', index: 1 } },
        { id: 'n3', from: { nodeId: 'nand1',   pin: 'output' }, to: { nodeId: 'inhibit', pin: 'input', index: 0 }, broken: true },
        { id: 'r1', from: { nodeId: 'override', pin: 'output' }, to: { nodeId: 'nor1',   pin: 'input', index: 0 } },
        { id: 'r2', from: { nodeId: 'faultSig', pin: 'output' }, to: { nodeId: 'nor1',   pin: 'input', index: 1 } },
        { id: 'r3', from: { nodeId: 'nor1',    pin: 'output' }, to: { nodeId: 'silence', pin: 'input', index: 0 }, broken: true },
      ],
    },
    try: {
      hint: 'Two separate circuits. Wire each gate\'s inputs from the correct sensors, then connect each output to its relay. NAND → pump inhibit. NOR → alarm silence.',
      nodes: [
        { id: 'temp',     type: 'INPUT',  x: 60,  y: 80,  scale: 1,   locked: false },
        { id: 'pres',     type: 'INPUT',  x: 60,  y: 200, scale: 1,   locked: false },
        { id: 'nand1',   type: 'NAND',   x: 220, y: 110, scale: 1.2, locked: false },
        { id: 'inhibit', type: 'OUTPUT', x: 440, y: 155, scale: 1 },
        { id: 'override', type: 'INPUT',  x: 60,  y: 330, scale: 1,   locked: false },
        { id: 'faultSig', type: 'INPUT',  x: 60,  y: 440, scale: 1,   locked: false },
        { id: 'nor1',    type: 'NOR',    x: 220, y: 360, scale: 1.2, locked: false },
        { id: 'silence', type: 'OUTPUT', x: 440, y: 395, scale: 1 },
      ],
      inputs: { temp: false, pres: false, override: false, faultSig: false },
      wires: [],
    },
  },
}