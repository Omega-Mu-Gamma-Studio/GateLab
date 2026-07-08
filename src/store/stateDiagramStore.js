/**
 * stateDiagramStore.js
 *
 * Backs the State Diagram panel (Unit III). Sibling to timingStore.js and
 * built on the same pattern: cheap per-node-TYPE detection cached once at
 * reset(), cheap incremental updates on record() — no per-lesson authoring
 * required, so any lesson matching the Unit III node-naming convention
 * (S/R, J/K, D, T, CLK, Q, Qbar, Q0..Qn) gets a working diagram for free.
 *
 * Two rendering modes live behind this one store:
 *
 *   SINGLE FLIP-FLOP (SR/JK/D/T) — `currentQ` + `transition` describe
 *   the textbook two-state diagram (SET/RESET, or SET/RESET/HOLD/TOGGLE/
 *   FORBIDDEN depending on type). `transition` is recomputed fresh on
 *   every record() from FlipFlopModels.nextState() — it's a live "what
 *   the book says happens" readout, not a memory of the past.
 *
 *   COUNTER (ripple/mod-N/ring/Johnson) — there's no single textbook
 *   2-state diagram; the interesting thing IS the sequence. So instead
 *   `counterStates`/`counterEdges` are built empirically by watching the
 *   Q0..Qn bit-pattern change over time, same honesty policy as
 *   timingStore's "this is an event trace, not a real clock" — it only
 *   knows the states the player has actually driven the circuit through.
 */
import { create } from 'zustand'
import { detectFlipFlopType, dataInputIds, primaryDataInputId, nextState, FF_TYPES } from '../engine/FlipFlopModels'

const Q_ID_RE = /^Q\d*$/
const MAX_COUNTER_STATES = 16   // cycle graphs stop growing past this — plenty for ring/Johnson/mod-N

function qOutputIdsOf(nodes) {
  return nodes.filter(n => n.type === 'OUTPUT' && Q_ID_RE.test(n.id)).map(n => n.id).sort()
}

function bitKey(bits) {
  return bits.map(b => (b ? '1' : '0')).join('')
}

const useStateDiagramStore = create((set, get) => ({
  // ── Cached at reset() ──────────────────────────────────────────────
  ffType:  FF_TYPES.UNKNOWN,
  qIds:    [],   // OUTPUT ids that are Q / Q0 / Q1... (excludes Qbar)
  dataIds: [],   // non-CLK INPUT ids that drive the flip-flop

  // ── Single flip-flop live readout ───────────────────────────────────
  currentQ:      undefined,     // boolean|undefined
  dataInputVals: {},            // { [id]: boolean }
  transition:    null,          // { q, kind, label } | null — see FlipFlopModels.nextState

  // ── Counter empirical trace ──────────────────────────────────────────
  counterStates: [],   // [{ key, bits }] — distinct bit-patterns visited, first-seen order
  counterEdges:  [],   // [{ from, to }]  — observed key→key transitions

  // Called whenever a new lesson phase loads — fresh detection, fresh trace.
  reset(nodes = [], signals = {}) {
    const ffType  = detectFlipFlopType(nodes)
    const qIds    = qOutputIdsOf(nodes)
    const dataIds = dataInputIds(nodes)

    if (ffType === FF_TYPES.COUNTER) {
      const bits = qIds.map(id => !!signals[id]?.output)
      set({
        ffType, qIds, dataIds,
        currentQ: undefined, dataInputVals: {}, transition: null,
        counterStates: [{ key: bitKey(bits), bits }],
        counterEdges: [],
      })
      return
    }

    const qId = qIds[0]
    set({
      ffType, qIds, dataIds,
      currentQ: qId ? signals[qId]?.output : undefined,
      dataInputVals: {}, transition: null,
      counterStates: [], counterEdges: [],
    })
  },

  // Called after any action that changes signal state (toggle input, wire
  // added/removed) — same trigger points as timingStore.record().
  record(inputs = {}, signals = {}) {
    const { ffType, qIds, dataIds, counterStates, counterEdges } = get()

    if (ffType === FF_TYPES.COUNTER) {
      const bits    = qIds.map(id => !!signals[id]?.output)
      const key     = bitKey(bits)
      const prevKey = counterStates[counterStates.length - 1]?.key
      if (prevKey === key) return   // no bit-pattern change — nothing new to plot

      let nextStates = counterStates
      if (!counterStates.some(s => s.key === key) && counterStates.length < MAX_COUNTER_STATES) {
        nextStates = [...counterStates, { key, bits }]
      }
      let nextEdges = counterEdges
      if (prevKey && !counterEdges.some(e => e.from === prevKey && e.to === key)) {
        nextEdges = [...counterEdges, { from: prevKey, to: key }]
      }
      set({ counterStates: nextStates, counterEdges: nextEdges })
      return
    }

    const qId       = qIds[0]
    const currentQ  = qId ? signals[qId]?.output : undefined

    // Cascaded T-flip-flop lessons (T1/Q1, T2/Q2, ...) only scope to the
    // ONE stage this diagram is tracking — otherwise stage 2 toggling
    // would incorrectly light up stage 1's diagram. Every other type maps
    // all of its data inputs, since e.g. an SR diagram genuinely needs
    // both S and R together.
    const primaryId = primaryDataInputId(ffType, dataIds, qIds)
    const dataInputVals = primaryId
      ? { [primaryId]: !!inputs[primaryId] }
      : Object.fromEntries(dataIds.map(id => [id, !!inputs[id]]))

    const transition = ffType !== FF_TYPES.UNKNOWN ? nextState(ffType, currentQ, dataInputVals) : null
    set({ currentQ, dataInputVals, transition })
  },

  // Manual "clear trace" for the counter cycle graph — keeps the flip-flop
  // detection but wipes back down to just the currently-observed state.
  clearTrace() {
    const { counterStates } = get()
    set({ counterStates: counterStates.slice(-1), counterEdges: [] })
  },
}))

export default useStateDiagramStore
