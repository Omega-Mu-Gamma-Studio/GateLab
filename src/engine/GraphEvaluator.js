/**
 * GraphEvaluator.js
 *
 * Pure function circuit evaluator. Takes a circuit snapshot
 * (nodes + wires + driven inputs) and returns a signal map:
 *   { [nodeId]: { output: bool|undefined, inputs: [bool|undefined, ...] } }
 * COMPOSITE nodes additionally carry an `outputs: [Q, Qbar]` array (see
 * below) — `output` still mirrors outputs[0] for single-output callers.
 *
 * Evaluation is topological — sources first, then gates in dependency order.
 * Cycles are detected and broken (undefined propagates through a cycle,
 * unless a held previous value is available — see prevSignals below).
 *
 * @param prevSignals - the signal map from the last evaluation. Optional,
 *   defaults to {}. Used only to resolve feedback loops that would otherwise
 *   float: a cross-coupled latch or flip-flop internal that can't derive a
 *   fresh value this pass holds whatever it last had, instead of forgetting
 *   its state on every recompute. Pass {} (or omit) for a fresh circuit with
 *   no history — e.g. when a new lesson phase loads.
 *
 * This module has zero React / Konva / Zustand dependencies.
 * It can be called from canvasStore, unit tests, or GraphEvaluator workers.
 *
 * COMPOSITE nodes — Block Mode —
 * A COMPOSITE node represents a whole flip-flop (SR latch/FF, JK, D, T) as
 * one black-box unit, simulated behaviorally via FlipFlopModels.nextState()
 * instead of a gate-level netlist. It has no entry in GATE_LOGIC — it's
 * dispatched separately by evaluateComposite() below — but it flows through
 * the exact same topo-sort / wiresByDest machinery as every other node, so
 * a COMPOSITE's Q can feed an ordinary gate, and an ordinary gate's output
 * can feed a COMPOSITE's CLK/data pin, with no special-casing anywhere else
 * in this file. Composite outputs are multi-valued (Q at index 0, Q̄ at
 * index 1 — see COMPOSITE_OUTPUT_PINS), so signals for a COMPOSITE node
 * carry an `outputs` array alongside the legacy single `output` field
 * (which mirrors outputs[0] / Q, for any caller still reading `.output`).
 */
import { nextState, COMPOSITE_INPUT_PINS, hasClkPin } from './FlipFlopModels'

const GATE_LOGIC = {
  AND:    (ins) => ins.every(Boolean),
  OR:     (ins) => ins.some(Boolean),
  NOT:    (ins) => !ins[0],
  NAND:   (ins) => !ins.every(Boolean),
  NOR:    (ins) => !ins.some(Boolean),
  XOR:    (ins) => ins[0] !== ins[1],
  XNOR:   (ins) => ins[0] === ins[1],
  INPUT:  (ins, node, driven) => driven[node.id] ?? false,
  CONST:  (ins, node) => !!node.value,
  OUTPUT: (ins) => ins[0],
  CLOCK:  (ins, node, driven) => driven[node.id] ?? false,
}

/**
 * evaluate(nodes, wires, inputs, brokenWireIds?)
 *
 * @param {object[]} nodes          - array of node descriptors
 * @param {object[]} wires          - array of wire descriptors
 * @param {object}   inputs         - { [nodeId]: boolean } driven values
 * @param {Set}      [brokenWireIds]- wire ids that are broken (float their dest)
 * @returns {object} signals        - { [nodeId]: { output, inputs: [] } }
 */
