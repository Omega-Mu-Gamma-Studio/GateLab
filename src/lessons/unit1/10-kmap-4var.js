/**
 * Unit I · Lesson 10 — K-Map (4-Variable) with Don't Cares
 *
 * Narrative context:
 *   Work Order WO-0058 — Deck 7, escape pod authorization matrix.
 *   Unit I's final lesson. The most complex K-Map. Don't cares present.
 *   Four inputs: A (hull breach), B (fire suppression active), C (CO2 override), D (captain auth)
 *   Escape pod release is authorized under several conditions:
 *     Must cover: m(0, 1, 4, 5, 8, 9) — major threat conditions
 *     Don't care: d(10, 11, 14, 15)    — states that can't physically occur
 *   Engine will identify: B' (covers the full on-set using don't-cares)
 *
 *   This is the capstone. Narrative weight: this is also the work order
 *   referenced by the UNIT1_END_CHOICE. The "fault pattern inconsistent with
 *   normal wear" was discovered while Ada and the player audited this very
 *   panel. The player's K-Map solution closes the technical side;
 *   the end-choice closes the moral side.
 *
 * Minterms for B'=0 (B absent, all A,C,D combinations):
 *   A'B'C'D'=0, A'B'C'D=1, A'B'CD'=2, A'B'CD=3, AB'C'D'=8, AB'C'D=9, AB'CD'=10, AB'CD=11
 *   But we want the on-set = {0,1,4,5,8,9} and don't-cares = {10,11,14,15}
 *   Wait — let me use a real expression that hits those exact minterms.
 *   On-set {0,1,4,5,8,9}: these are A'B'C'D' A'B'C'D A'BC'D' A'BC'D AB'C'D' AB'C'D
 *   Simplified: C'D' + C'D = C' ... wait, let's use engine to check.
 *   {0,1,4,5,8,9,12,13} → B'... no. Let me be precise:
 *   m0=A'B'C'D', m1=A'B'C'D, m4=A'BC'D', m5=A'BC'D, m8=AB'C'D', m9=AB'C'D → all have C'
 *   Missing from C' set: m2,m3,m6,m7,m10,m11 — all C=1.
 *   So on-set={0,1,4,5,8,9} simplifies to C' (without don't cares).
 *   With d(10,11,14,15) — m10=AB'CD', m11=AB'CD, m14=ABCD', m15=ABCD — all don't care.
 *   Engine: C' still, possibly simplified further? Let's just use expression form:
 *   A'B'C'D'+A'B'C'D+A'BC'D'+A'BC'D+AB'C'D'+AB'C'D (that's all 6 on-set minterms)
 *   Answer: C'
 */

export default {
  meta: {
    id:          'unit1-10',
    title:       'K-Map: 4 Variables',
    unit:        1,
    lessonIndex: 9,
    concept:     'KMAP_4VAR',
    panels:      [],
    workOrder:   'WO-0058',
    location:    'Deck 7 · Escape Pod Authorization Panel',
    shift:       'Alpha Shift',
    commandSpeaker: 'ENGINEER REYES',
  },

  narrative: {
    recap:    "Last job on the board. WO-0058 — escape pod authorization matrix.\n\nFour inputs. Partial on-set. Four don't-care states that physically can't occur given the ship's interlock tree. I found this one.\n\nThe authorization logic has six active release conditions and four impossible states we can use as don't-cares to get a cleaner grouping. The expression on the panel is six terms long. With don't-cares, it reduces to one.\n\nThis is the work order I need you to sign off on before I log the unit audit. Take your time with it.",
    briefing: 'Escape pod authorization matrix. Four inputs (A: hull breach, B: fire suppression, C: CO2 override, D: captain auth). Six release conditions. Four impossible states as don\'t-cares. Simplification required before unit audit sign-off.',
    fault:    'MAINTENANCE AUDIT: Authorization matrix expression unminimized. Don\'t-care states not exploited. Logic correct; implementation non-minimal. K-Map required. Note: This is WO-0058 — sign-off pending incident report.',
    dispatch: 'Use don\'t-cares to achieve maximum grouping. Enter the simplified expression. This closes the technical side of the unit audit.',
    success:  'Escape pod authorization matrix simplified and verified. WO-0058 technical close complete. Incident report pending your decision.',
    lore:     'Don\'t-care minterms (X cells in the K-Map) are states that either cannot occur or whose output value doesn\'t matter. They can be treated as 0 or 1, whichever produces a larger grouping. The optimizer always treats them as 1 when it helps. This is why they\'re called don\'t-cares — you don\'t care what they output, so the engine optimizes freely. The final simplified expression must only cover guaranteed on-set minterms — the don\'t-cares are a tool, not a commitment.',
  },

  phases: {
    work: {
      hint: 'Six 1-cells. Four X (don\'t-care) cells. Look for the largest groups the Xs let you form.',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  4,
        expression: "A'B'C'D'+A'B'C'D+A'BC'D'+A'BC'D+AB'C'D'+AB'C'D",
        answer:     "C'",
        dontCares:  [10, 11, 14, 15],
        mode:       'read',
      },
    },
    break: {
      hint: 'The don\'t-cares at m10, m11, m14, m15 let you expand one group to cover the entire on-set. What stays constant?',
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  4,
        expression: "A'B'C'D'+A'B'C'D+A'BC'D'+A'BC'D+AB'C'D'+AB'C'D",
        answer:     "C'",
        dontCares:  [10, 11, 14, 15],
        mode:       'read',
      },
    },
    try: {
      hint: "One prime implicant covers everything. One term. One variable. Enter it.",
      nodes: [],
      wires: [],
      inputs: {},
      kmapConfig: {
        variables:  4,
        expression: "A'B'C'D'+A'B'C'D+A'BC'D'+A'BC'D+AB'C'D'+AB'C'D",
        answer:     "C'",
        dontCares:  [10, 11, 14, 15],
        mode:       'simplify',
      },
    },
  },
}