/**
 * EventSimulator.js
 *
 * Pure function, delay-aware circuit simulator. Companion to
 * GraphEvaluator.js — where GraphEvaluator answers "what is every wire's
 * value right now" (instantaneous, zero-delay), this module answers
 * "what does every wire's value do OVER TIME after an input changes,
 * given that every gate takes a little while to respond."
 *
 * This is what makes race conditions, static hazards, and dynamic hazards
 * actually visible as glitches instead of just a story about them: with
 * zero-delay evaluation every signal "jumps" straight to its new steady
 * state, so a circuit with a real static-1 hazard and a perfectly hazard-
 * free redesign LOOK IDENTICAL to GraphEvaluator. Simulated propagation
 * delay is the only way to tell them apart, because the glitch only
 * exists in the gap between "old value" and "new value settling."
 *
 * DESIGN NOTE — delay is derived from gate TYPE, not per-lesson-authored,
 * same convention as FlipFlopModels' flip-flop detection and timingStore's
 * chartable-node detection: every gate already has a `type`, so every
 * Unit IV lesson gets a working simulation for free. Values are expressed
 * in abstract "gate delay units" (tpd) — GateLab's own narrative text
 * (see 06-delay-model.js) treats 1 tpd ~= 10 ns, so tpd * 10 is what a
 * UI should show if it wants a nanosecond label.
 *
 * Zero React / Konva / Zustand dependencies, same as GraphEvaluator —
 * callable from a store, a component, or a unit test.
 */

/**
 * GATE_DELAY — propagation delay in abstract tpd units, per gate type.
 * Matches the lore text in 06-delay-model.js: NOT/BUF is fastest, AND/OR/
 * NAND/NOR are one tier slower, XOR/XNOR (built from multiple NAND stages
 * in real silicon) are slowest. INPUT/OUTPUT/CONST/CLOCK are pure wires
 * from the simulator's point of view — they don't compute anything, so
 * they introduce no delay of their own.
 */
export const GATE_DELAY = {
  NOT:    1,
  BUF:    1,
  AND:    2,
  OR:     2,
  NAND:   2,
  NOR:    2,
  XOR:    4,
  XNOR:   4,
  INPUT:  0,
  OUTPUT: 0,
  CONST:  0,
  CLOCK:  0,
}

const DEFAULT_DELAY = 2   // fallback for any future gate type not listed above

/**
 * delayFor(node, overrides) — a node's effective delay: per-node override
 * (from a delay-slider UI) if present, otherwise the type-based default.
 */
export function delayFor(node, overrides = {}) {
  if (typeof overrides[node.id] === 'number') return overrides[node.id]
  return GATE_DELAY[node.type] ?? DEFAULT_DELAY
}

const GATE_LOGIC = {
  AND:  (ins) => ins.every(Boolean),
  OR:   (ins) => ins.some(Boolean),
  NOT:  (ins) => !ins[0],
  BUF:  (ins) => !!ins[0],
  NAND: (ins) => !ins.every(Boolean),
  NOR:  (ins) => !ins.some(Boolean),
  XOR:  (ins) => ins[0] !== ins[1],
  XNOR: (ins) => ins[0] === ins[1],
}

/**
 * buildTopology(nodes, wires, brokenWireIds)
 * Shared prep: adjacency + node lookup, reused by both the settle-state
 * pass and the event scheduler below.
 */
function buildTopology(nodes, wires, brokenWireIds) {
  const nodeMap = {}
  for (const node of nodes) nodeMap[node.id] = node

  // wiresByDest[nodeId][inputIndex] = fromNodeId
  const wiresByDest = {}
  for (const node of nodes) wiresByDest[node.id] = {}
  for (const wire of wires) {
    if (brokenWireIds.has(wire.id)) continue
    const { nodeId, index = 0 } = wire.to
    if (!wiresByDest[nodeId]) wiresByDest[nodeId] = {}
    wiresByDest[nodeId][index] = wire.from.nodeId
  }

  // dependents[fromNodeId] = [toNodeId, ...] — who reacts when this node changes
  const dependents = {}
  for (const node of nodes) dependents[node.id] = []
  for (const wire of wires) {
    if (brokenWireIds.has(wire.id)) continue
    if (!dependents[wire.from.nodeId]) dependents[wire.from.nodeId] = []
    dependents[wire.from.nodeId].push(wire.to.nodeId)
  }

  return { nodeMap, wiresByDest, dependents }
}

