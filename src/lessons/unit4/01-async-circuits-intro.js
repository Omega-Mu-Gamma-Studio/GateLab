/**
 * Unit IV · Lesson 01 — Introduction to Asynchronous Circuits
 *
 * Narrative context:
 *   Work Order WO-0200 — Deck 3, Emergency Vent Control Panel.
 *   The AETHER-9's emergency vent system uses a simple asynchronous
 *   SR latch — no clock, no synchronization bus. Outputs change the
 *   instant inputs change. The latch controls a pressure relief valve:
 *   S (Set) opens the valve, R (Reset) closes it.
 *   Fault: The R input wire has been severed. The latch is stuck SET —
 *   the valve is jammed open. Pressure in compartment C is venting
 *   continuously into deep space. The player must restore the R input.
 *
 * Engineering framing:
 *   An asynchronous circuit has no global clock. Outputs respond
 *   directly to input changes via gate propagation delays.
 *   SR NAND latch: S=0 sets Q=1. R=0 resets Q=0. S=R=1 is memory.
 *   S=R=0 is forbidden (both outputs HIGH — undefined state).
 *   Propagation delay through each gate is typically 5–20 ns.
 *   Unlike clocked circuits, the output changes happen at gate speed,
 *   not on a clock edge — much faster, but susceptible to glitches
 *   caused by unequal path delays. Unit IV explores these failure modes.
 */

const NODES_FULL = [
  { id: 'S',     type: 'INPUT',  x: 60,  y: 100, scale: 1 },
  { id: 'R',     type: 'INPUT',  x: 60,  y: 300, scale: 1 },
  { id: 'nand1', type: 'NAND',   x: 220, y: 110, scale: 1.2 },
  { id: 'nand2', type: 'NAND',   x: 220, y: 290, scale: 1.2 },
  { id: 'Q',     type: 'OUTPUT', x: 440, y: 130, scale: 1 },
  { id: 'QB',    type: 'OUTPUT', x: 440, y: 310, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'S',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'R',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
  { id: 'w5', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'Q',     pin: 'input', index: 0 } },
  { id: 'w6', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'QB',    pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit4-01',
    title:       'Async Circuits — SR Latch',
    unit:        4,
    lessonIndex: 0,
    concept:     'ASYNC_INTRO',
    panels:      ['timing'],
    workOrder:   'WO-0200',
    location:    'Deck 3 · Emergency Vent Control Panel',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Compartment C pressure vent has been exhausting continuously for six hours. We're losing atmosphere fast. The vent valve is driven by an asynchronous SR latch — no clock, no sync. The latch output goes high the instant its inputs change, at gate speed. Set your SET input LOW to open the valve, RESET LOW to close it.\n\nThis is Unit IV territory. Asynchronous circuits respond the moment you touch an input — no waiting for a clock edge. Faster, simpler, and much more fragile. The delays inside each NAND gate determine when the output settles. If two paths to the same output differ in length, the output can glitch before settling. That's a hazard. But first — the R input wire has been cut. Fix it.\n\nRestore the wire from R to nand2 input[0]. Confirm Q goes LOW when R is asserted (R=0). The valve must be closeable.",
    briefing: 'Async SR NAND latch, valve controller. R input wire severed — latch permanently SET. Valve stuck open. Compartment C venting continuously.',
    fault:    'INCIDENT REPORT: R input wire to nand2 input[0] severed at junction J-34. NAND2 input[0] floating HIGH. Latch latched into SET state. Q stuck HIGH. Valve jammed open. Compartment C pressure falling.',
    dispatch: 'Restore wire from R to nand2 input[0]. Verify latch behavior: S=0,R=1 → Q=1 (SET). S=1,R=0 → Q=0 (RESET). S=1,R=1 → hold. S=0,R=0 → FORBIDDEN (do not test).',
    success:  'R input restored. Latch responding correctly. Valve closed. Compartment C pressure stabilizing. WO-0200 closed by Alpha Shift. Welcome to Unit IV — async from here on out.',
    lore:     "The SR NAND latch is the oldest memory element in digital electronics. Two cross-coupled NAND gates — a feedback loop so tight it can store a bit indefinitely with no clock at all. Async circuits were the default before clocks became cheap in the 1970s. They never fully disappeared: fast signal arbiters, metastability resolvers, and power-gating circuits in modern CPUs still rely on async elements. The trade-off has always been the same — asynchronous is faster and simpler, but debugging it requires an oscilloscope, patience, and a healthy fear of glitches. This unit is about understanding why they glitch and how to stop them.",
  },

  phases: {
    work: {
      hint: 'SR NAND latch: S and R both HIGH = hold. S LOW = Set (Q=1). R LOW = Reset (Q=0). Both LOW at once is forbidden.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { S: true, R: true },
    },
    break: {
      hint: 'R input to nand2 is disconnected. nand2 input[0] is floating HIGH. The latch is stuck SET regardless of the R switch.',
      faultNodeId: 'nand2',
      nodes: NODES_FULL,
      inputs: { S: true, R: true },
      wires: [
        { id: 'w1', from: { nodeId: 'S',     pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'nand1', pin: 'input', index: 1 } },
        { id: 'w3', from: { nodeId: 'R',     pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 0 }, broken: true },
        { id: 'w4', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'nand2', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'nand1', pin: 'output' }, to: { nodeId: 'Q',     pin: 'input', index: 0 } },
        { id: 'w6', from: { nodeId: 'nand2', pin: 'output' }, to: { nodeId: 'QB',    pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'Wire up the SR NAND latch: S to nand1 input[0], R to nand2 input[0]. Cross-couple the outputs: nand1 out → nand2 input[1], nand2 out → nand1 input[1]. Connect Q and QB.',
      nodes: NODES_FULL.map(n => ({ ...n, locked: false })),
      inputs: { S: true, R: true },
      wires: [],
    },
  },
}