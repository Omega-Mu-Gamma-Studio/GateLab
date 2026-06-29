/**
 * Unit III lesson registry.
 * Sequential Circuits — Flip-Flops and Counters.
 */
import srLatch      from './01-sr-latch'
import srFlipFlop   from './02-sr-flipflop'
import jkFlipFlop   from './03-jk-flipflop'
import dFlipFlop    from './04-d-flipflop'
import tFlipFlop    from './05-t-flipflop'
import rippleCounter  from './06-ripple-counter'
import modNCounter    from './07-mod-n-counter'
import ringCounter    from './08-ring-counter'
import johnsonCounter from './09-johnson-counter'

const unit3Lessons = [
  srLatch,       // 00 — SR Latch
  srFlipFlop,    // 01 — SR Flip-Flop (Clocked)
  jkFlipFlop,    // 02 — JK Flip-Flop
  dFlipFlop,     // 03 — D Flip-Flop
  tFlipFlop,     // 04 — T Flip-Flop
  rippleCounter, // 05 — Ripple Counter (3-bit)
  modNCounter,   // 06 — Mod-N Counter (Mod-5)
  ringCounter,   // 07 — Ring Counter (4-bit)
  johnsonCounter,// 08 — Johnson Counter (4-bit)
]

export default unit3Lessons