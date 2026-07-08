/**
 * hazardStore.js
 *
 * Backs HazardCanvas.jsx (Unit IV only). Sibling to timingStore.js and
 * stateDiagramStore.js, built on the same pattern: derived automatically
 * from whatever circuit is loaded, zero per-lesson authoring required.
 *
 * Where timingStore keeps an EVENT trace (one entry per user action, no
 * simulated delay) and GraphEvaluator gives an INSTANTANEOUS snapshot,
 * this store runs EventSimulator.simulate() across the most recent input
 * transition and keeps the full delay-timed result: every intermediate
 * event, every glitch, and a scrubber position the player can drag
 * through to watch the propagation (and any hazard) unfold gate-by-gate.
 *
 * "Most recent transition" means exactly what canvasStore.toggleInput
 * just did: whatever the driven inputs were a moment ago, and whatever
 * they are now. Multiple inputs changing in the same click aren't
 * possible today (toggleInput flips one INPUT node at a time) but the
 * simulate() call already accepts multiple simultaneous inputEvents for
 * whenever that changes — nothing here assumes exactly one.
 */
import { create } from 'zustand'
import { simulate, criticalPath, delayFor, GATE_DELAY } from '../engine/EventSimulator'

const useHazardStore = create((set, get) => ({
  // ── Cached at reset() ─────────────────────────────────────────────────
  nodes:         [],
  wires:         [],
  lastInputs:    {},    // driven INPUT values as of the last settle/record

  // ── Populated by record() / reset() ────────────────────────────────────
  events:        [],    // [{ t, nodeId, value }]
  waveforms:     {},    // { [nodeId]: [{ t, value }] }
  glitches:      [],    // [{ nodeId, tStart, tEnd, settledValue }]
  criticalDelay: 0,     // longest INPUT→OUTPUT delay chain in the circuit
  criticalNodeId: null,
  maxT:          0,     // the last committed event's time — scrubber ceiling

  // ── Scrubber position, in tpd units, 0..maxT ───────────────────────────
  scrubT:        0,
  playing:       false,

  // ── Per-node delay overrides, from the delay-slider UI ─────────────────
  delayOverrides: {},

  // Called when a new lesson phase loads (mirrors timingStore.reset).
  reset(nodes, wires, inputs = {}) {
    const cp = criticalPath(nodes || [], wires || [])
    set({
      nodes: nodes || [],
      wires: wires || [],
      lastInputs: { ...inputs },
      events: [],
      waveforms: {},
      glitches: [],
      criticalDelay: cp.delay,
      criticalNodeId: cp.outputNodeId,
      maxT: 0,
      scrubT: 0,
      playing: false,
      delayOverrides: {},
    })
  },

  // Called after canvasStore.toggleInput actually flips a driven input.
  // Re-simulates the transition from lastInputs -> nextInputs with full
  // gate delay, so the hazard panel reflects exactly the click that just
  // happened — this is what a player toggling A while watching the panel
  // is meant to see: the glitch (if any) for THIS transition.
  record(prevInputs, nextInputs) {
    const { nodes, wires, delayOverrides } = get()
    if (nodes.length === 0) return

    const brokenWireIds = new Set(wires.filter(w => w.broken).map(w => w.id))

    const inputEvents = []
    for (const node of nodes) {
      if (node.type !== 'INPUT' && node.type !== 'CLOCK') continue
      const before = !!prevInputs[node.id]
      const after = !!nextInputs[node.id]
      if (before !== after) inputEvents.push({ t: 0, nodeId: node.id, value: after })
    }
    if (inputEvents.length === 0) return   // nothing actually changed

    const result = simulate(nodes, wires, prevInputs, inputEvents, brokenWireIds, { delayOverrides })
    const maxT = result.criticalPathDelay

    set({
      lastInputs: { ...nextInputs },
      events: result.events,
      waveforms: result.waveforms,
      glitches: result.glitches,
      maxT,
      scrubT: maxT,   // land on the fully-settled end state by default
      playing: false,
    })
  },

  // ── Scrubber controls ──────────────────────────────────────────────────
  setScrubT(t) {
    const { maxT } = get()
    set({ scrubT: Math.max(0, Math.min(maxT, t)), playing: false })
  },

  scrubToStart() { set({ scrubT: 0, playing: false }) },
  scrubToEnd()   { set(state => ({ scrubT: state.maxT, playing: false })) },

  setPlaying(playing) { set({ playing }) },

  // Advance the scrubber by one animation tick (called from a rAF/interval
  // loop in the component — the store just clamps and stops at the end).
  tickPlayback(deltaT) {
    const { scrubT, maxT, playing } = get()
    if (!playing) return
    const next = scrubT + deltaT
    if (next >= maxT) {
      set({ scrubT: maxT, playing: false })
    } else {
      set({ scrubT: next })
    }
  },

  // ── Delay slider controls ──────────────────────────────────────────────
  // Per-gate override, in tpd units. Passing `undefined` clears the
  // override and falls back to the type-based default (see GATE_DELAY).
  setDelayOverride(nodeId, tpd) {
    const { delayOverrides } = get()
    const next = { ...delayOverrides }
    if (tpd === undefined || tpd === null) delete next[nodeId]
    else next[nodeId] = tpd
    set({ delayOverrides: next })
    // Re-derive the critical path immediately so the delay readout stays
    // live while the player is still dragging a slider, even before they
    // trigger a fresh input transition.
    const { nodes, wires } = get()
    const brokenWireIds = new Set(wires.filter(w => w.broken).map(w => w.id))
    const cp = criticalPath(nodes, wires, brokenWireIds, { delayOverrides: next })
    set({ criticalDelay: cp.delay, criticalNodeId: cp.outputNodeId })
  },

  // Convenience for the UI: what delay is this node currently using?
  effectiveDelay(nodeId) {
    const { nodes, delayOverrides } = get()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return GATE_DELAY.AND
    return delayFor(node, delayOverrides)
  },

  // ── What's the value of a given node AT the current scrub position? ────
  // Walks that node's own waveform for the last transition at or before
  // scrubT. Falls back to lastInputs / undefined for nodes with no
  // recorded waveform yet (e.g. right after reset(), before any toggle).
  valueAt(nodeId, t) {
    const { waveforms, lastInputs } = get()
    const points = waveforms[nodeId]
    if (!points || points.length === 0) return lastInputs[nodeId]
    let value = points[0].value
    for (const p of points) {
      if (p.t > t) break
      value = p.value
    }
    return value
  },

  // ── Is this node mid-glitch AT the current scrub position? ─────────────
  glitchAt(nodeId, t) {
    const { glitches } = get()
    return glitches.find(g => g.nodeId === nodeId && t >= g.tStart && t < g.tEnd) || null
  },
}))

export default useHazardStore
