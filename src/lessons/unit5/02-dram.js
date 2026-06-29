/**
 * Unit V - Lesson 02 -- Dynamic RAM Cell (DRAM) and the Refresh Path
 *
 * Narrative context:
 *   Work Order WO-0302 -- Deck 2, Central Memory Bank, Bulk Storage Array.
 *   The bulk array uses a simplified storage cell that, unlike the
 *   register file's SRAM, depends on a periodic REFRESH pulse to keep
 *   its value alive -- modeling a real DRAM cell's leaking storage
 *   capacitor. The REFRESH line is supposed to re-assert the cell's
 *   own current output back through the write path on every pulse.
 *   Fault: REFRESH has been wired directly into the write-gating stage
 *   in place of WE, instead of being OR-combined with WE. Every refresh
 *   pulse now behaves as an unconditional write of whatever is sitting
 *   on D -- silently overwriting live data with garbage during refresh.
 *   Player restores the OR-combination of WE and REFRESH.
 *
 * Engineering framing:
 *   This cell is logically the same gated D-latch as the SRAM lesson,
 *   but the gating stage is driven by WEeff = OR(WE, REFRESH) instead
 *   of WE alone. During REFRESH, WEeff must briefly enable the gate so
 *   the latch can re-write its OWN current value back into itself
 *   (modeled here by feeding Q back to D during refresh) -- compensating
 *   for the charge leakage a real DRAM capacitor would suffer. If
 *   REFRESH bypasses WE entirely and gates raw D through, any external
 *   data sitting on D corrupts the cell on every refresh cycle instead
 *   of preserving it.
 */

