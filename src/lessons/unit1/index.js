/**
 * Unit I lesson registry.
 * Add each lesson file here as it's implemented.
 * GateCanvas imports this to load the active lesson.
 */
import andGate    from './01-and-gate'
import orGate     from './02-or-gate'
import notGate    from './03-not-gate'
import nandNor    from './04-nand-nor'
import xorXnor    from './05-xor-xnor'
import boolLaws   from './06-boolean-laws'
import sopPos     from './07-sop-pos'
import kmap2var   from './08-kmap-2var'
import kmap3var   from './09-kmap-3var'
import kmap4var   from './10-kmap-4var'

const unit1Lessons = [
  andGate,   // 00 — AND Gate
  orGate,    // 01 — OR Gate
  notGate,   // 02 — NOT Gate
  nandNor,   // 03 — NAND & NOR
  xorXnor,   // 04 — XOR & XNOR
  boolLaws,  // 05 — Boolean Laws
  sopPos,    // 06 — SOP & POS
  kmap2var,  // 07 — K-Map 2-Var
  kmap3var,  // 08 — K-Map 3-Var
  kmap4var,  // 09 — K-Map 4-Var
]

export default unit1Lessons