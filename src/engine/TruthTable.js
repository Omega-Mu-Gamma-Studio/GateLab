/**
 * TruthTable.js
 *
 * Generates a full truth table for a single OUTPUT node by sweeping every
 * INPUT node in the circuit through every combination of true/false and
 * re-running GraphEvaluator for each one. Pure function, zero React/Konva
 * dependencies — same spirit as GraphEvaluator.js so it can be unit tested
 * or reused (e.g. Verilog export sanity-checks) independently of the canvas.
 *
 * Row order follows standard truth-table convention: inputs sorted by
 * label/id, MSB-first, counting 0 → 2^n - 1 in binary across that ordering.
 *
 * CLOCK nodes are intentionally left out of the sweep — they aren't binary
 * choices the way INPUT nodes are, and sweeping them through a purely
 * combinational lens would misrepresent sequential circuits (flip-flops,
 * counters) that only change state on an edge. `hasFeedback` flags that
 * case so callers can surface an honest caveat instead of presenting a
 * misleading table.
 */
import { evaluate } from './GraphEvaluator'

const MAX_INPUTS = 10 // 1024 rows — generous for any lesson circuit, still instant

/**
 * detectFeedback(nodes, wires)
 * Cheap cycle check: does any node in the graph feed back into itself
 * through a chain of wires? Cross-coupled latches and flip-flop internals
 * do this on purpose — it's exactly the case where a static input sweep
 * can't show the real (clocked/edge-triggered) behaviour.
 */
function detectFeedback(nodes, wires) {
  const adj = {}
  for (const n of nodes) adj[n.id] = []
  for (const w of wires) {
    if (w.broken) continue
    if (!adj[w.from.nodeId]) adj[w.from.nodeId] = []
    adj[w.from.nodeId].push(w.to.nodeId)
  }
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = {}
  for (const n of nodes) color[n.id] = WHITE

  function dfs(id) {
    color[id] = GRAY
    for (const next of (adj[id] || [])) {
      if (color[next] === GRAY) return true
      if (color[next] === WHITE && dfs(next)) return true
    }
    color[id] = BLACK
    return false
  }

  for (const n of nodes) {
    if (color[n.id] === WHITE && dfs(n.id)) return true
  }
  return false
}

/**
 * generateTruthTableMulti(nodes, wires, outputNodeIds)
 *
 * Same sweep as generateTruthTable, but scores every requested OUTPUT node
 * per row instead of just one. This matters for circuits like a full adder
 * (SUM + CARRY) or a comparator (LT/EQ/GT) — sweeping once and reading off
 * every output per row is both cheaper (one evaluate() per row instead of
 * one per output per row) and, more importantly, the only way to show the
 * outputs *together* the way a textbook truth table actually looks.
 *
 * @returns {object|null}
 *   {
 *     inputNodes:  [node, ...]
 *     outputNodes: [node, ...]                — in the order requested
 *     rows:        [{ inputValues: [bool,...], outputValues: [bool|undefined,...] }]
 *     hasFeedback: boolean
 *     truncated:   boolean
 *   }
 */
export function generateTruthTableMulti(nodes, wires, outputNodeIds) {
  const outputNodes = outputNodeIds
    .map(id => nodes.find(n => n.id === id && n.type === 'OUTPUT'))
    .filter(Boolean)
  if (outputNodes.length === 0) return null

  const inputNodes = nodes
    .filter(n => n.type === 'INPUT')
    .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id))

  const brokenIds = new Set(wires.filter(w => w.broken).map(w => w.id))
  const hasFeedback = detectFeedback(nodes, wires)

  if (inputNodes.length === 0) {
    const signals = evaluate(nodes, wires, {}, brokenIds, {})
    return {
      inputNodes: [],
      outputNodes,
      rows: [{ inputValues: [], outputValues: outputNodes.map(o => signals[o.id]?.output) }],
      hasFeedback,
      truncated: false,
    }
  }

  if (inputNodes.length > MAX_INPUTS) {
    return { inputNodes, outputNodes, rows: [], hasFeedback, truncated: true }
  }

  const n = inputNodes.length
  const total = 1 << n
  const rows = []

  for (let mask = 0; mask < total; mask++) {
    const inputs = {}
    const inputValues = []
    inputNodes.forEach((node, idx) => {
      const bit = !!(mask & (1 << (n - 1 - idx)))
      inputs[node.id] = bit
      inputValues.push(bit)
    })
    const signals = evaluate(nodes, wires, inputs, brokenIds, {})
    rows.push({
      inputValues,
      outputValues: outputNodes.map(o => signals[o.id]?.output),
    })
  }

  return { inputNodes, outputNodes, rows, hasFeedback, truncated: false }
}

