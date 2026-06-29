/**
 * Unit V - Lesson 07 -- Hamming(7,4) Error-Correcting Code
 *
 * Narrative context:
 *   Work Order WO-0307 -- Deck 2, Central Memory Bank, Deep-Space Link Encoder.
 *   The deep-space telemetry link encodes every 4 data bits (d1-d4)
 *   into a 7-bit Hamming codeword using three XOR-tree parity
 *   generators (p1, p2, p3), so a single-bit flip anywhere in transit
 *   can be detected and located by recomputing syndrome bits at the
 *   receiver. p2 has been miscomputed at the source for a long string
 *   of recent transmissions, and every syndrome calculation downstream
 *   has been silently pointing at the wrong bit position.
 *   Fault: p2's XOR tree is wired from d1, d2, d4 instead of the
 *   correct d1, d3, d4 -- one input is reading the wrong data bit.
 *   Player rewires p2's tree to read the correct three data bits.
 *
 * Engineering framing:
 *   Standard (7,4) Hamming bit positions 1-7: p1, p2, d1, p3, d2, d3, d4.
 *   Parity coverage (each parity bit covers positions whose binary
 *   index has a 1 in the matching bit):
 *     p1 covers positions 1,3,5,7  -> p1 = d1 XOR d2 XOR d4
 *     p2 covers positions 2,3,6,7  -> p2 = d1 XOR d3 XOR d4
 *     p3 covers positions 4,5,6,7  -> p3 = d2 XOR d3 XOR d4
 *   Each is a 3-input XOR, built here from two 2-input XOR gates
 *   (a XOR b XOR c == XOR(XOR(a,b), c)). The encoder simply computes
 *   p1, p2, p3 from d1-d4; the receiver's syndrome calculator
 *   recomputes the same three parities from the received bits and
 *   XORs each against the received parity bit -- a nonzero 3-bit
 *   syndrome points directly at the position of a single flipped bit.
 */

const NODES_FULL = [
  { id: 'd1', type: 'INPUT',  x: 50,  y: 60,  scale: 1 },
  { id: 'd2', type: 'INPUT',  x: 50,  y: 200, scale: 1 },
  { id: 'd3', type: 'INPUT',  x: 50,  y: 340, scale: 1 },
  { id: 'd4', type: 'INPUT',  x: 50,  y: 480, scale: 1 },

  // p1 = d1 ^ d2 ^ d4
  { id: 'x1a', type: 'XOR',   x: 240, y: 100, scale: 1 },
  { id: 'x1b', type: 'XOR',   x: 400, y: 130, scale: 1.1 },

  // p2 = d1 ^ d3 ^ d4
  { id: 'x2a', type: 'XOR',   x: 240, y: 280, scale: 1 },
  { id: 'x2b', type: 'XOR',   x: 400, y: 320, scale: 1.1 },

  // p3 = d2 ^ d3 ^ d4
  { id: 'x3a', type: 'XOR',   x: 240, y: 440, scale: 1 },
  { id: 'x3b', type: 'XOR',   x: 400, y: 480, scale: 1.1 },

  { id: 'p1', type: 'OUTPUT', x: 580, y: 130, scale: 1 },
  { id: 'p2', type: 'OUTPUT', x: 580, y: 320, scale: 1 },
  { id: 'p3', type: 'OUTPUT', x: 580, y: 480, scale: 1 },
]

