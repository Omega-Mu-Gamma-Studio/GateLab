/**
 * Unit V - Lesson 03 -- Read-Only Memory (Mask ROM)
 *
 * Narrative context:
 *   Work Order WO-0303 -- Deck 2, Central Memory Bank, Boot ROM Array.
 *   The boot ROM stores four fixed 2-bit words, selected by a 2-to-4
 *   address decoder, then read out through a fixed OR-matrix that is
 *   permanently wired at fabrication time -- there is no write path at
 *   all, by design. Address 3 is returning the wrong word during boot,
 *   causing the startup sequence to load the wrong stage-2 loader.
 *   Fault: the OR-matrix wire for the high output bit at address 3 has
 *   been connected to the decoder line for address 2 instead, so two
 *   different addresses now read back the same bit pattern on that line.
 *   Player reconnects the matrix wire to the correct decoder line.
 *
 * Engineering framing:
 *   Mask ROM is conceptually a decoder plus a fixed wiring matrix: the
 *   decoder selects exactly one address line HIGH, and each output bit
 *   is the OR of every address line whose stored word has a 1 in that
 *   bit position. There is no AND array, no programmable array, no
 *   write path -- the "program" is the physical wiring pattern burned
 *   into the mask during manufacturing. Stored words here:
 *     Address 0 -> 01      Address 1 -> 11
 *     Address 2 -> 00      Address 3 -> 10
 */

const NODES_FULL = [
  { id: 'a1',    type: 'INPUT',  x: 50,  y: 80,  scale: 1 },
  { id: 'a0',    type: 'INPUT',  x: 50,  y: 220, scale: 1 },

  { id: 'notA1', type: 'NOT',    x: 170, y: 80,  scale: 1 },
  { id: 'notA0', type: 'NOT',    x: 170, y: 220, scale: 1 },

  { id: 'and0',  type: 'AND',    x: 320, y: 60,  scale: 1 },
  { id: 'and1',  type: 'AND',    x: 320, y: 180, scale: 1 },
  { id: 'and2',  type: 'AND',    x: 320, y: 300, scale: 1 },
  { id: 'and3',  type: 'AND',    x: 320, y: 420, scale: 1 },

  { id: 'orBit1', type: 'OR',    x: 500, y: 130, scale: 1.1 },
  { id: 'orBit0', type: 'OR',    x: 500, y: 350, scale: 1.1 },

  { id: 'bit1',  type: 'OUTPUT', x: 670, y: 130, scale: 1 },
  { id: 'bit0',  type: 'OUTPUT', x: 670, y: 350, scale: 1 },
]

