/**
 * Unit V - Lesson 06 -- Programmable Array Logic (PAL)
 *
 * Narrative context:
 *   Work Order WO-0306 -- Deck 2, Central Memory Bank, Airlock Interlock PAL.
 *   The airlock interlock PAL fixes its AND array at fabrication and
 *   exposes only the OR array for field programming. Three fixed
 *   product terms feed two programmable OR outputs, F1 and F2. F1 is
 *   asserting in a state it never should -- the outer door is being
 *   told it's safe to cycle when it isn't.
 *   Fault: an extra, unintended OR-array link connects term T3 into
 *   F1, which should only ever be driven by T1 and T2. The unblown
 *   fuse leaves a stray connection that was supposed to be removed
 *   during programming.
 *   Player removes the stray link from F1, leaving F1 driven only by
 *   its two intended terms.
 *
 * Engineering framing:
 *   PAL = fixed AND array -> programmable OR array (the reverse of a
 *   PLA). The AND array is hardwired at manufacture:
 *     T1 = A AND B
 *     T2 = B AND C
 *     T3 = A AND NOT(C)
 *   Only the OR-array fuses are field-programmable. Correct program:
 *     F1 = T1 OR T2
 *     F2 = T2 OR T3
 *   Because the AND array can't be reprogrammed, a PAL is cheaper and
 *   faster than a PLA but strictly less flexible -- you must choose a
 *   part whose fixed terms happen to cover the logic you need.
 */

const NODES_FULL = [
  { id: 'A',    type: 'INPUT',  x: 50,  y: 60,  scale: 1 },
  { id: 'B',    type: 'INPUT',  x: 50,  y: 220, scale: 1 },
  { id: 'C',    type: 'INPUT',  x: 50,  y: 400, scale: 1 },

  { id: 'notC', type: 'NOT',    x: 200, y: 460, scale: 1 },

  { id: 'T1',   type: 'AND',    x: 350, y: 100, scale: 1.1 },
  { id: 'T2',   type: 'AND',    x: 350, y: 280, scale: 1.1 },
  { id: 'T3',   type: 'AND',    x: 350, y: 460, scale: 1.1 },

  { id: 'F1',   type: 'OR',     x: 530, y: 170, scale: 1.1 },
  { id: 'F2',   type: 'OR',     x: 530, y: 370, scale: 1.1 },

  { id: 'OUT1', type: 'OUTPUT', x: 700, y: 170, scale: 1 },
  { id: 'OUT2', type: 'OUTPUT', x: 700, y: 370, scale: 1 },
]