const WIRES_FULL = [
  // p1 = d1 ^ d2 ^ d4
  { id: 'h1', from: { nodeId: 'd1',  pin: 'output' }, to: { nodeId: 'x1a', pin: 'input', index: 0 } },
  { id: 'h2', from: { nodeId: 'd2',  pin: 'output' }, to: { nodeId: 'x1a', pin: 'input', index: 1 } },
  { id: 'h3', from: { nodeId: 'x1a', pin: 'output' }, to: { nodeId: 'x1b', pin: 'input', index: 0 } },
  { id: 'h4', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x1b', pin: 'input', index: 1 } },
  { id: 'h5', from: { nodeId: 'x1b', pin: 'output' }, to: { nodeId: 'p1',  pin: 'input', index: 0 } },

  // p2 = d1 ^ d3 ^ d4
  { id: 'h6', from: { nodeId: 'd1',  pin: 'output' }, to: { nodeId: 'x2a', pin: 'input', index: 0 } },
  { id: 'h7', from: { nodeId: 'd3',  pin: 'output' }, to: { nodeId: 'x2a', pin: 'input', index: 1 } },
  { id: 'h8', from: { nodeId: 'x2a', pin: 'output' }, to: { nodeId: 'x2b', pin: 'input', index: 0 } },
  { id: 'h9', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x2b', pin: 'input', index: 1 } },
  { id: 'h10', from: { nodeId: 'x2b', pin: 'output' }, to: { nodeId: 'p2',  pin: 'input', index: 0 } },

  // p3 = d2 ^ d3 ^ d4
  { id: 'h11', from: { nodeId: 'd2',  pin: 'output' }, to: { nodeId: 'x3a', pin: 'input', index: 0 } },
  { id: 'h12', from: { nodeId: 'd3',  pin: 'output' }, to: { nodeId: 'x3a', pin: 'input', index: 1 } },
  { id: 'h13', from: { nodeId: 'x3a', pin: 'output' }, to: { nodeId: 'x3b', pin: 'input', index: 0 } },
  { id: 'h14', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x3b', pin: 'input', index: 1 } },
  { id: 'h15', from: { nodeId: 'x3b', pin: 'output' }, to: { nodeId: 'p3',  pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-07',
    title:       'Hamming(7,4) Encoder',
    unit:        5,
    lessonIndex: 6,
    concept:     'HAMMING_CODE',
    panels:      ['truth'],
    workOrder:   'WO-0307',
    location:    'Deck 2 - Central Memory Bank -- Deep-Space Link Encoder',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Deep-space telemetry has been arriving with syndrome calculations that point at bit positions with nothing wrong with them. The encoder takes four data bits and produces three parity bits using XOR trees, so a receiver light-minutes away can recompute the same parities and locate a single flipped bit without ever asking us to resend anything. p2 is supposed to cover d1, d3, and d4.\n\nI checked the encoder's XOR tree for p2. It's reading d1, d2, and d4 -- d2 instead of d3. So every codeword we transmit has a p2 that's actually testing the wrong coverage set. The receiver's syndrome logic assumes p2 covers positions 2, 3, 6, and 7; with this miswiring, that assumption no longer holds, and the syndrome it calculates points at a position that was never actually wrong.\n\nDisconnect p2's second XOR-tree input from d2 and reconnect it to d3. Once p2 = d1 XOR d3 XOR d4 again, the syndrome calculator downstream will correctly locate any single-bit flip in transit.",
    briefing: 'Encoder parity bit p2 is computed from d1, d2, d4 instead of d1, d3, d4. The receiver’s syndrome calculation, which assumes correct parity coverage, locates flipped bits incorrectly.',
    fault:    'INCIDENT REPORT: Deep-Space Link Encoder XOR tree at junction H-05 -- x2a input[1] sourced from d2 instead of d3. Parity bit p2 covers the wrong set of data bits. Syndrome-based error location compromised.',
    dispatch: 'Disconnect x2a input[1] from d2. Connect x2a input[1] to d3. Verify p2 = d1 XOR d3 XOR d4 for all data combinations. Confirm p1 and p3 are unaffected.',
    success:  'p2 XOR tree corrected. Encoder now produces parity bits matching the standard Hamming(7,4) coverage sets. Single-bit error correction restored on the deep-space link. WO-0307 closed by Gamma Shift -- Unit V complete. Central Memory Bank fully recommissioned.',
    lore:     "Richard Hamming developed this code in 1950 at Bell Labs out of pure frustration: the lab's relay computer would halt and discard an entire job on any single bit error, and he was tired of resubmitting work over a weekend just because of one flipped bit nobody could even locate. His scheme made error detection and correction automatic by overlapping parity coverage so cleverly that the pattern of failed checks -- the syndrome -- spells out the exact position of the fault in binary. It remains one of the cleanest results in all of information theory: with just three extra bits, four bits of data become self-locating against any single corruption, which is exactly why variants of it still ride along on deep-space probes, satellite links, and ECC memory today, anywhere a bit flip can't simply be asked to resend.",
  },

  phases: {
    work: {
      hint: 'p1 = d1^d2^d4 (covers positions 1,3,5,7). p2 = d1^d3^d4 (covers 2,3,6,7). p3 = d2^d3^d4 (covers 4,5,6,7). Each 3-input XOR is built from two 2-input XORs.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { d1: true, d2: false, d3: true, d4: false },
    },
    break: {
      hint: 'p2’s XOR tree reads d1, d2, d4 instead of d1, d3, d4. Its second input is wrong — compare against p2 = d1 XOR d3 XOR d4.',
      faultNodeId: 'x2a',
      nodes: NODES_FULL,
      inputs: { d1: true, d2: false, d3: true, d4: false },
      wires: [
        { id: 'h1', from: { nodeId: 'd1',  pin: 'output' }, to: { nodeId: 'x1a', pin: 'input', index: 0 } },
        { id: 'h2', from: { nodeId: 'd2',  pin: 'output' }, to: { nodeId: 'x1a', pin: 'input', index: 1 } },
        { id: 'h3', from: { nodeId: 'x1a', pin: 'output' }, to: { nodeId: 'x1b', pin: 'input', index: 0 } },
        { id: 'h4', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x1b', pin: 'input', index: 1 } },
        { id: 'h5', from: { nodeId: 'x1b', pin: 'output' }, to: { nodeId: 'p1',  pin: 'input', index: 0 } },
        { id: 'h6', from: { nodeId: 'd1',  pin: 'output' }, to: { nodeId: 'x2a', pin: 'input', index: 0 } },
        { id: 'h7', from: { nodeId: 'd2',  pin: 'output' }, to: { nodeId: 'x2a', pin: 'input', index: 1 }, broken: true },
        { id: 'h8', from: { nodeId: 'x2a', pin: 'output' }, to: { nodeId: 'x2b', pin: 'input', index: 0 } },
        { id: 'h9', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x2b', pin: 'input', index: 1 } },
        { id: 'h10', from: { nodeId: 'x2b', pin: 'output' }, to: { nodeId: 'p2',  pin: 'input', index: 0 } },
        { id: 'h11', from: { nodeId: 'd2',  pin: 'output' }, to: { nodeId: 'x3a', pin: 'input', index: 0 } },
        { id: 'h12', from: { nodeId: 'd3',  pin: 'output' }, to: { nodeId: 'x3a', pin: 'input', index: 1 } },
        { id: 'h13', from: { nodeId: 'x3a', pin: 'output' }, to: { nodeId: 'x3b', pin: 'input', index: 0 } },
        { id: 'h14', from: { nodeId: 'd4',  pin: 'output' }, to: { nodeId: 'x3b', pin: 'input', index: 1 } },
        { id: 'h15', from: { nodeId: 'x3b', pin: 'output' }, to: { nodeId: 'p3',  pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Three 3-input XOR trees (each built from two 2-input XORs): p1(d1,d2,d4), p2(d1,d3,d4), p3(d2,d3,d4).',
      nodes: [
        { id: 'd1', type: 'INPUT',  x: 50,  y: 60,  scale: 1,   locked: false },
        { id: 'd2', type: 'INPUT',  x: 50,  y: 200, scale: 1,   locked: false },
        { id: 'd3', type: 'INPUT',  x: 50,  y: 340, scale: 1,   locked: false },
        { id: 'd4', type: 'INPUT',  x: 50,  y: 480, scale: 1,   locked: false },
        { id: 'x1a', type: 'XOR',   x: 240, y: 100, scale: 1,   locked: false },
        { id: 'x1b', type: 'XOR',   x: 400, y: 130, scale: 1.1, locked: false },
        { id: 'x2a', type: 'XOR',   x: 240, y: 280, scale: 1,   locked: false },
        { id: 'x2b', type: 'XOR',   x: 400, y: 320, scale: 1.1, locked: false },
        { id: 'x3a', type: 'XOR',   x: 240, y: 440, scale: 1,   locked: false },
        { id: 'x3b', type: 'XOR',   x: 400, y: 480, scale: 1.1, locked: false },
        { id: 'p1', type: 'OUTPUT', x: 580, y: 130, scale: 1 },
        { id: 'p2', type: 'OUTPUT', x: 580, y: 320, scale: 1 },
        { id: 'p3', type: 'OUTPUT', x: 580, y: 480, scale: 1 },
      ],
      inputs: { d1: true, d2: false, d3: true, d4: false },
      wires: [],
    },
  },
}