/**
 * generateTruthTable(nodes, wires, outputNodeId)
 *
 * Single-output convenience wrapper around generateTruthTableMulti — kept
 * as its own function (rather than inlining a `[0]` everywhere) because
 * it's the public API the OUTPUT-node copy button already depends on, and
 * because "one output" is a meaningfully simpler shape to consume than
 * "one output, array of length 1."
 *
 * @returns {object|null} null if there's no such OUTPUT node or too many
 *   inputs to sweep sanely. Otherwise:
 *   {
 *     inputNodes:  [node, ...]              — sorted, defines column order
 *     outputNode:  node
 *     rows:        [{ inputValues: [bool,...], output: bool|undefined }]
 *     hasFeedback: boolean                  — sequential-circuit caveat
 *     truncated:   boolean                  — true if inputs exceeded MAX_INPUTS
 *   }
 */
export function generateTruthTable(nodes, wires, outputNodeId) {
  const multi = generateTruthTableMulti(nodes, wires, [outputNodeId])
  if (!multi) return null
  return {
    inputNodes: multi.inputNodes,
    outputNode: multi.outputNodes[0],
    rows: multi.rows.map(r => ({ inputValues: r.inputValues, output: r.outputValues[0] })),
    hasFeedback: multi.hasFeedback,
    truncated: multi.truncated,
  }
}

/**
 * truthTableToMarkdown(table)
 * Renders a generateTruthTable() result as a GitHub-flavoured markdown
 * table, e.g.:
 *
 *   | A | B | OUT |
 *   | --- | --- | --- |
 *   | 0 | 0 | 0 |
 *   | 0 | 1 | 1 |
 *   | 1 | 0 | 1 |
 *   | 1 | 1 | 1 |
 */
export function truthTableToMarkdown(table) {
  if (!table) return ''
  const { inputNodes, outputNode, rows, hasFeedback, truncated } = table

  if (truncated) {
    return `<!-- ${inputNodes.length} inputs is too many to sweep exhaustively (cap is ${MAX_INPUTS}) -->`
  }

  const outLabel = outputNode?.label || outputNode?.id?.toUpperCase() || 'OUT'
  const headers = [...inputNodes.map(n => n.label || n.id.toUpperCase()), outLabel]
  const headerRow = `| ${headers.join(' | ')} |`
  const sepRow    = `| ${headers.map(() => '---').join(' | ')} |`
  const bodyRows  = rows.map(row => {
    const cells = [
      ...row.inputValues.map(v => (v ? '1' : '0')),
      row.output === undefined ? '?' : (row.output ? '1' : '0'),
    ]
    return `| ${cells.join(' | ')} |`
  })

  const lines = [headerRow, sepRow, ...bodyRows]
  if (hasFeedback) {
    lines.push('', '_Note: this circuit has feedback (latch/flip-flop-style). A static input sweep can\'t show clocked/edge behaviour — treat this as a snapshot, not the full sequential truth table._')
  }
  return lines.join('\n')
}

/**
 * truthTableMultiToMarkdown(table)
 * Same as truthTableToMarkdown, but for a generateTruthTableMulti() result —
 * one column per requested OUTPUT node instead of just one. This is what
 * the live TruthTablePanel's "copy" button uses, since the panel always
 * shows every OUTPUT node in the circuit at once.
 */
export function truthTableMultiToMarkdown(table) {
  if (!table) return ''
  const { inputNodes, outputNodes, rows, hasFeedback, truncated } = table

  if (truncated) {
    return `<!-- ${inputNodes.length} inputs is too many to sweep exhaustively (cap is ${MAX_INPUTS}) -->`
  }

  const outLabels = outputNodes.map(n => n.label || n.id.toUpperCase())
  const headers = [...inputNodes.map(n => n.label || n.id.toUpperCase()), ...outLabels]
  const headerRow = `| ${headers.join(' | ')} |`
  const sepRow    = `| ${headers.map(() => '---').join(' | ')} |`
  const bodyRows  = rows.map(row => {
    const cells = [
      ...row.inputValues.map(v => (v ? '1' : '0')),
      ...row.outputValues.map(v => (v === undefined ? '?' : (v ? '1' : '0'))),
    ]
    return `| ${cells.join(' | ')} |`
  })

  const lines = [headerRow, sepRow, ...bodyRows]
  if (hasFeedback) {
    lines.push('', '_Note: this circuit has feedback (latch/flip-flop-style). A static input sweep can\'t show clocked/edge behaviour — treat this as a snapshot, not the full sequential truth table._')
  }
  return lines.join('\n')
}
