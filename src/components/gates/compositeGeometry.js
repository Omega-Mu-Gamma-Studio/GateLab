/**
 * compositeGeometry.js
 *
 * Canonical geometry for COMPOSITE nodes — the "Block Mode" rectangle that
 * stands in for a fully-built subcircuit (a flip-flop, a full adder, or
 * whatever BlockDefs.js grows next), simulated behaviorally rather than as
 * a gate-level netlist. See GraphEvaluator.js for the evaluation side of
 * this and CompositeShape.jsx for the Konva renderer that consumes this
 * file.
 *
 * Canonical size 140×110 (w×h), scaled the same way GateShape scales
 * GATE_GEOMETRY entries — via node.scale, applied uniformly by whichever
 * component reads this (CompositeShape, GatePin).
 *
 * Pin names/counts are NOT redefined here — they're read from
 * BlockDefs.BLOCK_DEFS[kind].inputs / .outputs, the same source
 * GraphEvaluator uses to decide which resolved input index is which named
 * signal. One source of truth for pin order means the box the player sees
 * always matches what the engine actually evaluates.
 */
import { BLOCK_DEFS, getBlockKind } from '../../engine/BlockDefs'

export const COMPOSITE_W = 140
export const COMPOSITE_H = 110

/**
 * getCompositeGeometry(node)
 * Takes the full node (not just a kind string) because getBlockKind()
 * needs to check both node.blockKind (new lessons) and node.ffKind
 * (existing unit-3 counter lessons) to know which BLOCK_DEFS entry
 * applies. Returns null for an unrecognized kind, otherwise:
 *   {
 *     label, w, h,
 *     inputs:  [{ name, x, y }, ...]  — left edge, in BLOCK_DEFS order
 *     outputs: [{ name, x, y }, ...]  — right edge, in BLOCK_DEFS order
 *   }
 * at CANONICAL (unscaled) coordinates, relative to the node's own (0,0).
 */
export function getCompositeGeometry(node) {
  const def = BLOCK_DEFS[getBlockKind(node)]
  if (!def) return null

  const marginY = 22
  const usableH = COMPOSITE_H - marginY * 2

  const nIn = def.inputs.length
  const inputs = def.inputs.map((name, i) => ({
    name,
    x: 0,
    y: nIn === 1 ? COMPOSITE_H / 2 : marginY + (usableH * i) / (nIn - 1),
  }))

  // nOut === 2 keeps the exact original 0.34/0.66 fractions pixel-for-pixel
  // — every shipped flip-flop composite (06/08/09 in unit 3) has 2 outputs
  // and this guarantees zero visual diff for them. Any other output count
  // (full_adder's 2 outputs happen to also hit this branch; a future
  // 1-output or 3+-output block would use the margin-based spread below,
  // same logic the inputs already use.)
  const nOut = def.outputs.length
  const outputs = def.outputs.map((name, i) => {
    let y
    if (nOut === 1) y = COMPOSITE_H / 2
    else if (nOut === 2) y = i === 0 ? COMPOSITE_H * 0.34 : COMPOSITE_H * 0.66
    else y = marginY + (usableH * i) / (nOut - 1)
    return { name, x: COMPOSITE_W, y }
  })

  return {
    label: def.label,
    w: COMPOSITE_W,
    h: COMPOSITE_H,
    inputs,
    outputs,
  }
}
