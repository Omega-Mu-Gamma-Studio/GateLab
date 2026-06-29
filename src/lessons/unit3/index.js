/**
 * Unit III lesson registry.
 * Sequential Circuits — Flip-Flops and Counters.
 * Add each lesson file here as it is implemented.
 */
import srLatch    from './01-sr-latch'
import srFlipFlop from './02-sr-flipflop'
import jkFlipFlop from './03-jk-flipflop'
import dFlipFlop  from './04-d-flipflop'
import tFlipFlop  from './05-t-flipflop'

const unit3Lessons = [
  srLatch,    // 00 — SR Latch
  srFlipFlop, // 01 — SR Flip-Flop (Clocked)
  jkFlipFlop, // 02 — JK Flip-Flop
  dFlipFlop,  // 03 — D Flip-Flop
  tFlipFlop,  // 04 — T Flip-Flop
  // 05 — Ripple Counter      (planned)
  // 06 — Mod-N Counter       (planned)
  // 07 — Ring Counter        (planned)
  // 08 — Johnson Counter     (planned)
]

export default unit3Lessons