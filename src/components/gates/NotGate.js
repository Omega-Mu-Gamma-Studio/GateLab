/**
 * NOTGate.js
 * Re-exports the NOT geometry entry and any NOT-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { NOT as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the NOT output given input(s).
 */
export const evaluate = (a) => !a