export function evaluate(nodes, wires, inputs = {}, brokenWireIds = new Set(), prevSignals = {}) {
  // Build adjacency: for each node, which wires feed into which input index
  // wiresByDest[nodeId][inputIndex] = { fromNodeId, wireId }
  const wiresByDest = {}
  for (const node of nodes) wiresByDest[node.id] = {}

  for (const wire of wires) {
    if (brokenWireIds.has(wire.id)) continue
    const { nodeId, index = 0 } = wire.to
    if (!wiresByDest[nodeId]) wiresByDest[nodeId] = {}
    wiresByDest[nodeId][index] = {
      fromNodeId: wire.from.nodeId,
      wireId:     wire.id,
      fromIndex:  wire.from.index ?? 0, // which output pin on the source (0 = Q / sole output, 1 = Qbar)
      isFeedback: !!wire.feedback,
    }
  }

  // Topological sort (Kahn's algorithm)
  // Build in-degree map counting how many non-broken, non-feedback wires
  // feed each node. `wire.feedback: true` marks a wire as a deliberate
  // one-tick register tap rather than an ordinary same-instant connection —
  // it's how a ring counter, Johnson counter, or any shift register with
  // wrap-around closes its loop. Without this, closing Q(last stage) back
  // into an earlier stage's data input makes the whole loop graph-cyclic;
  // this evaluator has no fixed-point settling pass (one evaluate() call =
  // one tick, see canvasStore.runEval), so whichever node in that cycle
  // happens to be evaluated first would read the "closing" wire's source as
  // not-yet-computed-this-pass — i.e. undefined — on every single tick,
  // forever, regardless of node declaration order. A feedback wire is
  // excluded here from in-degree entirely (so it can never be the thing
  // that makes a node un-topologically-sortable) and is resolved below by
  // reading prevSignals instead of signals — exactly what "samples the
  // previous tick" should mean for a wire that closes a loop.
  const inDegree = {}
  const dependents = {} // fromNodeId → [toNodeId]
  for (const node of nodes) {
    inDegree[node.id] = 0
    dependents[node.id] = []
  }
  for (const wire of wires) {
    if (brokenWireIds.has(wire.id) || wire.feedback) continue
    inDegree[wire.to.nodeId] = (inDegree[wire.to.nodeId] || 0) + 1
    if (!dependents[wire.from.nodeId]) dependents[wire.from.nodeId] = []
    dependents[wire.from.nodeId].push(wire.to.nodeId)
  }

  // Seeds: sources (INPUT, CONST, CLOCK) always go first
  const SOURCE_TYPES = new Set(['INPUT', 'CONST', 'CLOCK'])
  const queue = []
  for (const node of nodes) {
    if (SOURCE_TYPES.has(node.type) || inDegree[node.id] === 0) {
      queue.push(node.id)
    }
  }

  const evalOrder = []
  const visited = new Set()
  while (queue.length > 0) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    evalOrder.push(id)
    for (const depId of (dependents[id] || [])) {
      inDegree[depId]--
      if (inDegree[depId] === 0) queue.push(depId)
    }
  }

  // Any nodes not reached (cycle) get appended at the end — output = undefined
  for (const node of nodes) {
    if (!visited.has(node.id)) evalOrder.push(node.id)
  }

  // Build node map for quick lookup
  const nodeMap = {}
  for (const node of nodes) nodeMap[node.id] = node

  // Evaluate in order
  const signals = {}
  for (const nodeId of evalOrder) {
    const node = nodeMap[nodeId]
    if (!node) continue

    const isComposite = node.type === 'COMPOSITE'
    const logic = GATE_LOGIC[node.type]
    if (!logic && !isComposite) {
      signals[nodeId] = { output: undefined, inputs: [] }
      continue
    }

    // Resolve input values from upstream signals
    const geo = wiresByDest[nodeId] || {}
    // A node's real input count is however many pins are actually wired,
    // never less than the type's structural minimum. This matters for
    // gates like the 3-input NAND used in master-slave JK flip-flops —
    // two data inputs plus a feedback pin — which used to lose that
    // 3rd wire entirely because input count was hardcoded per type.
    const wiredIndices = Object.keys(geo).map(Number)
    const maxWiredIndex = wiredIndices.length ? Math.max(...wiredIndices) : -1
    const inputCount = Math.max(getInputCount(node), maxWiredIndex + 1)
    const resolvedInputs = []
    for (let i = 0; i < inputCount; i++) {
      const conn = geo[i]
      if (conn) {
        // Multi-output sources (COMPOSITE: Q at 0, Qbar at 1) resolve via
        // fromIndex; every other node type has a single `output`, which
        // resolveOutputValue falls back to when `outputs` isn't an array.
        // Feedback wires (see note above) deliberately read prevSignals —
        // last tick's value — instead of this tick's in-progress signals.
        const sourceSignals = conn.isFeedback ? prevSignals : signals
        resolvedInputs[i] = resolveOutputValue(sourceSignals[conn.fromNodeId], conn.fromIndex)
      } else {
        resolvedInputs[i] = undefined // floating
      }
    }

    if (isComposite) {
      signals[nodeId] = evaluateComposite(node, resolvedInputs, prevSignals)
      continue
    }

    // If any input is undefined (floating/broken), output is also undefined
    // Exception: OR with one HIGH input → output is HIGH regardless
    // Exception: AND with one LOW input → output is LOW regardless
    let output
    if (resolvedInputs.some(v => v === undefined)) {
      output = computeWithFloating(node.type, resolvedInputs)
      // Cross-coupled memory elements (SR latches, flip-flop internals) feed
      // back into their own inputs. On the very first evaluation that's a
      // genuine floating state — but once a value has been latched, losing
      // it back to "floating" on every recompute would mean nothing could
      // ever remember anything. Hold the last known output instead: this is
      // what makes S=0,R=0 actually hold Q, and what lets flip-flops keep
      // their state between clock edges instead of forgetting on every tick.
      if (output === undefined && prevSignals[nodeId]?.output !== undefined) {
        output = prevSignals[nodeId].output
      }
    } else {
      output = logic(resolvedInputs, node, inputs)
    }

    signals[nodeId] = { output, inputs: resolvedInputs }
  }

  return signals
}

