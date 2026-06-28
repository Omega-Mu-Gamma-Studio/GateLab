/**
 * Unit I · Lesson 09 — K-Map (3-Variable)
 *
 * Narrative context:
 *   Work Order WO-0057 — Deck 7, coolant flow authorization.
 *   Three inputs: A (pump active), B (temp below threshold), C (manual hold)
 *   Legacy expression from ship's original commissioning docs:
 *     f = A'B'C' + A'BC' + AB'C' + ABC'
 *   This is classic — everything has C' in it. C is irrelevant to the output.
 *   Simplified: C' (but the expression also covers A+B variation; let engine show)
 *   Actually: A'B'C'=m0, A'BC'=m2 (using ABC Gray), AB'C'=m4, ABC'=m6 → quad group in C'=0 plane
 *   For 3-var (A,B,C), minterms:
 *     A'B'C'=0, A'B'C=1, A'BC'=2, A'BC=3, AB'C'=4, AB'C=5, ABC'=6, ABC=7
 *   Our minterms: {0,2,4,6} — all C'
 *   Simplified: C' (the single variable that's consistent across all 1-cells)
 *   Expression string for engine: A'B'C'+A'BC'+AB'C'+ABC'
 *
 * Note: KMapX works 4-variable internally. For 3-var we pad with D=don't-care
 * (d(1,3,5,7,9,11,13,15) — all odd D positions) but that's overkill.
 * Cleaner: just pass the 3-var expression to the full 4-var engine —
 * it'll expand correctly treating D as absent (implicitly expands to both D values).
 * Expression: A'B'C'+A'BC'+AB'C'+ABC' (each expands to two minterms over D)
 */

export default {
  meta: {
    id:          'unit1-09',
    title:       'K-Map: 3 Variables',
    unit:        1,
    lessonIndex: 8,
    concept:     'KMAP_3VAR',
    panels:      [],
    workOrder:   'WO-0057',
    location:    'Deck 7 · Coolant Flow Console',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Coolant flow console. The authorization logic was transcribed from the original commissioning docs — 2218, by the looks of the paper.\n\nFour terms. Three variables. Ada pulled the schematic and immediately said 'C isn't doing anything.' She's right. Every single term has C' in it. C appears in the expression but it's fixed at zero across the entire on-set. Whatever C is — it doesn't affect the output.\n\nThe K-Map will make it obvious. It always does.",
    briefing: 'Coolant flow authorization: f = A\'B\'C\' + A\'BC\' + AB\'C\' + ABC\'. Three-variable expression from original commissioning specs. K-Map simplification required — expected significant reduction.',
    fault:    'MAINTENANCE AUDIT: Legacy expression verified correct but far from minimal. No circuit fault. Simplification is documentation update only. K-Map grouping required.',
    dispatch: 'Identify the prime implicant groups in the K-Map. C\' should be obvious. Enter the simplified expression.',
    success:  'Simplified form confirmed. Commissioning docs updated. WO-0057 closed by Alpha Shift.',
    lore:     'The 3-variable K-Map is a 2×4 grid — two rows (one variable on the row axis) and four columns (two variables, Gray-coded). Crucially: the map wraps. Left and right edges are adjacent. A group spanning both edges is valid. The key skill is recognizing which variable changes across a group — those drop out of the term. Variables that stay constant stay in.',
  },

  phases: {
    work: {
      hint: "Four 1-cells. They're all in the C'=0 plane. What does that tell you?",
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  3,
        expression: "A'B'C'+A'BC'+AB'C'+ABC'",
        answer:     "C'",
        dontCares:  [],
        mode:       'read',
      },
    },
    break: {
      hint: 'The quad group covers all four 1-cells. Only one variable is constant across all of them.',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  3,
        expression: "A'B'C'+A'BC'+AB'C'+ABC'",
        answer:     "C'",
        dontCares:  [],
        mode:       'read',
      },
    },
    try: {
      hint: "Enter the simplified expression. It's one term. One variable. You already know what it is.",
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  3,
        expression: "A'B'C'+A'BC'+AB'C'+ABC'",
        answer:     "C'",
        dontCares:  [],
        mode:       'simplify',
      },
    },
  },
}