function resolveInputs(nodeId, wiresByDest, valueOf) {
  const geo = wiresByDest[nodeId] || {}
  const indices = Object.keys(geo).map(Number)
  const count = Math.max(indices.length ? Math.max(...indices) + 1 : 0, 0)
  const ins = []
  for (let i = 0; i < count; i++) {
    const fromId = geo[i]
    ins[i] = fromId !== undefined ? valueOf(fromId) : undefined
  }
  return ins
}

function computeOutput(node, ins) {
  const logic = GATE_LOGIC[node.type]
  if (!logic) return undefined
  if (ins.some(v => v === undefined)) {
    // Same floating-input special cases as GraphEvaluator, kept local and
    // minimal here — the event simulator's job is delay/glitch behavior,
    // not re-deriving every floating-input edge case.
    if (node.type === 'AND' || node.type === 'NAND') {
      if (ins.some(v => v === false)) return node.type === 'AND' ? false : true
      return undefined
    }
    if (node.type === 'OR' || node.type === 'NOR') {
      if (ins.some(v => v === true)) return node.type === 'OR' ? true : false
      return undefined
    }
    return undefined
  }
  return logic(ins)
}

/**
 * simulate(nodes, wires, initialInputs, inputEvents, brokenWireIds?, opts?)
 *
 * @param nodes           circuit nodes (same shape as GraphEvaluator)
 * @param wires           circuit wires
 * @param initialInputs   { [nodeId]: boolean } — driven INPUT values BEFORE
 *                        any of inputEvents fire. The simulation starts
 *                        from the settled state these produce.
 * @param inputEvents     [{ t, nodeId, value }] — one or more INPUT nodes
 *                        changing at given times (t in tpd units, t=0 is
 *                        "right after the initial settle"). Multiple
 *                        events at t=0 model simultaneous input changes
 *                        (the classic race-condition setup).
 * @param brokenWireIds   Set of wire ids to treat as disconnected
 * @param opts.delayOverrides  { [nodeId]: number } — per-gate delay overrides
 * @param opts.maxTime         safety cap on simulated time (default 200 tpd)
 *
 * @returns {
 *   events:      [{ t, nodeId, value }]  every output transition, in order
 *   waveforms:   { [nodeId]: [{ t, value }] }  per-node value-over-time,
 *                convenience view built from `events` for direct charting
 *   glitches:    [{ nodeId, tStart, tEnd, settledValue }]
 *   finalValues: { [nodeId]: boolean|undefined }  steady state once quiet
 *   criticalPathDelay: number  time from t=0 until the last event fires
 * }
 */