/**
 * Some gates have defined outputs even with floating inputs.
 * AND(0, float) = 0, OR(1, float) = 1, etc.
 */
function computeWithFloating(type, ins) {
  switch (type) {
    case 'AND':
      if (ins.some(v => v === false)) return false
      return undefined
    case 'OR':
      if (ins.some(v => v === true)) return true
      return undefined
    case 'NAND':
      if (ins.some(v => v === false)) return true
      return undefined
    case 'NOR':
      if (ins.some(v => v === true)) return false
      return undefined
    default:
      return undefined
  }
}

/**
 * resolveOutputValue(signal, index)
 * What value does THIS pin of a source node currently carry?
 * Multi-output nodes (COMPOSITE: Q at 0, Qbar at 1) store an `outputs`
 * array — everything else has a single `output`, which every wire reads
 * regardless of the (unused, harmless) index it may carry.
 */
function resolveOutputValue(signal, index = 0) {
  if (!signal) return undefined
  if (Array.isArray(signal.outputs)) return signal.outputs[index]
  return signal.output
}

function getInputCount(node) {
  const type = node.type
  if (type === 'COMPOSITE') return (COMPOSITE_INPUT_PINS[node.ffKind] || []).length
  if (type === 'NOT' || type === 'OUTPUT') return 1
  if (type === 'INPUT' || type === 'CONST' || type === 'CLOCK') return 0
  return 2
}

/**
 * evaluateComposite(node, resolvedInputs, prevSignals)
 * Behavioral evaluation for a COMPOSITE (Block Mode) flip-flop node — the
 * exact same nextState() that already drives the State Diagram panel,
 * called here as the node's actual simulation instead of a gate netlist.
 *
 * Edge-triggering: every clocked kind only advances state on a CLK
 * rising edge (prevClk false → clkNow true), held in `_prevClk` on the
 * signal itself so the next evaluate() pass can see what CLK was last
 * time. Between edges — CLK steady high, steady low, or falling — the
 * output holds at its previous Q, matching real edge-triggered flip-flop
 * behavior rather than a level-sensitive latch's. SR_LATCH has no CLK
 * (hasClkPin === false) and recomputes every pass instead, since a latch
 * is level-sensitive by definition.
 */
function evaluateComposite(node, resolvedInputs, prevSignals) {
  const pinOrder = COMPOSITE_INPUT_PINS[node.ffKind]
  if (!pinOrder) {
    return { output: undefined, outputs: [undefined, undefined], inputs: resolvedInputs }
  }

  const pinVals = {}
  pinOrder.forEach((name, i) => { pinVals[name] = resolvedInputs[i] })

  const prevSignal = prevSignals[node.id] || {}
  const prevQ = Array.isArray(prevSignal.outputs) ? prevSignal.outputs[0] : undefined

  let q = prevQ
  if (!hasClkPin(node.ffKind)) {
    // Level-sensitive (SR latch): no edge to wait for, recompute every pass.
    q = nextState(node.ffKind, prevQ, pinVals).q
  } else {
    const clkNow    = !!pinVals.CLK
    const clkPrev   = !!prevSignal._prevClk
    const risingEdge = clkNow && !clkPrev
    if (risingEdge) {
      q = nextState(node.ffKind, prevQ, pinVals).q
    }
    // else: hold — output stays at prevQ (undefined until the first edge)
  }

  const qbar = q === undefined ? undefined : !q

  return {
    output:   q,          // legacy single-value field = Q, for any reader that ignores `outputs`
    outputs:  [q, qbar],  // index 0 = Q, index 1 = Qbar — matches COMPOSITE_OUTPUT_PINS order
    inputs:   resolvedInputs,
    _prevClk: hasClkPin(node.ffKind) ? !!pinVals.CLK : undefined,
  }
}

/**
 * getSignalForWire(wire, signals)
 * Convenience: what value is actually flowing through this wire?
 */
export function getSignalForWire(wire, signals) {
  return resolveOutputValue(signals[wire.from.nodeId], wire.from.index ?? 0)
}
