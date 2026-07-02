/**
 * timingStore.js
 *
 * Backs the Timing Diagram panel (Units III & IV). Holds a rolling window
 * of signal snapshots — one entry per "event" (an input toggle, a clock
 * edge, a wire added/removed) — for whichever nodes are worth charting in
 * the current lesson.
 *
 * Important honesty note, because it affects how this should be read:
 * this is an EVENT timeline, not a real-time oscilloscope trace. Each tick
 * is one user action, not one millisecond or one clock cycle at a fixed
 * frequency. That's a deliberate simplification — GateLab's simulation
 * engine (GraphEvaluator) is a topological graph evaluator, not a timed
 * event simulator, so there's no wall-clock delay to plot yet. What IS
 * meaningful here: order of transitions, which signals moved together,
 * and whether a flip-flop/counter actually holds or changes state the way
 * the lesson says it should. TimingDiagram.jsx labels this plainly so it's
 * never mistaken for a real timing analysis.
 *
 * "Which nodes get charted" is derived automatically from node TYPE
 * (INPUT, CLOCK, OUTPUT) rather than per-lesson config — so every lesson
 * gets a sensible chart with zero authoring work, including lessons that
 * don't exist yet.
 */
import { create } from 'zustand'

const MAX_HISTORY = 40   // rolling window — oldest ticks drop off the front
const MAX_TRACKED  = 8   // cap rows so the panel stays legible at 20vw width

const CHARTABLE_TYPES = new Set(['INPUT', 'CLOCK', 'OUTPUT'])

function deriveTracked(nodes) {
  return nodes
    .filter(n => CHARTABLE_TYPES.has(n.type))
    .slice(0, MAX_TRACKED)
    .map(n => ({ id: n.id, type: n.type }))
}

const useTimingStore = create((set, get) => ({
  trackedNodes: [],   // [{ id, type }] — which signals this lesson charts
  history:      [],   // [{ t, values: { [nodeId]: bool|undefined } }]
  tick:         0,

  // Called when a new lesson phase loads. Picks fresh tracked nodes and
  // seeds tick 0 from the phase's initial signals so the chart never opens
  // empty.
  reset(nodes, signals = {}) {
    const trackedNodes = deriveTracked(nodes || [])
    const seed = {
      t: 0,
      values: Object.fromEntries(trackedNodes.map(n => [n.id, signals[n.id]?.output])),
    }
    set({ trackedNodes, history: [seed], tick: 1 })
  },

  // Called after any action that actually changes signal state (toggling
  // an input, adding/removing a wire). NOT called on pure UI actions like
  // dragging a gate's position — that would spam the trace with no signal
  // change to show for it.
  record(signals) {
    const { trackedNodes, history, tick } = get()
    if (trackedNodes.length === 0) return
    const entry = {
      t: tick,
      values: Object.fromEntries(trackedNodes.map(n => [n.id, signals[n.id]?.output])),
    }
    const nextHistory = [...history, entry].slice(-MAX_HISTORY)
    set({ history: nextHistory, tick: tick + 1 })
  },

  // Manual "clear trace" — keeps the same tracked nodes, wipes history.
  clearTrace() {
    const { trackedNodes } = get()
    set({ history: [], tick: 0 })
    if (trackedNodes.length) {
      set({ history: [{ t: 0, values: Object.fromEntries(trackedNodes.map(n => [n.id, undefined])) }], tick: 1 })
    }
  },
}))

export default useTimingStore
