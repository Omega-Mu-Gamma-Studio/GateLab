/**
 * Unit I · Lesson 08 — K-Map (2-Variable)
 *
 * Narrative context:
 *   Work Order WO-0056 — Deck 7, pressure safety relay audit.
 *   Two sensors: A (main line), B (backup line).
 *   The current relay expression written on the maintenance tag:
 *     f = AB + AB' + A'B
 *   Ada found this on a panel that's been running this expression for
 *   three years and nobody questioned it. It simplifies to A + B.
 *   Player uses the K-Map to verify the simplification.
 *
 * KMap config:
 *   2-variable: only A and B — use a 1×4 or 2×2 grid layout.
 *   For engine compatibility we pad to 4-var with C=0,D=0 context,
 *   but only show a 2×2 portion. Engine works 4-var internally.
 *   We represent 2-var as: minterms over A,B with C,D fixed to don't-care.
 *   Actual minterms for AB + AB' + A'B:
 *     AB  = m3  (A=1,B=1,C=0,D=0 → but we use simple index)
 *   For 2-variable K-Map we use the 4-cell layout: m0=A'B', m1=A'B, m2=AB', m3=AB
 *   Mapping: A'B'=0, A'B=1, AB'=2, AB=3
 *   AB + AB' + A'B → minterms {1,2,3}
 *   Simplification: A + B (missing only m0 = A'B')
 */

export default {
  meta: {
    id:          'unit1-08',
    title:       'K-Map: 2 Variables',
    unit:        1,
    lessonIndex: 7,
    concept:     'KMAP_2VAR',
    panels:      [],
    workOrder:   'WO-0056',
    location:    'Deck 7 · Pressure Relay P-2',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Panel P-2, pressure relay. Whoever wired this wrote the expression on a maintenance tag and taped it inside the panel door.\n\nAB + AB' + A'B.\n\nThree terms. That's not wrong. It's just not minimal. This has been running for three years and nobody looked at it hard enough to notice. It simplifies. Use the K-Map.",
    briefing: 'Pressure relay P-2 logic: f = AB + AB\' + A\'B. Two sensors, three terms. K-Map audit required — simplify to minimal SOP.',
    fault:    'MAINTENANCE NOTE: Expression on panel tag is correct but unminimized. No active fault. Audit only. Simplify and update the tag.',
    dispatch: 'Use the K-Map to identify groupings. Enter the simplified expression. The engine will verify.',
    success:  'Simplified form confirmed. Panel tag updated. WO-0056 closed by Alpha Shift.',
    lore:     'The 2-variable K-Map is a 2×2 grid. Four cells, four possible minterms. Adjacency is still Gray-coded — corners wrap. The mechanical process: circle groups of 1, 2, or 4 (always powers of 2), pick the largest groups that cover all 1-cells, read off the variables that don\'t change within each group. That\'s your simplified term.',
  },

  // No circuit phases — this lesson uses the KMapWidget
  phases: {
    work: {
      hint: 'Expression: f = AB + AB\' + A\'B. Three terms — can you find the groupings?',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  2,
        expression: "AB+AB'+A'B",
        answer:     "A + B",
        dontCares:  [],
        mode:       'read',
      },
    },
    break: {
      hint: 'Look at the K-Map. Which cell is the 0? What do the three 1-cells share?',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  2,
        expression: "AB+AB'+A'B",
        answer:     "A + B",
        dontCares:  [],
        mode:       'read',
      },
    },
    try: {
      hint: 'Enter the simplified SOP form. Variables: A, B. NOT = apostrophe (\').',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  2,
        expression: "AB+AB'+A'B",
        answer:     "A + B",
        dontCares:  [],
        mode:       'simplify',
      },
    },
  },
}