const WIRES_FULL = [
  { id: 'r1',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'notA1', pin: 'input', index: 0 } },
  { id: 'r2',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'notA0', pin: 'input', index: 0 } },

  // decoder: and0..and3 = addresses 0..3
  { id: 'r3',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 0 } },
  { id: 'r4',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 1 } },
  { id: 'r5',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
  { id: 'r6',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
  { id: 'r7',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
  { id: 'r8',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
  { id: 'r9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 0 } },
  { id: 'r10', from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 1 } },

  // fixed OR matrix: word0=01, word1=11, word2=00, word3=10
  // bit1 = and1 OR and3   (words 1 and 3 have a 1 in bit1)
  { id: 'r11', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'orBit1', pin: 'input', index: 0 } },
  { id: 'r12', from: { nodeId: 'and3',  pin: 'output' }, to: { nodeId: 'orBit1', pin: 'input', index: 1 } },
  // bit0 = and0 OR and1   (words 0 and 1 have a 1 in bit0)
  { id: 'r13', from: { nodeId: 'and0',  pin: 'output' }, to: { nodeId: 'orBit0', pin: 'input', index: 0 } },
  { id: 'r14', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'orBit0', pin: 'input', index: 1 } },

  { id: 'r15', from: { nodeId: 'orBit1', pin: 'output' }, to: { nodeId: 'bit1', pin: 'input', index: 0 } },
  { id: 'r16', from: { nodeId: 'orBit0', pin: 'output' }, to: { nodeId: 'bit0', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-03',
    title:       'Mask ROM Array',
    unit:        5,
    lessonIndex: 2,
    concept:     'ROM',
    panels:      ['truth'],
    workOrder:   'WO-0303',
    location:    'Deck 2 - Central Memory Bank -- Boot ROM Array',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Boot sequence is loading the wrong stage-2 loader at address 3. This array stores four fixed words: 01, 11, 00, 10 at addresses 0 through 3. It's mask ROM -- there's no write path anywhere in this circuit, the data is the wiring itself. A decoder picks one address line HIGH, and each output bit is just the OR of every address line whose stored word has a 1 in that position.\n\nI traced the bit1 OR-matrix. It's supposed to OR together the decoder lines for address 1 and address 3 -- those are the only two words with a 1 in the high bit. Instead, one of those matrix wires is connected to address 2's decoder line, which should read 00. Now reading address 3 pulls in address 2's bit1 instead of its own, and reading address 2 incorrectly contributes a 1 it never should.\n\nDisconnect the matrix wire from address 2's decoder output and reconnect it to address 3's. bit1 should then read HIGH only when the decoder selects address 1 or address 3.",
    briefing: 'ROM bit1 output OR-gate has one input wired to the address-2 decoder line instead of address-3. Reading address 3 returns the wrong high bit; address 2 incorrectly affects bit1.',
    fault:    'INCIDENT REPORT: Boot ROM bit1 matrix junction R-09 -- OR gate input wired to and2 (address 2 decoder line) instead of and3 (address 3 decoder line). Stored word at address 3 reads back corrupted.',
    dispatch: 'Disconnect orBit1 input[1] from and2. Reconnect orBit1 input[1] to and3. Verify: address 0 -> 01, address 1 -> 11, address 2 -> 00, address 3 -> 10.',
    success:  'Matrix wire corrected. All four stored words read back correctly. Boot ROM array verified against fabrication mask. WO-0303 closed by Gamma Shift.',
    lore:     "Mask ROM is the purest form of read-only memory: the stored bit pattern is etched directly into the chip's metal interconnect layer during manufacturing. There is no mechanism to change it afterward -- not electrically, not optically, not at all. That permanence made it the standard choice for early game cartridges, BIOS chips, and lookup tables: data that should never, under any circumstance, be alterable in the field. The tradeoff is total inflexibility -- a single bug in the mask means scrapping the entire production run, which is exactly the pressure that eventually drove the industry toward EPROM and Flash.",
  },

  phases: {
    work: {
      hint: 'a1,a0 decode to and0..and3 (one address line HIGH at a time). bit1 = and1 OR and3. bit0 = and0 OR and1. Stored words: 01, 11, 00, 10.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { a1: true, a0: true },
    },
    break: {
      hint: 'orBit1 reads from and2 instead of and3. Address 3 no longer contributes to bit1, and address 2 wrongly does. Compare readback against the stored word table.',
      faultNodeId: 'orBit1',
      nodes: NODES_FULL,
      inputs: { a1: true, a0: true },
      wires: [
        { id: 'r1',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'notA1', pin: 'input', index: 0 } },
        { id: 'r2',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'notA0', pin: 'input', index: 0 } },
        { id: 'r3',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 0 } },
        { id: 'r4',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and0',  pin: 'input', index: 1 } },
        { id: 'r5',  from: { nodeId: 'notA1', pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 0 } },
        { id: 'r6',  from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and1',  pin: 'input', index: 1 } },
        { id: 'r7',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 0 } },
        { id: 'r8',  from: { nodeId: 'notA0', pin: 'output' }, to: { nodeId: 'and2',  pin: 'input', index: 1 } },
        { id: 'r9',  from: { nodeId: 'a1',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 0 } },
        { id: 'r10', from: { nodeId: 'a0',    pin: 'output' }, to: { nodeId: 'and3',  pin: 'input', index: 1 } },
        { id: 'r11', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'orBit1', pin: 'input', index: 0 } },
        { id: 'r12', from: { nodeId: 'and2',  pin: 'output' }, to: { nodeId: 'orBit1', pin: 'input', index: 1 }, broken: true },
        { id: 'r13', from: { nodeId: 'and0',  pin: 'output' }, to: { nodeId: 'orBit0', pin: 'input', index: 0 } },
        { id: 'r14', from: { nodeId: 'and1',  pin: 'output' }, to: { nodeId: 'orBit0', pin: 'input', index: 1 } },
        { id: 'r15', from: { nodeId: 'orBit1', pin: 'output' }, to: { nodeId: 'bit1', pin: 'input', index: 0 } },
        { id: 'r16', from: { nodeId: 'orBit0', pin: 'output' }, to: { nodeId: 'bit0', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Decoder: and0..and3, one HIGH per address. bit1 = OR(and1, and3). bit0 = OR(and0, and1). No write path exists in ROM -- the wiring itself is the stored data.',
      nodes: [
        { id: 'a1',    type: 'INPUT',  x: 50,  y: 80,  scale: 1,   locked: false },
        { id: 'a0',    type: 'INPUT',  x: 50,  y: 220, scale: 1,   locked: false },
        { id: 'notA1', type: 'NOT',    x: 170, y: 80,  scale: 1,   locked: false },
        { id: 'notA0', type: 'NOT',    x: 170, y: 220, scale: 1,   locked: false },
        { id: 'and0',  type: 'AND',    x: 320, y: 60,  scale: 1,   locked: false },
        { id: 'and1',  type: 'AND',    x: 320, y: 180, scale: 1,   locked: false },
        { id: 'and2',  type: 'AND',    x: 320, y: 300, scale: 1,   locked: false },
        { id: 'and3',  type: 'AND',    x: 320, y: 420, scale: 1,   locked: false },
        { id: 'orBit1', type: 'OR',    x: 500, y: 130, scale: 1.1, locked: false },
        { id: 'orBit0', type: 'OR',    x: 500, y: 350, scale: 1.1, locked: false },
        { id: 'bit1',  type: 'OUTPUT', x: 670, y: 130, scale: 1 },
        { id: 'bit0',  type: 'OUTPUT', x: 670, y: 350, scale: 1 },
      ],
      inputs: { a1: true, a0: true },
      wires: [],
    },
  },
}