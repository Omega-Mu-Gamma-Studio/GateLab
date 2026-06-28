/**
 * Unit I · Lesson 07 — SOP & POS
 *
 * Narrative context:
 *   Work Order WO-0055 — Deck 7, emergency ventilation authorization circuit.
 *   Three conditions determine if emergency vent is authorized:
 *     A = smoke detector
 *     B = CO sensor
 *     C = manual override
 *   Circuit should authorize vent if:
 *     - Smoke AND CO both detected (AB)
 *     - OR manual override alone (C)
 *   SOP form: AB + C
 *
 *   The player sees the pre-built SOP circuit (work), sees the fault
 *   (CO sensor feed broken — one term disabled), then rebuilds SOP (try).
 *
 * Engineering framing:
 *   SOP = Sum of Products. Each AND gate is a product term (minterm group).
 *   OR gate sums the products. The standard two-level implementation.
 *   POS is the dual: AND of OR terms. Same function, different implementation.
 *   This lesson shows SOP; lore explains POS relationship.
 */

// SOP circuit: AB + C
// Level 1: AND(smoke, CO) → product term 1
//           C passes through directly → product term 2
// Level 2: OR(term1, term2) → output

const NODES_FULL = [
  { id: 'smoke',    type: 'INPUT',  x: 60,  y: 80,  scale: 1 },
  { id: 'co',       type: 'INPUT',  x: 60,  y: 190, scale: 1 },
  { id: 'manual',   type: 'INPUT',  x: 60,  y: 350, scale: 1 },

  { id: 'andTerm',  type: 'AND',    x: 210, y: 100, scale: 1.2 },
  { id: 'sumGate',  type: 'OR',     x: 380, y: 185, scale: 1.2 },

  { id: 'out',      type: 'OUTPUT', x: 560, y: 225, scale: 1 },
]

const WIRES_FULL = [
  { id: 'w1', from: { nodeId: 'smoke',   pin: 'output' }, to: { nodeId: 'andTerm', pin: 'input', index: 0 } },
  { id: 'w2', from: { nodeId: 'co',      pin: 'output' }, to: { nodeId: 'andTerm', pin: 'input', index: 1 } },
  { id: 'w3', from: { nodeId: 'andTerm', pin: 'output' }, to: { nodeId: 'sumGate', pin: 'input', index: 0 } },
  { id: 'w4', from: { nodeId: 'manual',  pin: 'output' }, to: { nodeId: 'sumGate', pin: 'input', index: 1 } },
  { id: 'w5', from: { nodeId: 'sumGate', pin: 'output' }, to: { nodeId: 'out',     pin: 'input', index: 0 } },
]

export default {
  meta: {
    id:          'unit1-07',
    title:       'SOP & POS',
    unit:        1,
    lessonIndex: 6,
    concept:     'SOP_POS',
    panels:      [],
    workOrder:   'WO-0055',
    location:    'Deck 7 · Vent Authorization Panel',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Vent authorization panel, Deck 7. Three inputs: smoke detector, CO sensor, manual override.\n\nThe logic is AB + C. Smoke AND CO together trips the automatic vent. Manual override alone does it too — no sensor confirmation required, because if someone's hitting the manual switch there's probably already a reason.\n\nCO sensor feed is broken at the AND gate. That term's gone dark. Right now only manual override can trigger the vent — one failure mode away from no automatic protection at all.",
    briefing: 'Emergency vent authorization: SOP form AB + C. Smoke (A) AND CO (B) — OR — manual override (C). CO sensor input disconnected from AND gate. Automatic detection offline.',
    fault:    'INCIDENT REPORT: CO sensor feed broken at junction V-3. AND gate input floating. Smoke+CO product term disabled. Manual override (C) functional. Automatic vent authorization degraded.',
    dispatch: 'Restore CO sensor feed to AND gate. Confirm AND gate connects to OR sum gate, OR gate to vent relay. Full SOP circuit: two product terms, one sum.',
    success:  'Vent authorization restored. Both product terms active. WO-0055 closed by Alpha Shift.',
    lore:     'Sum of Products is the natural two-level gate implementation of any Boolean function. Each AND gate implements one minterm group — a product term. The OR gate sums them. Product of Sums is the dual: OR gates for maxterm groups, an AND gate summing them. POS and SOP are interconvertible through DeMorgan\'s theorem — same logic, different silicon. Which you use in practice depends on which gate family is cheaper and which implementation is minimal. K-Map simplification gives you both.',
  },

  phases: {
    work: {
      hint: 'SOP: AND gate computes product AB. OR gate sums AB and C. Two levels, full authorization.',
      nodes: NODES_FULL,
      wires: WIRES_FULL,
      inputs: { smoke: true, co: true, manual: false },
    },
    break: {
      hint: 'CO sensor disconnected from AND gate. Product term AB is dead. Only manual override works.',
      faultNodeId: 'andTerm',
      nodes: NODES_FULL,
      inputs: { smoke: true, co: true, manual: false },
      wires: [
        { id: 'w1', from: { nodeId: 'smoke',   pin: 'output' }, to: { nodeId: 'andTerm', pin: 'input', index: 0 } },
        { id: 'w2', from: { nodeId: 'co',      pin: 'output' }, to: { nodeId: 'andTerm', pin: 'input', index: 1 }, broken: true },
        { id: 'w3', from: { nodeId: 'andTerm', pin: 'output' }, to: { nodeId: 'sumGate', pin: 'input', index: 0 } },
        { id: 'w4', from: { nodeId: 'manual',  pin: 'output' }, to: { nodeId: 'sumGate', pin: 'input', index: 1 } },
        { id: 'w5', from: { nodeId: 'sumGate', pin: 'output' }, to: { nodeId: 'out',     pin: 'input', index: 0 } },
      ],
    },
    try: {
      hint: 'SOP: AB + C. Wire smoke + CO → AND gate. Wire manual + AND output → OR gate. OR gate → output.',
      nodes: [
        { id: 'smoke',   type: 'INPUT',  x: 60,  y: 80,  scale: 1,   locked: false },
        { id: 'co',      type: 'INPUT',  x: 60,  y: 190, scale: 1,   locked: false },
        { id: 'manual',  type: 'INPUT',  x: 60,  y: 350, scale: 1,   locked: false },
        { id: 'andTerm', type: 'AND',    x: 210, y: 100, scale: 1.2, locked: false },
        { id: 'sumGate', type: 'OR',     x: 380, y: 185, scale: 1.2, locked: false },
        { id: 'out',     type: 'OUTPUT', x: 560, y: 225, scale: 1 },
      ],
      inputs: { smoke: false, co: false, manual: false },
      wires: [],
    },
  },
}