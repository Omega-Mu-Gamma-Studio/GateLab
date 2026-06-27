/**
 * XORGate.js
 * Re-exports the XOR geometry entry and any XOR-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { XOR as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the XOR output given input(s).
 */
export const evaluate = (a, b) => a !== b