const WIRES_FULL = [
  { id: 'q1', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'notC', pin: 'input', index: 0 } },

  { id: 'q2', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 0 } },
  { id: 'q3', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 1 } },

  { id: 'q4', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 0 } },
  { id: 'q5', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 1 } },

  { id: 'q6', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 0 } },
  { id: 'q7', from: { nodeId: 'notC', pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 1 } },

  // programmable OR array
  { id: 'q8', from: { nodeId: 'T1',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 0 } },
  { id: 'q9', from: { nodeId: 'T2',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 1 } },

  { id: 'q10', from: { nodeId: 'T2',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 0 } },
  { id: 'q11', from: { nodeId: 'T3',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 1 } },

  { id: 'q12', from: { nodeId: 'F1',  pin: 'output' }, to: { nodeId: 'OUT1', pin: 'input', index: 0 } },
  { id: 'q13', from: { nodeId: 'F2',  pin: 'output' }, to: { nodeId: 'OUT2', pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit5-06',
    title:       'Programmable Array Logic',
    unit:        5,
    lessonIndex: 5,
    concept:     'PAL',
    panels:      ['truth'],
    workOrder:   'WO-0306',
    location:    'Deck 2 - Central Memory Bank -- Airlock Interlock PAL',
    shift:       'Gamma Shift',
    commandSpeaker: 'DATA OFFICER SOLINA',
  },

  narrative: {
    recap:    "Airlock interlock is clearing the outer door to cycle under conditions it has no business clearing. This board is a PAL -- the AND array is fixed at manufacture (T1=A.B, T2=B.C, T3=A.NOT-C, burned in, unchangeable), and only the OR array downstream is field-programmable. F1, the outer-door-safe signal, is only supposed to be driven by T1 and T2.\n\nI checked the OR-array fuse map. There's a third link present on F1 that should have been blown open during programming -- T3 is still connected into F1 alongside T1 and T2. That stray, unblown fuse means F1 goes HIGH any time T3 does, even though T3 was never part of F1's intended logic. It was only ever meant to feed F2.\n\nRemove the stray OR-array link from T3 into F1. F1 should be driven by exactly two terms: T1 and T2, nothing else. The fixed AND array doesn't need to change at all -- this is purely an OR-array programming fix.",
    briefing: 'PAL OR array has a stray, unblown fuse connecting T3 into F1. F1 should only be driven by T1 and T2; the extra link makes it assert under T3’s condition too.',
    fault:    'INCIDENT REPORT: Airlock Interlock PAL OR-array junction Q-08 -- unblown fuse leaves T3 connected to F1 in addition to its correct connection to F2. F1 asserts outside its intended logic.',
    dispatch: 'Disconnect T3 from F1. Leave T1 and T2 as F1’s only inputs. Confirm T3 remains connected to F2 alongside T2, unaffected. Verify F1 = T1 OR T2 exactly.',
    success:  'Stray OR-array fuse cleared. F1 now driven only by T1 and T2 as specified. Outer door safety interlock verified correct. WO-0306 closed by Gamma Shift.',
    lore:     "A PAL's OR array is programmed by selectively blowing tiny fuses (or, in modern reprogrammable parts, setting EEPROM-style bits) at each AND-term/OR-gate intersection -- every intersection starts connected, and programming means removing the ones you don't want. An unblown fuse is therefore a silent, easy-to-miss failure mode: the circuit looks programmed, simulates fine for the cases you happened to test, and only misbehaves when a condition exercises the one stray term nobody disconnected. It's part of why the industry eventually layered automated fitting software and bit-stream verification on top of PAL/GAL programming instead of trusting the fuse map by hand.",
  },

  phases: {
    work: {
      hint: 'Fixed AND array: T1=A.B, T2=B.C, T3=A.notC. Programmable OR array: F1=OR(T1,T2). F2=OR(T2,T3).',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { A: true, B: false, C: true },
    },
    break: {
      hint: 'F1 has a stray third input from T3 that should have been disconnected during OR-array programming. F1 now also asserts whenever T3 does.',
      faultNodeId: 'F1',
      nodes: NODES_FULL,
      inputs: { A: true, B: false, C: true },
      wires: [
        { id: 'q1', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'notC', pin: 'input', index: 0 } },
        { id: 'q2', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 0 } },
        { id: 'q3', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 1 } },
        { id: 'q4', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 0 } },
        { id: 'q5', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 1 } },
        { id: 'q6', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 0 } },
        { id: 'q7', from: { nodeId: 'notC', pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 1 } },
        { id: 'q8', from: { nodeId: 'T1',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 0 } },
        { id: 'q9', from: { nodeId: 'T2',   pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 1 } },
        { id: 'q9b', from: { nodeId: 'T3',  pin: 'output' }, to: { nodeId: 'F1',   pin: 'input', index: 2 }, broken: true },
        { id: 'q10', from: { nodeId: 'T2',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 0 } },
        { id: 'q11', from: { nodeId: 'T3',  pin: 'output' }, to: { nodeId: 'F2',   pin: 'input', index: 1 } },
        { id: 'q12', from: { nodeId: 'F1',  pin: 'output' }, to: { nodeId: 'OUT1', pin: 'input', index: 0 } },
        { id: 'q13', from: { nodeId: 'F2',  pin: 'output' }, to: { nodeId: 'OUT2', pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Fixed AND array (do not change the term wiring): T1(A,B), T2(B,C), T3(A,notC). Program the OR array: F1 from T1+T2 only. F2 from T2+T3 only.',
      nodes: [
        { id: 'A',    type: 'INPUT',  x: 50,  y: 60,  scale: 1,   locked: false },
        { id: 'B',    type: 'INPUT',  x: 50,  y: 220, scale: 1,   locked: false },
        { id: 'C',    type: 'INPUT',  x: 50,  y: 400, scale: 1,   locked: false },
        { id: 'notC', type: 'NOT',    x: 200, y: 460, scale: 1,   locked: false },
        { id: 'T1',   type: 'AND',    x: 350, y: 100, scale: 1.1, locked: true },
        { id: 'T2',   type: 'AND',    x: 350, y: 280, scale: 1.1, locked: true },
        { id: 'T3',   type: 'AND',    x: 350, y: 460, scale: 1.1, locked: true },
        { id: 'F1',   type: 'OR',     x: 530, y: 170, scale: 1.1, locked: false },
        { id: 'F2',   type: 'OR',     x: 530, y: 370, scale: 1.1, locked: false },
        { id: 'OUT1', type: 'OUTPUT', x: 700, y: 170, scale: 1 },
        { id: 'OUT2', type: 'OUTPUT', x: 700, y: 370, scale: 1 },
      ],
      inputs: { A: true, B: false, C: true },
      wires: [
        { id: 'q1', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'notC', pin: 'input', index: 0 } },
        { id: 'q2', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 0 } },
        { id: 'q3', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T1',   pin: 'input', index: 1 } },
        { id: 'q4', from: { nodeId: 'B',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 0 } },
        { id: 'q5', from: { nodeId: 'C',    pin: 'output' }, to: { nodeId: 'T2',   pin: 'input', index: 1 } },
        { id: 'q6', from: { nodeId: 'A',    pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 0 } },
        { id: 'q7', from: { nodeId: 'notC', pin: 'output' }, to: { nodeId: 'T3',   pin: 'input', index: 1 } },
      ],
    },
  },
}