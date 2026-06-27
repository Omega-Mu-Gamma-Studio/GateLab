/**
 * NANDGate.js
 * Re-exports the NAND geometry entry and any NAND-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { NAND as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the NAND output given input(s).
 */
export const evaluate = (a, b) => !(a && b)
