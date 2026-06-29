/**
 * Unit V - Lesson 04 -- EPROM / Flash Cell (Field-Programmable ROM)
 *
 * Narrative context:
 *   Work Order WO-0304 -- Deck 2, Central Memory Bank, Firmware Bank B.
 *   Unlike the boot ROM, firmware bank B is field-reprogrammable: each
 *   stored bit is normally driven by its fixed ROM term, but a PGM line
 *   can force a new value in through PROG_DATA, and an ERASE line can
 *   clear the cell back to its blank (0) state -- modeling a floating
 *   gate that can be charged (programmed) or discharged (erased)
 *   independently of normal reads.
 *   Fault: the PGM and ERASE lines have been swapped at the override
 *   gates. Attempting to program a cell instead erases it, and the
 *   erase cycle instead force-writes PROG_DATA. Firmware updates are
 *   silently corrupting themselves.
 *   Player swaps the two control lines back to their correct gates.
 *
 * Engineering framing:
 *   bit = OR( storedTerm AND NOT(ERASE), PGM AND PROG_DATA )
 *   storedTerm is the fixed ROM contribution for this cell (modeled
 *   here as a constant-style INPUT representing the cell's burned-in
 *   default). ERASE forces the stored contribution to zero. PGM, when
 *   asserted, overrides the cell with PROG_DATA regardless of the
 *   stored term or erase state. This is a simplified model of how
 *   floating-gate cells support both UV/electrical erase and targeted
 *   programming without needing to replace the whole chip.
 */

const NODES_FULL = [
  { id: 'STORED',    type: 'INPUT',  x: 50,  y: 60,  scale: 1 },
  { id: 'ERASE',     type: 'INPUT',  x: 50,  y: 200, scale: 1 },
  { id: 'PGM',       type: 'INPUT',  x: 50,  y: 340, scale: 1 },
  { id: 'PROG_DATA', type: 'INPUT',  x: 50,  y: 480, scale: 1 },

  { id: 'notErase',  type: 'NOT',    x: 200, y: 200, scale: 1 },

  { id: 'andStored', type: 'AND',    x: 350, y: 110, scale: 1.1 },
  { id: 'andProg',   type: 'AND',    x: 350, y: 410, scale: 1.1 },

  { id: 'orBit',     type: 'OR',     x: 530, y: 250, scale: 1.1 },

  { id: 'BIT',       type: 'OUTPUT', x: 700, y: 250, scale: 1 },
]

