/**
 * FlipFlopModels.js
 *
 * Pure state-model engine for Unit III (Sequential Circuits).
 * Companion to GraphEvaluator.js — where GraphEvaluator answers "what is
 * every wire's value right now", this module answers "which named
 * flip-flop state are we in, and what does the textbook say happens next".
 *
 * Zero React / Konva / Zustand dependencies, same as GraphEvaluator and
 * TruthTable — callable from a store, a component, or a unit test.
 *
 * DESIGN NOTE — detection is structural, not per-lesson-authored:
 * every Unit III lesson already names its nodes by convention (S/R, J/K,
 * D, T, CLK, Q, Qbar, Q0..Qn — see any file in src/lessons/unit3/). That
 * convention is exactly what timingStore.js already leans on for its
 * "derive chartable nodes from TYPE" trick. This module does the same
 * thing one level up: derive the flip-flop *kind* from which INPUT ids
 * are present, so new lessons get a working State Diagram for free
 * without any extra authoring, exactly like new lessons already get a
 * working Timing panel for free.
 */

export const FF_TYPES = {
  SR_LATCH:     'sr_latch',
  SR_FLIPFLOP:  'sr_flipflop',
  JK_FLIPFLOP:  'jk_flipflop',
  D_FLIPFLOP:   'd_flipflop',
  T_FLIPFLOP:   't_flipflop',
  COUNTER:      'counter',
  UNKNOWN:      'unknown',
}

export const TYPE_LABELS = {
  [FF_TYPES.SR_LATCH]:    'SR Latch',
  [FF_TYPES.SR_FLIPFLOP]: 'SR Flip-Flop',
  [FF_TYPES.JK_FLIPFLOP]: 'JK Flip-Flop',
  [FF_TYPES.D_FLIPFLOP]:  'D Flip-Flop',
  [FF_TYPES.T_FLIPFLOP]:  'T Flip-Flop',
  [FF_TYPES.COUNTER]:     'Counter',
  [FF_TYPES.UNKNOWN]:     'Unrecognized Circuit',
}

// Matches Q, Q0, Q1, Q2... but NOT Qbar (the trailing digit-or-nothing
// pattern excludes the "bar" suffix on purpose).
const Q_OUTPUT_RE = /^Q\d*$/
const T_INPUT_RE   = /^T\d*$/

/**
 * detectFlipFlopType(nodes)
 * Looks at INPUT/OUTPUT node ids in the current circuit and returns the
 * best-guess FF_TYPES entry. Multi-bit circuits (2+ "Qn" outputs — ripple,
 * mod-N, ring, and Johnson counters all fit this) are classed as COUNTER
 * before anything else, since their per-stage inputs vary lesson to lesson.
 */
export function detectFlipFlopType(nodes = []) {
  const inputIds  = nodes.filter(n => n.type === 'INPUT').map(n => n.id)
  const outputIds = nodes.filter(n => n.type === 'OUTPUT').map(n => n.id)
  const qOutputs  = outputIds.filter(id => Q_OUTPUT_RE.test(id))

  const hasClk     = inputIds.includes('CLK')
  const dataInputs = inputIds.filter(id => id !== 'CLK')
  const set        = new Set(dataInputs)
  const exactly    = (ids) => ids.length === set.size && ids.every(id => set.has(id))

  // Named single/multi-stage patterns are checked FIRST, before the
  // multi-output counter fallback below. This matters for lessons like
  // 05-t-flipflop.js: two cascaded, independently-driven T stages (T1/T2)
  // produce two "Qn" outputs (Q1, Q2) — structurally that looks like a
  // counter (multiple Q-bits) but it isn't one: each stage has its own
  // player-controlled data input, whereas a real counter's later stages
  // are driven only by the previous stage's Q, never by a fresh INPUT.
  if (exactly(['S', 'R']) && !hasClk) return FF_TYPES.SR_LATCH
  if (exactly(['S', 'R']) &&  hasClk) return FF_TYPES.SR_FLIPFLOP
  if (exactly(['J', 'K']) &&  hasClk) return FF_TYPES.JK_FLIPFLOP
  if (exactly(['D'])      &&  hasClk) return FF_TYPES.D_FLIPFLOP
  if (hasClk && dataInputs.length > 0 && dataInputs.every(id => T_INPUT_RE.test(id))) {
    return FF_TYPES.T_FLIPFLOP
  }

  // Nothing matched a named single-flip-flop pattern — a genuine counter
  // (ripple/mod-N/ring/Johnson) has multiple Qn outputs but no per-stage
  // data input of its own, so it falls through to here instead.
  if (qOutputs.length > 1) return FF_TYPES.COUNTER
  return FF_TYPES.UNKNOWN
}

/**
 * nextState(type, qCurrent, ins)
 *
 * @param type      one of FF_TYPES
 * @param qCurrent  boolean|undefined — the flip-flop's current Q
 * @param ins       { [inputId]: boolean } — current driven data-input values
 *                  (CLK excluded — the diagram is drawn "as of the last
 *                  clock edge", it doesn't model edge-timing itself)
 * @returns { q, kind, label } — kind is one of HOLD/SET/RESET/TOGGLE/FORBIDDEN/UNKNOWN
 */
