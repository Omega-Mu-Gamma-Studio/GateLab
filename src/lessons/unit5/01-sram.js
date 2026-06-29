/**
 * Unit V · Lesson 01 — Static RAM Cell (SRAM)
 *
 * Narrative context:
 *   Work Order WO-0301 — Deck 2, Central Memory Bank, Register File Block.
 *   A single-bit storage cell in the fast register file is dropping its
 *   held value the instant the write-enable line goes idle. The cell
 *   should latch D and hold it indefinitely once WE drops, but instead
 *   it keeps tracking D — it never actually stops writing.
 *   Fault: the WE line is wired into only one of the two gating NAND
 *   gates; the second gating gate has its WE input wired from D instead.
 *   The cell never disengages from the input — it behaves as a
 *   transparent latch instead of a static, edge-isolated storage cell.
 *   Player rewires the second gate's enable input back to WE.
 *
 * Engineering framing:
 *   A 6-transistor SRAM cell is, at the logic level, a gated D-latch:
 *   two NAND gates form the write-enable gating stage (D and WE -> nand1,
 *   D-bar and WE -> nand2), feeding a cross-coupled NAND latch core
 *   (nand3, nand4) that holds Q once WE goes LOW. Unlike DRAM, there is
 *   no decay and no refresh -- as long as power is applied, the
 *   cross-coupled pair holds its state with zero external intervention.
 *   That's what "static" means in Static RAM.
 */

