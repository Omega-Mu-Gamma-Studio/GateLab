/**
 * GraphEvaluator.js
 *
 * Pure function circuit evaluator. Takes a circuit snapshot
 * (nodes + wires + driven inputs) and returns a signal map:
 *   { [nodeId]: { output: bool|undefined, inputs: [bool|undefined, ...] } }
 *
 * Evaluation is topological — sources first, then gates in dependency order.
 * Cycles are detected and broken (undefined propagates through a cycle).
 *
 * This module has zero React / Konva / Zustand dependencies.
 * It can be called from canvasStore, unit tests, or GraphEvaluator workers.
 */

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
export function evaluate(nodes, wires, inputs = {}, brokenWireIds = new Set()) {
  // Build adjacency: for each node, which wires feed into which input index
  // wiresByDest[nodeId][inputIndex] = { fromNodeId, wireId }
  const wiresByDest = {}
  for (const node of nodes) wiresByDest[node.id] = {}

  for (const wire of wires) {
    if (brokenWireIds.has(wire.id)) continue
    const { nodeId, index = 0 } = wire.to
    if (!wiresByDest[nodeId]) wiresByDest[nodeId] = {}
    wiresByDest[nodeId][index] = { fromNodeId: wire.from.nodeId, wireId: wire.id }
  }

  // Topological sort (Kahn's algorithm)
  // Build in-degree map counting how many non-broken wires feed each node
  const inDegree = {}
  const dependents = {} // fromNodeId → [toNodeId]
  for (const node of nodes) {
    inDegree[node.id] = 0
    dependents[node.id] = []
  }
  for (const wire of wires) {
    if (brokenWireIds.has(wire.id)) continue
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

    const logic = GATE_LOGIC[node.type]
    if (!logic) {
      signals[nodeId] = { output: undefined, inputs: [] }
      continue
    }

    // Resolve input values from upstream signals
    const geo = wiresByDest[nodeId] || {}
    const inputCount = getInputCount(node.type)
    const resolvedInputs = []
    for (let i = 0; i < inputCount; i++) {
      const conn = geo[i]
      if (conn) {
        resolvedInputs[i] = signals[conn.fromNodeId]?.output
      } else {
        resolvedInputs[i] = undefined // floating
      }
    }

    // If any input is undefined (floating/broken), output is also undefined
    // Exception: OR with one HIGH input → output is HIGH regardless
    // Exception: AND with one LOW input → output is LOW regardless
    let output
    if (resolvedInputs.some(v => v === undefined)) {
      output = computeWithFloating(node.type, resolvedInputs)
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

function getInputCount(type) {
  if (type === 'NOT' || type === 'OUTPUT') return 1
  if (type === 'INPUT' || type === 'CONST' || type === 'CLOCK') return 0
  return 2
}

/**
 * getSignalForWire(wire, signals)
 * Convenience: what value is actually flowing through this wire?
 */
export function getSignalForWire(wire, signals) {
  return signals[wire.from.nodeId]?.output
}
