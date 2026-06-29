/**
 * Unit V lesson registry.
 * Memory & Programmable Logic -- SRAM, DRAM, ROM, EPROM/Flash, PLA, PAL,
 * and the Hamming(7,4) error-correcting code.
 */
import sram          from './01-sram'
import dram          from './02-dram'
import rom           from './03-rom'
import epromFlash    from './04-eprom-flash'
import pla           from './05-pla'
import pal           from './06-pal'
import hammingCode   from './07-hamming-code'

const unit5Lessons = [
  sram,         // 00 -- Static RAM Cell
  dram,         // 01 -- Dynamic RAM Cell
  rom,          // 02 -- Mask ROM Array
  epromFlash,   // 03 -- EPROM / Flash Cell
  pla,          // 04 -- Programmable Logic Array
  pal,          // 05 -- Programmable Array Logic
  hammingCode,  // 06 -- Hamming(7,4) Encoder
]

export default unit5Lessons