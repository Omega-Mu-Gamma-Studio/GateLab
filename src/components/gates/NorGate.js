/**
 * NORGate.js
 * Re-exports the NOR geometry entry and any NOR-specific
 * logic helpers. Gate rendering is handled by GateShape.jsx.
 */
export { NOR as geometry } from './gateGeometry'

/**
 * evaluate(a, b?) → boolean
 * Pure function — computes the NOR output given input(s).
 */
export const evaluate = (a, b) => !(a || b)
