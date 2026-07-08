/**
 * canvasStore.js
 *
 * Zustand store for the active circuit canvas state.
 *
 * Responsibilities:
 *   - Hold the current phase's nodes, wires, and driven inputs
 *   - Track UI interaction state (selected node, drag-wire in progress)
 *   - Run GraphEvaluator whenever circuit state changes
 *   - Expose actions for: loading a lesson phase, toggling inputs,
 *     moving gates, adding/removing wires (try phase)
 *
 * The store is reset whenever the lesson or phase changes.
 * lessonStore calls loadPhase() after each navigation action.
 */

import { create } from 'zustand'
import { evaluate } from '../engine/GraphEvaluator'
import useProgressStore from './progressStore.js'
import useTimingStore from './timingStore.js'
import useStateDiagramStore from './stateDiagramStore.js'

// prevSignals lets cross-coupled memory (latches, flip-flop internals) hold
// its last output across a recompute instead of forgetting on every call —
// see the docstring in GraphEvaluator.evaluate() for why that matters.
function runEval(nodes, wires, inputs, prevSignals = {}) {
  const brokenIds = new Set(
    wires.filter(w => w.broken).map(w => w.id)
  )
  return evaluate(nodes, wires, inputs, brokenIds, prevSignals)
}

export const useCanvasStore = create((set, get) => ({
  // ── Circuit state ────────────────────────────────────────────────────
  nodes:    [],
  wires:    [],
  inputs:   {},   // { [nodeId]: boolean }
  signals:  {},   // { [nodeId]: { output, inputs: [] } } — computed

  // ── UI state ─────────────────────────────────────────────────────────
  selectedNodeId:  null,
  faultNodeId:     null,   // gate to highlight red in break phase
  phase:           'work',  // mirrors lessonStore.phase
  hint:            '',

  // ── KMap config (for K-Map lessons) ──────────────────────────────────
  kmapConfig:      null,   // object | null

  // ── Success state (Group 2.2) ─────────────────────────────────────────
  lessonSolved:    false,

  // ── Speed Run (Group 5.2) ─────────────────────────────────────────────
  timerActive:     false,
  timerStart:      null,
  bestTimes:       {},    // { [lessonId]: ms }

  // Drag-wire state
  dragWire: null,  // null | { fromNodeId, fromPos: {x,y}, currentPos: {x,y} }

  // ── Load a full phase snapshot from a lesson file ────────────────────
  loadPhase(phaseData, phaseName) {
    const nodes   = phaseData.nodes   || []
    const wires   = phaseData.wires   || []
    const inputs  = { ...(phaseData.inputs || {}) }
    const signals = runEval(nodes, wires, inputs)   // fresh circuit — no held memory

    set({
      nodes,
      wires,
      inputs,
      signals,
      phase:          phaseName,
      hint:           phaseData.hint || '',
      faultNodeId:    phaseData.faultNodeId || null,
      selectedNodeId: null,
      dragWire:       null,
      lessonSolved:   false,
      kmapConfig:     phaseData.kmapConfig || null,
    })

    // New phase, new trace — Timing panel starts clean at tick 0.
    useTimingStore.getState().reset(nodes, signals)
    // New phase, new flip-flop detection — State Diagram panel re-derives
    // its type (SR/JK/D/T/counter) from this phase's node ids.
    useStateDiagramStore.getState().reset(nodes, signals)
  },

  // ── Toggle a driven input (INPUT node) ───────────────────────────────
  toggleInput(nodeId) {
    const { inputs, nodes, wires, signals } = get()
    const next = { ...inputs, [nodeId]: !inputs[nodeId] }
    const nextSignals = runEval(nodes, wires, next, signals)
    set({ inputs: next, signals: nextSignals })
    useTimingStore.getState().record(nextSignals)
    useStateDiagramStore.getState().record(next, nextSignals)
  },

  // ── Move a gate (drag end) ───────────────────────────────────────────
  moveNode(nodeId, x, y) {
    const nodes = get().nodes.map(n =>
      n.id === nodeId ? { ...n, x, y } : n
    )
    const signals = runEval(nodes, get().wires, get().inputs, get().signals)
    set({ nodes, signals })
  },

  // ── Select / deselect ────────────────────────────────────────────────
  selectNode(nodeId) {
    set({ selectedNodeId: nodeId })
  },
  clearSelection() {
    set({ selectedNodeId: null })
  },

  // ── Drag-wire: start, update, commit, cancel ─────────────────────────
  startDragWire(fromNodeId, fromPos) {
    set({ dragWire: { fromNodeId, fromPos, currentPos: fromPos } })
  },
  updateDragWire(currentPos) {
    const dw = get().dragWire
    if (!dw) return
    set({ dragWire: { ...dw, currentPos } })
  },
  commitDragWire(toNodeId, toPinIndex = 0) {
    const { dragWire, wires, nodes, inputs } = get()
    if (!dragWire) return

    // Prevent duplicate wires to the same pin
    const exists = wires.some(
      w => w.to.nodeId === toNodeId && w.to.index === toPinIndex
    )
    if (exists) {
      set({ dragWire: null })
      return
    }

    const newWire = {
      id:   `w_${Date.now()}`,
      from: { nodeId: dragWire.fromNodeId, pin: 'output' },
      to:   { nodeId: toNodeId, pin: 'input', index: toPinIndex },
    }
    const nextWires = [...wires, newWire]
    const signals = runEval(nodes, nextWires, inputs, get().signals)
    set({ wires: nextWires, signals, dragWire: null })
    useTimingStore.getState().record(signals)
    useStateDiagramStore.getState().record(inputs, signals)
  },
  cancelDragWire() {
    set({ dragWire: null })
  },

  // ── Remove a wire (try phase) ─────────────────────────────────────────
  removeWire(wireId) {
    const { nodes, inputs } = get()
    const wires = get().wires.filter(w => w.id !== wireId)
    const signals = runEval(nodes, wires, inputs, get().signals)
    set({ wires, signals })
    useTimingStore.getState().record(signals)
    useStateDiagramStore.getState().record(inputs, signals)
  },

  // ── Mark lesson as solved ─────────────────────────────────────────────
  setSolved(lessonId) {
    set({ lessonSolved: true })
    if (lessonId) {
      useProgressStore.getState().completeLesson(lessonId, 50)
    }
  },
  clearSolved() {
    set({ lessonSolved: false })
  },

  // ── Speed Run ─────────────────────────────────────────────────────────
  startTimer() {
    set({ timerActive: true, timerStart: Date.now() })
  },
  stopTimer(lessonId) {
    const { timerStart, bestTimes } = get()
    if (!timerStart) return
    const elapsed = Date.now() - timerStart
    const prev = bestTimes[lessonId]
    const next = prev === undefined || elapsed < prev ? elapsed : prev
    set({
      timerActive: false,
      timerStart: null,
      bestTimes: { ...bestTimes, [lessonId]: next },
    })
  },

  // ── Reset ─────────────────────────────────────────────────────────────
  reset() {
    set({
      nodes: [], wires: [], inputs: {}, signals: {},
      selectedNodeId: null, faultNodeId: null,
      phase: 'work', hint: '', dragWire: null,
      lessonSolved: false, timerActive: false, timerStart: null,
      kmapConfig: null,
    })
  },
}))