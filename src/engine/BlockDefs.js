/**
 * BlockDefs.js
 *
 * The generic COMPOSITE registry. This is what GraphEvaluator.js and
 * compositeGeometry.js actually talk to now — FlipFlopModels.js still owns
 * nextState()/STATE_LEGEND/detectFlipFlopType for the State Diagram panel,
 * but it no longer decides what a COMPOSITE node's pins are.
 *
 * Every entry describes one reusable "block":
 *   stateful   {boolean}  true = holds a Q across ticks (flip-flops).
 *                         false = pure combinational, recomputed every
 *                         pass from current inputs only (full adder and
 *                         friends) — same contract as an ordinary gate.
 *   clocked    {boolean}  only meaningful when stateful: true = waits for
 *                         a CLK rising edge before calling eval(); false =
 *                         level-sensitive, recomputes every pass (SR latch).
 *   resettable {boolean}  optional. true = this block's `inputs` list
 *                         includes a 'CLR' pin that asynchronously forces
 *                         Q to false the instant it's HIGH, regardless of
 *                         CLK. Modeled as active-HIGH to match how these
 *                         lessons already build reset logic (a NAND+NOT
 *                         decode feeding an active-HIGH line).
 *   inputs     {string[]} ordered input pin names, left edge of the box,
 *                         top to bottom. Also determines input pin COUNT —
 *                         GraphEvaluator.getInputCount() reads this length.
 *   outputs    {string[]} ordered output pin names, right edge of the box.
 *                         No longer hardcoded to [Q, Qbar] — a combinational
 *                         block can name and size its own outputs.
 *   label      {string}   cosmetic box label, purely visual.
 *   eval       {function} the actual behavior:
 *                         - stateful:  (pinVals, prevQ) => { q }
 *                           (this is exactly FlipFlopModels.nextState's
 *                           signature/shape — see ffEval() below)
 *                         - combinational: (pinVals) => { [outputName]: value }
 *
 * Adding a new block kind (a decoder, a mux, anything else "chain of
 * already-understood units" wants) means adding one entry here. Nothing
 * in GraphEvaluator, compositeGeometry, GatePin, or CompositeShape needs
 * to know the new kind exists — they're all written against this shape,
 * not against any particular block.
 */
import { nextState, FF_TYPES } from './FlipFlopModels'

// Adapts FlipFlopModels.nextState (kind, qCurrent, ins) => {q,kind,label}
// to the (pinVals, prevQ) => {q} shape every stateful block's eval() uses.
function ffEval(ffType) {
  return (pinVals, prevQ) => nextState(ffType, prevQ, pinVals)
}

export const BLOCK_DEFS = {
  // --- flip-flops, expressed generically (byte-for-byte same behavior
  //     as the old FlipFlopModels-only path — see evaluateComposite) ---
  sr_latch: {
    stateful: true, clocked: false,
    inputs: ['S', 'R'], outputs: ['Q', 'Qbar'],
    label: 'SR LATCH', eval: ffEval(FF_TYPES.SR_LATCH),
  },
  sr_flipflop: {
    stateful: true, clocked: true,
    inputs: ['CLK', 'S', 'R'], outputs: ['Q', 'Qbar'],
    label: 'SR FF', eval: ffEval(FF_TYPES.SR_FLIPFLOP),
  },
  jk_flipflop: {
    stateful: true, clocked: true,
    inputs: ['CLK', 'J', 'K'], outputs: ['Q', 'Qbar'],
    label: 'JK FF', eval: ffEval(FF_TYPES.JK_FLIPFLOP),
  },
  // JK flip-flop with an added asynchronous active-HIGH clear pin — for
  // lessons like Mod-N Counter where a decode gate has to be able to
  // slam every stage back to 0 outside of the normal clock cascade.
  jk_flipflop_clr: {
    stateful: true, clocked: true, resettable: true,
    inputs: ['CLK', 'J', 'K', 'CLR'], outputs: ['Q', 'Qbar'],
    label: 'JK FF (CLR)', eval: ffEval(FF_TYPES.JK_FLIPFLOP),
  },
  d_flipflop: {
    stateful: true, clocked: true,
    inputs: ['CLK', 'D'], outputs: ['Q', 'Qbar'],
    label: 'D FF', eval: ffEval(FF_TYPES.D_FLIPFLOP),
  },
  t_flipflop: {
    stateful: true, clocked: true,
    inputs: ['CLK', 'T'], outputs: ['Q', 'Qbar'],
    label: 'T FF', eval: ffEval(FF_TYPES.T_FLIPFLOP),
  },

  // --- first non-flip-flop block: purely combinational, no state ---
  full_adder: {
    stateful: false,
    inputs: ['A', 'B', 'Cin'], outputs: ['Sum', 'Cout'],
    label: 'FULL ADDER',
    eval: ({ A, B, Cin }) => {
      if (A === undefined || B === undefined || Cin === undefined) {
        return { Sum: undefined, Cout: undefined }
      }
      const sum  = (A !== B) !== Cin              // 3-input XOR
      const cout = (A && B) || (Cin && (A !== B)) // majority function
      return { Sum: sum, Cout: cout }
    },
  },
}

/**
 * getBlockKind(node)
 * Backward-compat shim: existing lessons (06/08/09 in unit 3) already
 * shipped with `ffKind` on their COMPOSITE nodes. New lessons should use
 * `blockKind`, but nothing that already works needs to be rewritten —
 * this is the one place that decides which field wins.
 */
export function getBlockKind(node) {
  return node.blockKind || node.ffKind
}