export function simulate(nodes, wires, initialInputs = {}, inputEvents = [], brokenWireIds = new Set(), opts = {}) {
  const { delayOverrides = {}, maxTime = 200 } = opts
  const { nodeMap, wiresByDest, dependents } = buildTopology(nodes, wires, brokenWireIds)

  // ── Phase 1: settle the circuit at t < 0 using initialInputs, with zero
  // simulated delay — this is "however long ago the system was last quiet."
  const settled = settleInstantaneous(nodes, wiresByDest, initialInputs, nodeMap)

  // ── Phase 2: current committed value per node, updated as events fire.
  const current = { ...settled }
  const settledAt = {}   // last value each node held before this sim's events began
  for (const id of Object.keys(current)) settledAt[id] = current[id]

  // ── Phase 3: discrete event queue, ordered by time. Each entry is a
  // *scheduled* output change: "at time t, nodeId's output becomes value."
  //
  // Each gate's future events are computed independently, one per
  // triggering predecessor change, using the circuit state AS IT STOOD
  // at the moment that predecessor changed — not a value borrowed from
  // some other, still-in-flight future event. This is what makes a real
  // glitch pulse fall out naturally: if input A's effect reaches a gate
  // via a fast path (arrives, dips the gate) and input B's effect reaches
  // the same gate via a slower path (arrives afterward, recovers the
  // gate), both transitions get their own scheduled time and the queue's
  // natural chronological order produces dip-then-recover, exactly like
  // a real hazard.
  //
  // `lastTarget[nodeId]` tracks the value most recently SCHEDULED for a
  // node (whether that scheduled event has fired yet or not) — this, not
  // the committed `current[nodeId]`, is what a fresh recompute must be
  // compared against to decide "is this actually a new transition,"
  // otherwise a still-pending dip would be invisibly cancelled by a
  // later-arriving predecessor that (correctly) computes the gate's
  // eventual resting value before the dip has even landed.
  const queue = []
  const events = []   // committed, in time order
  const lastTarget = { ...current }   // seeded from settled state

  function schedule(t, nodeId, value) {
    if (t > maxTime) return
    if (lastTarget[nodeId] === value) return   // already the pending/settled target — no-op
    lastTarget[nodeId] = value
    queue.push({ t, nodeId, value })
  }

  // Seed the queue with the driven input events themselves — inputs have
  // zero gate delay (they're switches, not gates), so they take effect
  // exactly at their given time.
  for (const ev of inputEvents) {
    schedule(ev.t, ev.nodeId, ev.value)
  }

  const drivenInputs = { ...initialInputs }

  let iterations = 0
  const MAX_ITERATIONS = 5000   // safety valve against a pathological oscillation
  while (queue.length > 0 && iterations++ < MAX_ITERATIONS) {
    // Pop the earliest-scheduled event (stable: ties broken by insertion order)
    queue.sort((a, b) => a.t - b.t)
    const ev = queue.shift()

    const node = nodeMap[ev.nodeId]
    if (!node) continue

    if (node.type === 'INPUT' || node.type === 'CLOCK') {
      drivenInputs[node.id] = ev.value
    }

    const prevValue = current[ev.nodeId]
    if (prevValue === ev.value) continue   // no actual change — nothing propagates

    current[ev.nodeId] = ev.value
    events.push({ t: ev.t, nodeId: ev.nodeId, value: ev.value })

    // Every downstream node MIGHT change in response — recompute each one
    // instantaneously (what would its output be, given current[] right
    // now) and, if that differs from what it's currently holding, schedule
    // the change after that node's own gate delay. `schedule()` itself
    // guards against redundant re-scheduling of an already-pending target.
    for (const depId of dependents[ev.nodeId] || []) {
      const depNode = nodeMap[depId]
      if (!depNode) continue
      if (depNode.type === 'OUTPUT') {
        const ins = resolveInputs(depId, wiresByDest, id => current[id])
        const newVal = ins[0]
        schedule(ev.t, depId, newVal)   // OUTPUT is a pure passthrough, 0 delay
        continue
      }
      if (!GATE_LOGIC[depNode.type]) continue
      const ins = resolveInputs(depId, wiresByDest, id => current[id])
      const newVal = computeOutput(depNode, ins)
      const d = delayFor(depNode, delayOverrides)
      schedule(ev.t + d, depId, newVal)
    }
  }

  events.sort((a, b) => a.t - b.t)

  // ── Build per-node waveforms from the committed event list, seeded with
  // each tracked node's pre-simulation settled value at t=0.
  const waveforms = {}
  const nodeIds = nodes.map(n => n.id)
  for (const id of nodeIds) {
    waveforms[id] = [{ t: 0, value: settledAt[id] }]
  }
  for (const ev of events) {
    waveforms[ev.nodeId].push({ t: ev.t, value: ev.value })
  }

  const glitches = detectGlitches(waveforms)

  const criticalPathDelay = events.length ? events[events.length - 1].t : 0

  return {
    events,
    waveforms,
    glitches,
    finalValues: current,
    criticalPathDelay,
  }
}

/**
 * settleInstantaneous — zero-delay topological evaluation, used only to
 * establish the "quiet" starting state before the timed event queue runs.
 * Deliberately NOT imported from GraphEvaluator.js so this module stays a
 * standalone, dependency-free sibling (matches the header note) — the
 * logic table itself (GATE_LOGIC) is intentionally duplicated in small,
 * literal form rather than shared, since keeping this file import-free is
 * more valuable here than avoiding a ~15-line duplication.
 */
