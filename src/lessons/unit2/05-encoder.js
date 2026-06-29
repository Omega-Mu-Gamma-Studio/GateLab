/**
 * Unit II · Lesson 05 — Priority Encoder
 *
 * Narrative context:
 *   Work Order WO-0064 — Deck 11, Crew Alert Panel.
 *   The crew alert system takes priority inputs from four emergency buttons
 *   (D0–D3, D3 = highest priority) and encodes the active highest-priority
 *   button into a 2-bit binary code (A1, A0) sent to the alert router.
 *   A broken solder joint severed the D2 line feeding the encoder OR gate —
 *   D2 alerts are silently dropped. The alert panel shows D2 lit, the
 *   encoded output shows something else.
 *
 * Engineering framing:
 *   4-to-2 priority encoder: highest active input → binary code.
 *   D0=00, D1=01, D2=10, D3=11.
 *   A1 = D2 + D3. A0 = D1 + D3. (simplified, no validity output)
 *   OR gates implement the encoding equations.
 *   "Priority" means D3 overrides D2 overrides D1 overrides D0.
 */

const NODES_FULL = [
  { id: 'd0',  type: 'INPUT',  x: 60,  y: 60,  scale: 1 },
  { id: 'd1',  type: 'INPUT',  x: 60,  y: 160, scale: 1 },
  { id: 'd2',  type: 'INPUT',  x: 60,  y: 280, scale: 1 },
  { id: 'd3',  type: 'INPUT',  x: 60,  y: 400, scale: 1 },
  { id: 'orA1', type: 'OR',   x: 250, y: 295, scale: 1.2 },
  { id: 'orA0', type: 'OR',   x: 250, y: 160, scale: 1.2 },
  { id: 'a1',  type: 'OUTPUT', x: 460, y: 320, scale: 1 },
  { id: 'a0',  type: 'OUTPUT', x: 460, y: 185, scale: 1 },
]

const WIRES_FULL = [
  // A1 = D2 + D3
  { id: 'e1', from: { nodeId: 'd2',   pin: 'output' }, to: { nodeId: 'orA1', pin: 'input', index: 0 } },
  { id: 'e2', from: { nodeId: 'd3',   pin: 'output' }, to: { nodeId: 'orA1', pin: 'input', index: 1 } },
  // A0 = D1 + D3
  { id: 'e3', from: { nodeId: 'd1',   pin: 'output' }, to: { nodeId: 'orA0', pin: 'input', index: 0 } },
  { id: 'e4', from: { nodeId: 'd3',   pin: 'output' }, to: { nodeId: 'orA0', pin: 'input', index: 1 } },
  // Outputs
  { id: 'e5', from: { nodeId: 'orA1', pin: 'output' }, to: { nodeId: 'a1',   pin: 'input', index: 0 } },
  { id: 'e6', from: { nodeId: 'orA0', pin: 'output' }, to: { nodeId: 'a0',   pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit2-05',
    title:       'Priority Encoder',
    unit:        2,
    lessonIndex: 4,
    concept:     'ENCODER',
    panels:      ['verilog'],
    workOrder:   'WO-0064',
    location:    'Deck 11 · Crew Alert Panel',
    shift:       'Beta Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Moving off Deck 9. Alert panel on Deck 11 is the next call.\n\nFour emergency buttons — D0 through D3. D3 is critical, highest priority. When someone hits a button, the panel encodes the highest active priority into a 2-bit code and sends it to the alert router. Router decides the response.\n\nD2 is Radiation Alert. The solder joint connecting D2 to the encoder OR gate cracked during last week's vibration event. D2 button lights up fine — indicator circuit is separate. The encoder never sees it. Radiation alerts are being silently dropped.",
    briefing: '4-to-2 priority encoder, alert panel. D2 input wire broken at encoder junction. A1 output (which requires D2 or D3) shows LOW when only D2 is active. D3 still works — D2 is silent.',
    fault:    'INCIDENT REPORT: Solder fracture at encoder junction AE-2. D2 line to OR-A1 gate severed. Radiation alert (D2) not encoded. A1 bit reads LOW on D2-only events. Alert routing invalid for radiation class.',
    dispatch: 'Restore D2 wire to OR-A1 gate input[0]. Confirm A1 = D2 OR D3. Confirm A0 = D1 OR D3. D0 is not connected to encoder outputs — it is the null/default code 00.',
    success:  'D2 encoder line restored. Radiation alert encoding operational. WO-0064 closed by Beta Shift.',
    lore:     'An encoder converts a one-hot (one-of-N active) input into a compact binary code. The equations are just OR trees: A1 is HIGH whenever any input whose code has a 1 in the A1 position is active. Priority encoders add a twist — when multiple inputs are active simultaneously, only the highest-priority one determines the output. Real implementations add a priority arbitration layer above the OR tree. This simplified version assumes mutually exclusive inputs, which is fine for panel buttons that mechanically interlock.',
  },

  phases: {
    work: {
      hint: 'A1 = D2 OR D3. A0 = D1 OR D3. D0 produces code 00 by default — not connected to any OR gate.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { d0: false, d1: false, d2: true, d3: false },
    },
    break: {
      hint: 'D2 wire broken. A1 stays LOW even when D2 is active. D3 still drives A1 correctly.',
      faultNodeId: 'orA1',
      nodes: NODES_FULL,
      inputs: { d0: false, d1: false, d2: true, d3: false },
      wires: [
        { id: 'e1', from: { nodeId: 'd2',   pin: 'output' }, to: { nodeId: 'orA1', pin: 'input', index: 0 }, broken: true },
        { id: 'e2', from: { nodeId: 'd3',   pin: 'output' }, to: { nodeId: 'orA1', pin: 'input', index: 1 } },
        { id: 'e3', from: { nodeId: 'd1',   pin: 'output' }, to: { nodeId: 'orA0', pin: 'input', index: 0 } },
        { id: 'e4', from: { nodeId: 'd3',   pin: 'output' }, to: { nodeId: 'orA0', pin: 'input', index: 1 } },
        { id: 'e5', from: { nodeId: 'orA1', pin: 'output' }, to: { nodeId: 'a1',   pin: 'input', index: 0 } },
        { id: 'e6', from: { nodeId: 'orA0', pin: 'output' }, to: { nodeId: 'a0',   pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Two OR gates. A1 gate: D2 and D3 as inputs. A0 gate: D1 and D3 as inputs. D0 is not wired to anything.',
      nodes: [
        { id: 'd0',   type: 'INPUT',  x: 60,  y: 60,  scale: 1,   locked: false },
        { id: 'd1',   type: 'INPUT',  x: 60,  y: 160, scale: 1,   locked: false },
        { id: 'd2',   type: 'INPUT',  x: 60,  y: 280, scale: 1,   locked: false },
        { id: 'd3',   type: 'INPUT',  x: 60,  y: 400, scale: 1,   locked: false },
        { id: 'orA1', type: 'OR',    x: 250, y: 295, scale: 1.2, locked: false },
        { id: 'orA0', type: 'OR',    x: 250, y: 160, scale: 1.2, locked: false },
        { id: 'a1',  type: 'OUTPUT', x: 460, y: 320, scale: 1 },
        { id: 'a0',  type: 'OUTPUT', x: 460, y: 185, scale: 1 },
      ],
      inputs: { d0: false, d1: false, d2: false, d3: false },
      wires: [],
    },
  },
}