const NODES_FULL = [
  { id: 'D',     type: 'INPUT',  x: 50,  y: 90,  scale: 1 },
  { id: 'WE',    type: 'INPUT',  x: 50,  y: 320, scale: 1 },

  { id: 'notD',  type: 'NOT',    x: 190, y: 280, scale: 1 },

  { id: 'nand1', type: 'NAND',   x: 330, y: 90,  scale: 1.1 },
  { id: 'nand2', type: 'NAND',   x: 330, y: 300, scale: 1.1 },

  { id: 'nand3', type: 'NAND',   x: 500, y: 110, scale: 1.1 },
  { id: 'nand4', type: 'NAND',   x: 500, y: 280, scale: 1.1 },

  { id: 'Q',     type: 'OUTPUT', x: 670, y: 140, scale: 1 },
  { id: 'Qbar',  type: 'OUTPUT', x: 670, y: 300, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'notD',  pin: 'input', index: 0 } },

  { id: 'w2',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  { id: 'w3',  from: { nodeId: 'WE',    pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },

  { id: 'w4',  from: { nodeId: 'notD',  pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  { id: 'w5',  from: { nodeId: 'WE',    pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },

  { id: 'w6',  from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
  { id: 'w7',  from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
  { id: 'w8',  from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
  { id: 'w9',  from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },

  { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
  { id: 'w11', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-01',
    title:       'Static RAM Cell',
    unit:        5,
    lessonIndex: 0,
    concept:     'SRAM',
    panels:      ['timing', 'state'],
    workOrder:   'WO-0301',
    location:    'Deck 2 - Central Memory Bank -- Register File Block',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Register file block is corrupting values the moment a write cycle ends. We write a bit, WE drops, and the cell should hold that bit forever -- that's the entire point of a register. Instead, the stored value keeps drifting with whatever's sitting on the D line, like the cell never actually let go.\n\nI pulled the cell schematic. This is a gated D-latch: D and WE feed one NAND gate, D-bar and WE feed a second NAND gate, and those two feed a cross-coupled NAND latch that's supposed to hold Q once WE goes LOW. But the second gate isn't reading WE at all -- it's reading D again. WE only controls half the gating stage. The cell can never fully disengage from the input.\n\nReconnect the second gate's enable input to WE. Once both gating NANDs are properly controlled by WE, the cell will latch on WE=1 and hold rock-solid on WE=0 -- exactly like static memory is supposed to.",
    briefing: 'Register file SRAM cell fails to hold state after WE drops to 0. Second gating NAND gate has WE input miswired to D instead of WE -- cell stays transparent at all times.',
    fault:    'INCIDENT REPORT: SRAM cell gating stage at junction M-12 -- nand2 input[1] sourced from D output instead of WE input. Cell never disengages from D regardless of write-enable state. No static hold achieved.',
    dispatch: 'Disconnect nand2 input[1] from D. Reconnect nand2 input[1] to WE. Verify: with WE=1, Q tracks D. With WE=0, Q holds its last value regardless of further changes to D.',
    success:  'Gating stage corrected -- both nand1 and nand2 now properly controlled by WE. Cell writes only while WE=1 and holds indefinitely while WE=0. Register file block stable. WO-0301 closed by Gamma Shift.',
    lore:     "Six-transistor SRAM is the fastest, most expensive form of electronic memory -- it's what fills CPU cache, because every cell is a self-contained, instantly-readable latch with no decay and no refresh cycle. The cost is density: six transistors per bit is a lot of silicon. DRAM trades that latch for a single transistor and a capacitor, accepting decay in exchange for packing thousands of times more bits into the same area. Every memory hierarchy in a real computer -- registers, cache, RAM, disk -- is a tradeoff curve between SRAM's speed and DRAM's density, with nothing in between.",
  },

  phases: {
    work: {
      hint: 'D and WE -> nand1. D-bar and WE -> nand2. nand1/nand2 -> cross-coupled nand3/nand4 latch. WE=1 writes D through; WE=0 holds Q.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { D: true, WE: false },
    },
    break: {
      hint: 'nand2 is reading D instead of WE on its second input. The cell never stops tracking D, even when WE is LOW -- there is no static hold.',
      faultNodeId: 'nand2',
      nodes: NODES_FULL,
      inputs: { D: true, WE: false },
      wires: [
        { id: 'w1',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'notD',  pin: 'input', index: 0 } },
        { id: 'w2',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w3',  from: { nodeId: 'WE',    pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
        { id: 'w4',  from: { nodeId: 'notD',  pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
        { id: 'w5',  from: { nodeId: 'D',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 }, broken: true },
        { id: 'w6',  from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 0 } },
        { id: 'w7',  from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'nand3', pin: 'input', index: 1 } },
        { id: 'w8',  from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 0 } },
        { id: 'w9',  from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'nand4', pin: 'input', index: 1 } },
        { id: 'w10', from: { nodeId: 'nand3', pin: 'output' }, to: { nodeId: 'Q',    pin: 'input', index: 0 } },
        { id: 'w11', from: { nodeId: 'nand4', pin: 'output' }, to: { nodeId: 'Qbar', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'D feeds nand1 directly and notD via a NOT gate into nand2. WE feeds both nand1 and nand2 second inputs. nand1/nand2 cross-couple into nand3/nand4.',
      nodes: [
        { id: 'D',     type: 'INPUT',  x: 50,  y: 90,  scale: 1,   locked: false },
        { id: 'WE',    type: 'INPUT',  x: 50,  y: 320, scale: 1,   locked: false },
        { id: 'notD',  type: 'NOT',    x: 190, y: 280, scale: 1,   locked: false },
        { id: 'nand1', type: 'NAND',   x: 330, y: 90,  scale: 1.1, locked: false },
        { id: 'nand2', type: 'NAND',   x: 330, y: 300, scale: 1.1, locked: false },
        { id: 'nand3', type: 'NAND',   x: 500, y: 110, scale: 1.1, locked: false },
        { id: 'nand4', type: 'NAND',   x: 500, y: 280, scale: 1.1, locked: false },
        { id: 'Q',     type: 'OUTPUT', x: 670, y: 140, scale: 1 },
        { id: 'Qbar',  type: 'OUTPUT', x: 670, y: 300, scale: 1 },
      ],
      inputs: { D: true, WE: false },
      wires: [],
    },
  },
}