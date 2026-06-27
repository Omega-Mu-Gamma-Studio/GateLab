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

function runEval(nodes, wires, inputs) {
  const brokenIds = new Set(
    wires.filter(w => w.broken).map(w => w.id)
  )
  return evaluate(nodes, wires, inputs, brokenIds)
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
    const signals = runEval(nodes, wires, inputs)

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
    })
  },

  // ── Toggle a driven input (INPUT node) ───────────────────────────────
  toggleInput(nodeId) {
    const { inputs, nodes, wires } = get()
    const next = { ...inputs, [nodeId]: !inputs[nodeId] }
    const signals = runEval(nodes, wires, next)
    set({ inputs: next, signals })
  },

  // ── Move a gate (drag end) ───────────────────────────────────────────
  moveNode(nodeId, x, y) {
    const nodes = get().nodes.map(n =>
      n.id === nodeId ? { ...n, x, y } : n
    )
    const signals = runEval(nodes, get().wires, get().inputs)
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
    const signals = runEval(nodes, nextWires, inputs)
    set({ wires: nextWires, signals, dragWire: null })
  },
  cancelDragWire() {
    set({ dragWire: null })
  },

  // ── Remove a wire (try phase) ─────────────────────────────────────────
  removeWire(wireId) {
    const { nodes, inputs } = get()
    const wires = get().wires.filter(w => w.id !== wireId)
    const signals = runEval(nodes, wires, inputs)
    set({ wires, signals })
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
    })
  },
}))