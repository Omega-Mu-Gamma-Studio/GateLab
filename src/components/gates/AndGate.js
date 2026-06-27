/**
 * ANDGate.js
 * Re-exports the AND geometry entry and any AND-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { AND as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the AND output given input(s).
 */
export const evaluate = (a, b) => a && b
