/**
 * circuitEncoder.js
 *
 * Encode/decode circuit state to/from a URL-safe base64 string.
 * URL scheme: gatelab.vercel.app/puzzle?c=<encoded>
 */

export function encodeCircuit(lessonId, brokenWires = [], brokenGates = [], nodeOverrides = {}) {
  const payload = {
    l: lessonId,
    bw: brokenWires,
    bg: brokenGates,
    no: Object.keys(nodeOverrides).length > 0 ? nodeOverrides : undefined,
  }
  const json  = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  const b64   = btoa(String.fromCharCode(...bytes))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeCircuit(encoded) {
  try {
    const b64    = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const json   = atob(padded)
    const payload = JSON.parse(json)
    return {
      lessonId:      payload.l  || '',
      brokenWires:   payload.bw || [],
      brokenGates:   payload.bg || [],
      nodeOverrides: payload.no || {},
    }
  } catch {
    return null
  }
}

export function buildPuzzleUrl(encoded) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://gatelab.vercel.app'
  return `${base}/puzzle?c=${encoded}`
}