const WIRES_FULL = [
  { id: 'e1', from: { nodeId: 'ERASE',     pin: 'output' }, to: { nodeId: 'notErase',  pin: 'input', index: 0 } },

  { id: 'e2', from: { nodeId: 'STORED',    pin: 'output' }, to: { nodeId: 'andStored', pin: 'input', index: 0 } },
  { id: 'e3', from: { nodeId: 'notErase',  pin: 'output' }, to: { nodeId: 'andStored', pin: 'input', index: 1 } },

  { id: 'e4', from: { nodeId: 'PGM',       pin: 'output' }, to: { nodeId: 'andProg',   pin: 'input', index: 0 } },
  { id: 'e5', from: { nodeId: 'PROG_DATA', pin: 'output' }, to: { nodeId: 'andProg',   pin: 'input', index: 1 } },

  { id: 'e6', from: { nodeId: 'andStored', pin: 'output' }, to: { nodeId: 'orBit',     pin: 'input', index: 0 } },
  { id: 'e7', from: { nodeId: 'andProg',   pin: 'output' }, to: { nodeId: 'orBit',     pin: 'input', index: 1 } },

  { id: 'e8', from: { nodeId: 'orBit',     pin: 'output' }, to: { nodeId: 'BIT',       pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-04',
    title:       'EPROM / Flash Cell',
    unit:        5,
    lessonIndex: 3,
    concept:     'EPROM_FLASH',
    panels:      ['truth'],
    workOrder:   'WO-0304',
    location:    'Deck 2 - Central Memory Bank -- Firmware Bank B',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Firmware bank B is supposed to be field-reprogrammable -- normally it reads back its stored term, but asserting PGM should force in new data from PROG_DATA, and asserting ERASE should clear the cell back to blank. Last firmware push went sideways: every cell we tried to program got erased instead, and the erase pass before that accidentally force-wrote leftover PROG_DATA into half the bank.\n\nI found it. PGM and ERASE are swapped at the override gates. The line labeled PGM is actually wired to the NOT gate that should be gated by ERASE, and the line labeled ERASE is wired into the AND gate that should be gated by PGM. So 'program' silently zeroes the cell, and 'erase' silently force-writes garbage.\n\nSwap them back: ERASE into the NOT-gate path that suppresses the stored term, PGM into the AND-gate path that gates PROG_DATA through. Once that's right, programming and erasing will finally do what their names say.",
    briefing: 'PGM and ERASE control lines are swapped at the override stage. Programming a cell erases it; erasing force-writes PROG_DATA. Firmware updates corrupt themselves.',
    fault:    'INCIDENT REPORT: Firmware Bank B override junction F-22 -- PGM wired into notErase input, ERASE wired into andProg input[0]. Program and erase control paths reversed from schematic.',
    dispatch: 'Disconnect PGM from notErase; reconnect ERASE to notErase input[0]. Disconnect ERASE from andProg; reconnect PGM to andProg input[0]. Verify: ERASE=1 forces BIT toward 0 (absent PGM); PGM=1 with PROG_DATA=1 forces BIT=1 regardless of STORED.',
    success:  'PGM and ERASE control paths corrected. Programming now writes PROG_DATA; erasing now clears the stored term. Firmware Bank B reprogramming verified. WO-0304 closed by Gamma Shift.',
    lore:     "The earliest EPROMs were erased by removing the chip and exposing a quartz window over the die to UV light for several minutes -- a genuinely physical, out-of-circuit ritual that knocked stored charge off the floating gate. Electrically-erasable EPROM (EEPROM) and then Flash replaced that with an in-circuit high-voltage pulse, and Flash further organized erasure into large blocks rather than single bytes, trading fine-grained control for speed and density. Every USB stick and SSD today is descended directly from that floating-gate idea: a transistor with an extra, electrically isolated gate that holds charge -- and therefore holds a bit -- with no power applied at all.",
  },

  phases: {
    work: {
      hint: 'BIT = OR( AND(STORED, NOT(ERASE)), AND(PGM, PROG_DATA) ). ERASE suppresses the stored term. PGM overrides with PROG_DATA.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { STORED: true, ERASE: false, PGM: false, PROG_DATA: false },
    },
    break: {
      hint: 'PGM feeds the ERASE-suppression NOT gate, and ERASE feeds the PGM-override AND gate. The two control lines have traded places.',
      faultNodeId: 'orBit',
      nodes: NODES_FULL,
      inputs: { STORED: true, ERASE: false, PGM: false, PROG_DATA: false },
      wires: [
        { id: 'e1', from: { nodeId: 'PGM',       pin: 'output' }, to: { nodeId: 'notErase',  pin: 'input', index: 0 }, broken: true },
        { id: 'e2', from: { nodeId: 'STORED',    pin: 'output' }, to: { nodeId: 'andStored', pin: 'input', index: 0 } },
        { id: 'e3', from: { nodeId: 'notErase',  pin: 'output' }, to: { nodeId: 'andStored', pin: 'input', index: 1 } },
        { id: 'e4', from: { nodeId: 'ERASE',     pin: 'output' }, to: { nodeId: 'andProg',   pin: 'input', index: 0 }, broken: true },
        { id: 'e5', from: { nodeId: 'PROG_DATA', pin: 'output' }, to: { nodeId: 'andProg',   pin: 'input', index: 1 } },
        { id: 'e6', from: { nodeId: 'andStored', pin: 'output' }, to: { nodeId: 'orBit',     pin: 'input', index: 0 } },
        { id: 'e7', from: { nodeId: 'andProg',   pin: 'output' }, to: { nodeId: 'orBit',     pin: 'input', index: 1 } },
        { id: 'e8', from: { nodeId: 'orBit',     pin: 'output' }, to: { nodeId: 'BIT',       pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'NOT(ERASE) gates STORED through andStored. PGM gates PROG_DATA through andProg. Both AND outputs OR together into BIT.',
      nodes: [
        { id: 'STORED',    type: 'INPUT',  x: 50,  y: 60,  scale: 1,   locked: false },
        { id: 'ERASE',     type: 'INPUT',  x: 50,  y: 200, scale: 1,   locked: false },
        { id: 'PGM',       type: 'INPUT',  x: 50,  y: 340, scale: 1,   locked: false },
        { id: 'PROG_DATA', type: 'INPUT',  x: 50,  y: 480, scale: 1,   locked: false },
        { id: 'notErase',  type: 'NOT',    x: 200, y: 200, scale: 1,   locked: false },
        { id: 'andStored', type: 'AND',    x: 350, y: 110, scale: 1.1, locked: false },
        { id: 'andProg',   type: 'AND',    x: 350, y: 410, scale: 1.1, locked: false },
        { id: 'orBit',     type: 'OR',     x: 530, y: 250, scale: 1.1, locked: false },
        { id: 'BIT',       type: 'OUTPUT', x: 700, y: 250, scale: 1 },
      ],
      inputs: { STORED: true, ERASE: false, PGM: false, PROG_DATA: false },
      wires: [],
    },
  },
}