const NODES_FULL = [
  { id: 'D',       type: 'INPUT',  x: 50,  y: 70,  scale: 1 },
  { id: 'WE',      type: 'INPUT',  x: 50,  y: 230, scale: 1 },
  { id: 'REFRESH', type: 'INPUT',  x: 50,  y: 400, scale: 1 },

  { id: 'orWE',    type: 'OR',     x: 200, y: 320, scale: 1 },

  { id: 'notD',    type: 'NOT',    x: 250, y: 480, scale: 1 },

  { id: 'nand1',   type: 'NAND',   x: 380, y: 110, scale: 1.1 },
  { id: 'nand2',   type: 'NAND',   x: 380, y: 480, scale: 1.1 },

  { id: 'nand3',   type: 'NAND',   x: 550, y: 130, scale: 1.1 },
  { id: 'nand4',   type: 'NAND',   x: 550, y: 460, scale: 1.1 },

  { id: 'Q',       type: 'OUTPUT', x: 720, y: 150, scale: 1 },
  { id: 'Qbar',    type: 'OUTPUT', x: 720, y: 470, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1',  from: { nodeId: 'WE',      pin: 'output' }, to: { nodeId: 'orWE',  pin: 'input', index: 0 } },
  { id: 'w2',  from: { nodeId: 'REFRESH', pin: 'output' }, to: { nodeId: 'orWE',  pin: 'input', index: 1 } },

  { id: 'w3',  from: { nodeId: 'D',       pin: 'output' }, to: { nodeId: 'notD',  pin: 'input', index: 0 } },

  { id: 'w4',  from: { nodeId: 'D',       pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  { id: 'w5',  from: { nodeId: 'orWE',    pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },

  { id: 'w6',  from: { nodeId: 'notD',    pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  { id: 'w7',  from: { nodeId: 'orWE',    pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },

  { id: 'w8',  from: { nodeId: 'nand1',   pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
  { id: 'w9',  from: { nodeId: 'nand4',   pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
  { id: 'w10', from: { nodeId: 'nand2',   pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
  { id: 'w11', from: { nodeId: 'nand3',   pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },

  { id: 'w12', from: { nodeId: 'nand3',   pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  { id: 'w13', from: { nodeId: 'nand4',   pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-02',
    title:       'Dynamic RAM Cell',
    unit:        5,
    lessonIndex: 1,
    concept:     'DRAM',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0302',
    location:    'Deck 2 - Central Memory Bank -- Bulk Storage Array',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Bulk storage array is bleeding data every refresh cycle. The array's cells aren't static like the register file -- they're built to model a leaking capacitor, so they need a REFRESH pulse on a timer just to stay alive. That refresh is supposed to be gentle: briefly open the gate, let the cell's own output flow back into itself, close the gate again. No external data should touch the cell during refresh.\n\nInstead, REFRESH is wired straight into the gating stage in place of WE. WE doesn't even reach the gates anymore. So every refresh pulse just gates whatever happens to be sitting on the live D line straight into the cell -- and on the bulk array, D is usually garbage between writes. Refresh isn't preserving the data, it's overwriting it.\n\nWE and REFRESH both need to reach the gating stage, OR'd together -- either one should be able to open the gate. Restore the OR gate's connection and wire its output, not REFRESH directly, into both nand1 and nand2's enable inputs.",
    briefing: 'DRAM cell gating stage reads REFRESH directly instead of OR(WE, REFRESH). WE is disconnected from the gate entirely. Every refresh pulse overwrites the cell with whatever is on D.',
    fault:    'INCIDENT REPORT: DRAM cell gating stage at junction B-04 -- REFRESH wired directly to nand1/nand2 enable inputs, bypassing the WE-OR-REFRESH combiner. WE input is orphaned. Refresh cycles are destructive instead of restorative.',
    dispatch: 'Wire WE and REFRESH into the OR gate (orWE). Disconnect REFRESH from nand1/nand2 directly. Wire orWE output into both nand1 input[1] and nand2 input[1]. Verify a REFRESH pulse with WE=0 does not change Q when D differs from Q.',
    success:  'Gating stage restored to OR(WE, REFRESH). Refresh pulses no longer destructive. Bulk storage array holding data across refresh cycles as designed. WO-0302 closed by Gamma Shift.',
    lore:     "Real DRAM stores a bit as charge on a tiny capacitor accessed through a single transistor -- one transistor and one capacitor per bit, versus SRAM's six transistors. That density is why DRAM, not SRAM, fills the gigabytes of main memory in every computer. The cost is that the capacitor leaks; left alone, a DRAM cell forgets its value in milliseconds. A memory controller has to read and rewrite -- refresh -- every row of the entire array continuously, thousands of times a second, just so the data continues to exist. It is, in a very literal sense, a kind of memory that has to keep reminding itself what it remembers.",
  },

  phases: {
    work: {
      hint: 'WE and REFRESH feed an OR gate. The OR output gates D / D-bar into nand1/nand2, which cross-couple into nand3/nand4. Either WE or REFRESH can open the gate.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { D: true, WE: false, REFRESH: false },
    },
    break: {
      hint: 'REFRESH is wired directly into the gating NANDs, bypassing the OR combiner. WE has no path to the gate at all. Refresh pulses gate raw D through, overwriting the cell.',
      faultNodeId: 'nand1',
      nodes: NODES_FULL,
      inputs: { D: true, WE: false, REFRESH: false },
      wires: [
        { id: 'w1',  from: { nodeId: 'WE',      pin: 'output' }, to: { nodeId: 'orWE',  pin: 'input', index: 0 } },
        { id: 'w2',  from: { nodeId: 'REFRESH', pin: 'output' }, to: { nodeId: 'orWE',  pin: 'input', index: 1 } },
        { id: 'w3',  from: { nodeId: 'D',       pin: 'output' }, to: { nodeId: 'notD',  pin: 'input', index: 0 } },
        { id: 'w4',  from: { nodeId: 'D',       pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w5',  from: { nodeId: 'REFRESH', pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 }, broken: true },
        { id: 'w6',  from: { nodeId: 'notD',    pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
        { id: 'w7',  from: { nodeId: 'REFRESH', pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 }, broken: true },
        { id: 'w8',  from: { nodeId: 'nand1',   pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
        { id: 'w9',  from: { nodeId: 'nand4',   pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
        { id: 'w10', from: { nodeId: 'nand2',   pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
        { id: 'w11', from: { nodeId: 'nand3',   pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
        { id: 'w12', from: { nodeId: 'nand3',   pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w13', from: { nodeId: 'nand4',   pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'OR(WE, REFRESH) drives the gating stage. D feeds nand1 directly and notD (via a NOT) feeds nand2. Both gates take the OR output as their second input.',
      nodes: [
        { id: 'D',       type: 'INPUT',  x: 50,  y: 70,  scale: 1,   locked: false },
        { id: 'WE',      type: 'INPUT',  x: 50,  y: 230, scale: 1,   locked: false },
        { id: 'REFRESH', type: 'INPUT',  x: 50,  y: 400, scale: 1,   locked: false },
        { id: 'orWE',    type: 'OR',     x: 200, y: 320, scale: 1,   locked: false },
        { id: 'notD',    type: 'NOT',    x: 250, y: 480, scale: 1,   locked: false },
        { id: 'nand1',   type: 'NAND',   x: 380, y: 110, scale: 1.1, locked: false },
        { id: 'nand2',   type: 'NAND',   x: 380, y: 480, scale: 1.1, locked: false },
        { id: 'nand3',   type: 'NAND',   x: 550, y: 130, scale: 1.1, locked: false },
        { id: 'nand4',   type: 'NAND',   x: 550, y: 460, scale: 1.1, locked: false },
        { id: 'Q',       type: 'OUTPUT', x: 720, y: 150, scale: 1 },
        { id: 'Qbar',    type: 'OUTPUT', x: 720, y: 470, scale: 1 },
      ],
      inputs: { D: true, WE: false, REFRESH: false },
      wires: [],
    },
  },
}