/**
 * compositeGeometry.js
 *
 * Canonical geometry for COMPOSITE nodes — the "Block Mode" rectangle that
 * stands in for a fully-built flip-flop (SR latch/FF, JK, D, T), simulated
 * behaviorally via FlipFlopModels.nextState() rather than a gate-level
 * netlist. See GraphEvaluator.js for the evaluation side of this and
 * CompositeShape.jsx for the Konva renderer that consumes this file.
 *
 * Canonical size 140×110 (w×h), scaled the same way GateShape scales
 * GATE_GEOMETRY entries — via node.scale, applied uniformly by whichever
 * component reads this (CompositeShape, GatePin).
 *
 * Pin order is NOT redefined here — it's imported from FlipFlopModels'
 * COMPOSITE_INPUT_PINS / COMPOSITE_OUTPUT_PINS, the same lists
 * GraphEvaluator uses to decide which resolved input index is which named
 * signal. One source of truth for pin order means the box the player sees
 * always matches what the engine actually evaluates.
 */
import { COMPOSITE_INPUT_PINS, COMPOSITE_OUTPUT_PINS } from '../../engine/FlipFlopModels'

export const COMPOSITE_W = 140
export const COMPOSITE_H = 110

// ffKind → display label on the box (e.g. "JK FF"). Purely cosmetic — has
// no bearing on evaluation, which keys off node.ffKind directly.
const COMPOSITE_LABELS = {
  sr_latch:    'SR LATCH',
  sr_flipflop: 'SR FF',
  jk_flipflop: 'JK FF',
  d_flipflop:  'D FF',
  t_flipflop:  'T FF',
}

/**
 * getCompositeGeometry(ffKind)
 * Returns null for an unrecognized kind, otherwise:
 *   {
 *     label, w, h,
 *     inputs:  [{ name, x, y }, ...]  — left edge, CLK first when clocked
 *     outputs: [{ name, x, y }, ...]  — right edge, always [Q, Qbar]
 *   }
 * at CANONICAL (unscaled) coordinates, relative to the node's own (0,0).
 */
export function getCompositeGeometry(ffKind) {
  const inputPins = COMPOSITE_INPUT_PINS[ffKind]
  if (!inputPins) return null

  const n = inputPins.length
  const marginY = 22
  const usableH = COMPOSITE_H - marginY * 2
  const inputs = inputPins.map((name, i) => ({
    name,
    x: 0,
    y: n === 1 ? COMPOSITE_H / 2 : marginY + (usableH * i) / (n - 1),
  }))

  const outputs = COMPOSITE_OUTPUT_PINS.map((name, i) => ({
    name,
    x: COMPOSITE_W,
    y: i === 0 ? COMPOSITE_H * 0.34 : COMPOSITE_H * 0.66,
  }))

  return {
    label: COMPOSITE_LABELS[ffKind] || ffKind.toUpperCase(),
    w: COMPOSITE_W,
    h: COMPOSITE_H,
    inputs,
    outputs,
  }
}