function settleInstantaneous(nodes, wiresByDest, inputs, nodeMap) {
  const inDegree = {}
  const dependents = {}
  for (const node of nodes) { inDegree[node.id] = 0; dependents[node.id] = [] }
  for (const nodeId of Object.keys(wiresByDest)) {
    for (const fromId of Object.values(wiresByDest[nodeId])) {
      inDegree[nodeId] = (inDegree[nodeId] || 0) + 1
      if (!dependents[fromId]) dependents[fromId] = []
      dependents[fromId].push(nodeId)
    }
  }

  const SOURCE_TYPES = new Set(['INPUT', 'CONST', 'CLOCK'])
  const queue = []
  for (const node of nodes) {
    if (SOURCE_TYPES.has(node.type) || inDegree[node.id] === 0) queue.push(node.id)
  }

  const order = []
  const visited = new Set()
  while (queue.length) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    order.push(id)
    for (const depId of dependents[id] || []) {
      inDegree[depId]--
      if (inDegree[depId] === 0) queue.push(depId)
    }
  }
  for (const node of nodes) if (!visited.has(node.id)) order.push(node.id)

  const values = {}
  for (const id of order) {
    const node = nodeMap[id]
    if (!node) continue
    if (node.type === 'INPUT' || node.type === 'CLOCK') {
      values[id] = inputs[id] ?? false
      continue
    }
    if (node.type === 'CONST') { values[id] = !!node.value; continue }
    if (node.type === 'OUTPUT') {
      const ins = resolveInputs(id, wiresByDest, fromId => values[fromId])
      values[id] = ins[0]
      continue
    }
    if (!GATE_LOGIC[node.type]) { values[id] = undefined; continue }
    const ins = resolveInputs(id, wiresByDest, fromId => values[fromId])
    values[id] = computeOutput(node, ins)
  }
  return values
}

/**
 * detectGlitches(waveforms)
 *
 * A glitch is any node whose value LEAVES its currently-settled value and
 * then RETURNS to that exact same value at the very next transition — a
 * there-and-back blip that the steady-state logic never asked for. This
 * general definition covers both hazard types GateLab teaches:
 *   static-1 hazard  → settled TRUE,  dips to FALSE, returns to TRUE
 *   static-0 hazard  → settled FALSE, rises to TRUE,  returns to FALSE
 *   dynamic hazard   → the overall transition (e.g. 1 -> 0) takes more
 *                      than one hop to get there (1 -> 0 -> 1 -> 0)
 * Both fall out of the same "value bounced back to a level it just left"
 * check, so this function doesn't need separate static/dynamic branches.
 */
function detectGlitches(waveforms) {
  const glitches = []
  for (const [nodeId, points] of Object.entries(waveforms)) {
    if (points.length <= 2) continue   // 0 or 1 transitions — can't glitch
    for (let i = 1; i < points.length - 1; i++) {
      const before = points[i - 1].value
      const at = points[i].value
      const after = points[i + 1].value
      if (at !== before && after === before) {
        glitches.push({
          nodeId,
          tStart: points[i].t,
          tEnd: points[i + 1].t,
          settledValue: before,
        })
      }
    }
  }
  return glitches
}

/**
 * criticalPath(nodes, wires, brokenWireIds?, opts?)
 * Longest gate-delay chain from any INPUT to any OUTPUT — the number
 * 06-delay-model.js's narrative calls out directly ("critical path = 3
 * gate delays = 30 ns"). Independent of any particular input transition;
 * this is a static property of the topology + delay table.
 */
export function criticalPath(nodes, wires, brokenWireIds = new Set(), opts = {}) {
  const { delayOverrides = {} } = opts
  const { nodeMap, wiresByDest, dependents } = buildTopology(nodes, wires, brokenWireIds)

  const inDegree = {}
  for (const node of nodes) inDegree[node.id] = 0
  for (const nodeId of Object.keys(wiresByDest)) {
    inDegree[nodeId] = (inDegree[nodeId] || 0) + Object.keys(wiresByDest[nodeId]).length
  }

  const SOURCE_TYPES = new Set(['INPUT', 'CONST', 'CLOCK'])
  const queue = []
  for (const node of nodes) {
    if (SOURCE_TYPES.has(node.type) || inDegree[node.id] === 0) queue.push(node.id)
  }

  const arrival = {}   // longest delay-weighted path reaching this node so far
  for (const node of nodes) arrival[node.id] = 0

  const visited = new Set()
  while (queue.length) {
    const id = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    for (const depId of dependents[id] || []) {
      const depNode = nodeMap[depId]
      const d = depNode ? delayFor(depNode, delayOverrides) : 0
      const candidate = arrival[id] + (depNode?.type === 'OUTPUT' ? 0 : d)
      if (candidate > arrival[depId]) arrival[depId] = candidate
      inDegree[depId]--
      if (inDegree[depId] === 0) queue.push(depId)
    }
  }

  let maxDelay = 0
  let criticalNodeId = null
  for (const node of nodes) {
    if (node.type === 'OUTPUT' && arrival[node.id] > maxDelay) {
      maxDelay = arrival[node.id]
      criticalNodeId = node.id
    }
  }

  return { delay: maxDelay, outputNodeId: criticalNodeId }
}

