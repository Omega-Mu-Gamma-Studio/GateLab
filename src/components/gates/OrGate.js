/**
 * ORGate.js
 * Re-exports the OR geometry entry and any OR-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { OR as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the OR output given input(s).
 */
export const evaluate = (a, b) => a || b
