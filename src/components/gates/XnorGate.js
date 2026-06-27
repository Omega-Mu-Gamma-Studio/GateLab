/**
 * XNORGate.js
 * Re-exports the XNOR geometry entry and any XNOR-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { XNOR as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the XNOR output given input(s).
 */
export const evaluate = (a, b) => a === b
