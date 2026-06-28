/**
 * Unit I · Lesson 05 — XOR & XNOR Gates
 *
 * Narrative context:
 *   Work Order WO-0053 — Deck 7, coolant sensor parity array.
 *   Two redundant temperature sensors (A and B) should normally agree.
 *   XOR gate: fires HIGH when sensors *disagree* → triggers a calibration flag.
 *   XNOR gate (bonus circuit): fires HIGH when sensors *agree* → drives
 *     the "sensors nominal" indicator light.
 *
 *   Fault: XOR output wire pulled. Disagreement goes undetected.
 *   The XNOR circuit is fully wired but its inputs are swapped — wrong sensors
 *   feeding the wrong gate inputs (though for XNOR it's symmetric, so no actual
 *   logic difference — but the wire tracing is wrong and it shows).
 *   Player re-wires XOR correctly, traces XNOR to confirm it's actually fine.
 *
 * Engineering framing:
 *   XOR  = "exactly one input HIGH" → disagreement / difference detector
 *   XNOR = "inputs agree" → agreement / equality checker
 *   Critical use: parity checking, data integrity, sensor redundancy validation
 */

const NODES_FULL = [
  // XOR side — disagreement detection
  { id: 'sensA',  type: 'INPUT',  x: 60,  y: 90,  scale: 1 },
  { id: 'sensB',  type: 'INPUT',  x: 60,  y: 210, scale: 1 },
  { id: 'xor1',  type: 'XOR',    x: 220, y: 120, scale: 1.2 },
  { id: 'calib', type: 'OUTPUT', x: 440, y: 160, scale: 1 },

  // XNOR side — agreement indicator
  { id: 'sensA2', type: 'INPUT',  x: 60,  y: 340, scale: 1 },
  { id: 'sensB2', type: 'INPUT',  x: 60,  y: 455, scale: 1 },
  { id: 'xnor1', type: 'XNOR',   x: 220, y: 370, scale: 1.2 },
  { id: 'agree', type: 'OUTPUT', x: 440, y: 410, scale: 1 },
]

const WIRES_FULL = [
  // XOR circuit
  { id: 'x1', from: { nodeId: 'sensA',  pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 0 } },
  { id: 'x2', from: { nodeId: 'sensB',  pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 1 } },
  { id: 'x3', from: { nodeId: 'xor1',  pin: 'output' }, to: { nodeId: 'calib', pin: 'input', index: 0 } },
  // XNOR circuit
  { id: 'xn1', from: { nodeId: 'sensA2', pin: 'output' }, to: { nodeId: 'xnor1', pin: 'input', index: 0 } },
  { id: 'xn2', from: { nodeId: 'sensB2', pin: 'output' }, to: { nodeId: 'xnor1', pin: 'input', index: 1 } },
  { id: 'xn3', from: { nodeId: 'xnor1', pin: 'output' }, to: { nodeId: 'agree', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-05',
    title:       'XOR & XNOR Gates',
    unit:        1,
    lessonIndex: 4,
    concept:     'XOR_XNOR',
    panels:      [],
    workOrder:   'WO-0053',
    location:    'Deck 7 · Sensor Array C',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Sensor array C has been logging phantom calibration flags for about three weeks — or rather, it should have been, but it wasn't. The XOR gate that catches when the two temperature sensors disagree had its output wire pulled at some point. We don't know when. We don't know how long the sensors have been disagreeing.\n\nThe XNOR side — the 'sensors agree' indicator — is wired, and it's showing green. Which means right now the sensors match. But there's been a blind spot for weeks.\n\nFix the XOR circuit. I'll log the gap in the maintenance record.",
    briefing: 'Two temperature sensors on Array C. XOR gate: calibration flag triggers when sensors disagree. XNOR gate: agreement indicator active when both sensors match. XOR output disconnected.',
    fault:    'INCIDENT REPORT: XOR gate output wire disconnected at junction C-14 — date unknown. Disagreement detection offline for estimated 22 days. Current sensor values: both HIGH (sensors agree), calibration flag not required.',
    dispatch: 'Restore XOR circuit: wire both sensors into XOR gate, XOR output to calibration flag. Confirm XNOR circuit is intact — sensors agreement indicator should read active.',
    success:  'XOR disagreement detection restored. XNOR agreement indicator confirmed nominal. WO-0053 closed by Alpha Shift.',
    lore:     'The XOR gate is the disagreement detector. It fires when inputs differ — exactly what you want for a parity check or a sensor comparison. The XNOR is its complement: it fires when inputs agree. Together they answer one question: are these two signals the same? Parity bits in data transmission, error detection in memory arrays, sensor validation — XOR is at the heart of all of it.',
  },

  phases: {
    work: {
      hint: 'XOR: HIGH when sensors differ. XNOR: HIGH when sensors match. Both sensors HIGH → XOR off, XNOR on.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { sensA: true, sensB: true, sensA2: true, sensB2: true },
    },
    break: {
      hint: 'XOR output wire is missing. Calibration flag has no signal — sensor disagreements go undetected.',
      faultNodeId: 'xor1',
      nodes: NODES_FULL,
      inputs: { sensA: true, sensB: true, sensA2: true, sensB2: true },
      wires: [
        { id: 'x1', from: { nodeId: 'sensA',  pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 0 } },
        { id: 'x2', from: { nodeId: 'sensB',  pin: 'output' }, to: { nodeId: 'xor1',  pin: 'input', index: 1 } },
        { id: 'x3', from: { nodeId: 'xor1',  pin: 'output' }, to: { nodeId: 'calib', pin: 'input', index: 0 }, broken: true },
        { id: 'xn1', from: { nodeId: 'sensA2', pin: 'output' }, to: { nodeId: 'xnor1', pin: 'input', index: 0 } },
        { id: 'xn2', from: { nodeId: 'sensB2', pin: 'output' }, to: { nodeId: 'xnor1', pin: 'input', index: 1 } },
        { id: 'xn3', from: { nodeId: 'xnor1', pin: 'output' }, to: { nodeId: 'agree', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Wire both sensors into the XOR gate → calibration flag. Then wire the same sensors into the XNOR gate → agreement indicator. Two separate circuits, same inputs.',
      nodes: [
        { id: 'sensA',  type: 'INPUT',  x: 60,  y: 90,  scale: 1,   locked: false },
        { id: 'sensB',  type: 'INPUT',  x: 60,  y: 210, scale: 1,   locked: false },
        { id: 'xor1',  type: 'XOR',    x: 220, y: 120, scale: 1.2, locked: false },
        { id: 'calib', type: 'OUTPUT', x: 440, y: 160, scale: 1 },
        { id: 'sensA2', type: 'INPUT',  x: 60,  y: 340, scale: 1,   locked: false },
        { id: 'sensB2', type: 'INPUT',  x: 60,  y: 455, scale: 1,   locked: false },
        { id: 'xnor1', type: 'XNOR',   x: 220, y: 370, scale: 1.2, locked: false },
        { id: 'agree', type: 'OUTPUT', x: 440, y: 410, scale: 1 },
      ],
      inputs: { sensA: false, sensB: false, sensA2: false, sensB2: false },
      wires: [],
    },
  },
}