export function nextState(type, qCurrent, ins = {}) {
  switch (type) {
    case FF_TYPES.SR_LATCH:
    case FF_TYPES.SR_FLIPFLOP: {
      const { S, R } = ins
      if (S && R)  return { q: undefined, kind: 'FORBIDDEN', label: 'S=1, R=1' }
      if (S)       return { q: true,      kind: 'SET',       label: 'S=1, R=0' }
      if (R)       return { q: false,     kind: 'RESET',     label: 'S=0, R=1' }
      return           { q: qCurrent,   kind: 'HOLD',      label: 'S=0, R=0' }
    }
    case FF_TYPES.JK_FLIPFLOP: {
      const { J, K } = ins
      if (J && K) return { q: !qCurrent, kind: 'TOGGLE', label: 'J=1, K=1' }
      if (J)      return { q: true,      kind: 'SET',    label: 'J=1, K=0' }
      if (K)      return { q: false,     kind: 'RESET',  label: 'J=0, K=1' }
      return          { q: qCurrent,   kind: 'HOLD',   label: 'J=0, K=0' }
    }
    case FF_TYPES.D_FLIPFLOP: {
      const { D } = ins
      return D
        ? { q: true,  kind: 'SET',   label: 'D=1' }
        : { q: false, kind: 'RESET', label: 'D=0' }
    }
    case FF_TYPES.T_FLIPFLOP: {
      // Multi-stage T lessons (05-t-flipflop.js) wire T1/T2 per stage —
      // any one of them is the "T" for the state this diagram is tracking.
      const tVal = Object.values(ins).some(Boolean)
      return tVal
        ? { q: !qCurrent, kind: 'TOGGLE', label: 'T=1' }
        : { q: qCurrent,  kind: 'HOLD',   label: 'T=0' }
    }
    default:
      return { q: qCurrent, kind: 'UNKNOWN', label: '' }
  }
}

/**
 * STATE_LEGEND[type] — the textbook-canonical transition table, independent
 * of any live signal. Used to draw the full diagram outline (all possible
 * edges) even before the player has clicked every input combination.
 */
export const STATE_LEGEND = {
  [FF_TYPES.SR_LATCH]: [
    { label: 'S=0, R=0', kind: 'HOLD' },
    { label: 'S=1, R=0', kind: 'SET' },
    { label: 'S=0, R=1', kind: 'RESET' },
    { label: 'S=1, R=1', kind: 'FORBIDDEN' },
  ],
  [FF_TYPES.SR_FLIPFLOP]: [
    { label: 'S=0, R=0', kind: 'HOLD' },
    { label: 'S=1, R=0', kind: 'SET' },
    { label: 'S=0, R=1', kind: 'RESET' },
    { label: 'S=1, R=1', kind: 'FORBIDDEN' },
  ],
  [FF_TYPES.JK_FLIPFLOP]: [
    { label: 'J=0, K=0', kind: 'HOLD' },
    { label: 'J=1, K=0', kind: 'SET' },
    { label: 'J=0, K=1', kind: 'RESET' },
    { label: 'J=1, K=1', kind: 'TOGGLE' },
  ],
  [FF_TYPES.D_FLIPFLOP]: [
    { label: 'D=1', kind: 'SET' },
    { label: 'D=0', kind: 'RESET' },
  ],
  [FF_TYPES.T_FLIPFLOP]: [
    { label: 'T=0', kind: 'HOLD' },
    { label: 'T=1', kind: 'TOGGLE' },
  ],
}

/**
 * dataInputIds(nodes) — which INPUT node ids feed the flip-flop's
 * data inputs (excludes CLK). Used by the caller to build the `ins` object
 * nextState() expects, straight from canvasStore.inputs.
 */
export function dataInputIds(nodes = []) {
  return nodes
    .filter(n => n.type === 'INPUT' && n.id !== 'CLK')
    .map(n => n.id)
}

/**
 * primaryDataInputId(ffType, dataIds, qIds) — for a T_FLIPFLOP with
 * cascaded stages (T1/Q1, T2/Q2, ...), the diagram only tracks ONE stage's
 * Q, so it needs the ONE T input that actually feeds that stage — never
 * an OR of every stage's T, which would make stage 2's toggle bleed into
 * stage 1's diagram. Matches by trailing digit (T1 ↔ Q1); falls back to
 * the first data input for every other (non-cascaded) type.
 */
export function primaryDataInputId(ffType, dataIds = [], qIds = []) {
  if (ffType !== FF_TYPES.T_FLIPFLOP) return null   // only cascaded T-stages need this
  if (dataIds.length <= 1) return dataIds[0]
  const qSuffix = (qIds[0] || '').replace(/^Q/, '')
  return dataIds.find(id => id.replace(/^T/, '') === qSuffix) || dataIds[0]
}
