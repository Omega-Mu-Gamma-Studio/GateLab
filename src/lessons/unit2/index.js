/**
 * Unit II lesson registry.
 * Combinational circuits — the building blocks of arithmetic and data routing.
 */
import halfAdder     from './01-half-adder'
import fullAdder     from './02-full-adder'
import rippleCarry   from './03-ripple-carry-adder'
import subtractor    from './04-subtractor'
import encoder       from './05-encoder'
import decoder       from './06-decoder'
import mux           from './07-mux'
import demux         from './08-demux'
import comparator    from './09-comparator'

const unit2Lessons = [
  halfAdder,    // 00 — Half Adder
  fullAdder,    // 01 — Full Adder
  rippleCarry,  // 02 — Ripple-Carry Adder
  subtractor,   // 03 — Binary Subtractor
  encoder,      // 04 — Priority Encoder
  decoder,      // 05 — Decoder
  mux,          // 06 — Multiplexer
  demux,        // 07 — Demultiplexer
  comparator,   // 08 — Magnitude Comparator
]

export default unit2Lessons