/**
 * WireRouter.js
 *
 * Converts a wire descriptor { from, to } into a flat array of canvas points
 * suitable for a Konva Line's `points` prop.
 *
 * Strategy: orthogonal elbow router (H→V→H)
 *   1. If from.y ≈ to.y → single horizontal segment
 *   2. Otherwise → three segments: right from source, vertical mid, left to dest
 *   3. If the wire has explicit waypoints in its descriptor, use those instead
 *
 * All positions are in canvas (world) coordinates — callers must resolve
 * pin positions using getPinWorldPos() from GatePin.js before calling here.
 */

const SNAP_THRESHOLD = 4  // px — treat y-difference smaller than this as "same row"
const WAYPOINT_GRID  = 16 // px — grid pitch for waypoint snapping (matches the
                           // 31-32px background grid at half-step, so corners
                           // land on or between grid lines instead of adrift)

/**
 * snapToGrid(point, grid?)
 *
 * Rounds a single {x,y} point to the nearest grid intersection. Exported
 * standalone (not just used internally by routeWire) so anything that
 * *authors* waypoints — a future drag-to-add-waypoint interaction, or a
 * lesson-file linting script — can snap at the source instead of relying
 * on render-time correction.
 *
 * @param {{ x, y }} point
 * @param {number}   [grid=WAYPOINT_GRID]
 * @returns {{ x, y }}
 */
export function snapToGrid(point, grid = WAYPOINT_GRID) {
  return {
    x: Math.round(point.x / grid) * grid,
    y: Math.round(point.y / grid) * grid,
  }
}

/**
 * routeWire(fromPos, toPos, waypoints?)
 *
 * @param {{ x, y }} fromPos   - world position of the source pin
 * @param {{ x, y }} toPos     - world position of the destination pin
 * @param {Array}    waypoints - optional [{x,y}] explicit intermediate points
 * @returns {number[]}          - flat [x1,y1, x2,y2, ...] for Konva Line
 */
export function routeWire(fromPos, toPos, waypoints) {
  // Explicit waypoints from lesson file — trust them, but snap each one to
  // the grid first. This is a *light* snap: only the intermediate points
  // move, never the pin endpoints themselves (fromPos/toPos stay exactly on
  // the gate pins they were resolved from). Dense Unit IV/V circuits tend
  // to accumulate hand-placed waypoints that drift a pixel or two off each
  // other; snapping keeps parallel runs visually aligned instead of looking
  // like spaghetti.
  if (waypoints && waypoints.length > 0) {
    const pts = [fromPos.x, fromPos.y]
    for (const wp of waypoints) {
      const snapped = snapToGrid(wp)
      pts.push(snapped.x, snapped.y)
    }
    pts.push(toPos.x, toPos.y)
    return pts
  }

  const dx = toPos.x - fromPos.x
  const dy = Math.abs(toPos.y - fromPos.y)

  // Straight horizontal (same row)
  if (dy < SNAP_THRESHOLD) {
    return [fromPos.x, fromPos.y, toPos.x, toPos.y]
  }

  // Standard elbow: go right to midX, then vertical, then right to dest
  // If dest is to the left of source (feedback / backward wire),
  // add extra horizontal runs to avoid routing through the gate body
  const midX = fromPos.x + dx / 2

  if (toPos.x > fromPos.x + 10) {
    // Forward wire — simple 3-segment elbow
    return [
      fromPos.x, fromPos.y,
      midX,       fromPos.y,
      midX,       toPos.y,
      toPos.x,    toPos.y,
    ]
  } else {
    // Backward wire (e.g. feedback loop) — route around with 5 segments
    const overX  = fromPos.x + 40
    const underY = Math.max(fromPos.y, toPos.y) + 50
    return [
      fromPos.x, fromPos.y,
      overX,     fromPos.y,
      overX,     underY,
      toPos.x - 40, underY,
      toPos.x - 40, toPos.y,
      toPos.x,   toPos.y,
    ]
  }
}

/**
 * hitTestPin(pointerPos, pins, threshold?)
 *
 * Returns the first pin within `threshold` pixels of the pointer, or null.
 * Used during drag-wire operations to snap to nearby pins.
 *
 * @param {{ x, y }}  pointerPos
 * @param {Array}     pins  - [{ nodeId, role, index, x, y }, ...]
 * @param {number}    [threshold=20]
 * @returns {object|null}
 */
export function hitTestPin(pointerPos, pins, threshold = 20) {
  let closest = null
  let closestDist = Infinity
  for (const pin of pins) {
    const d = Math.hypot(pin.x - pointerPos.x, pin.y - pointerPos.y)
    if (d < threshold && d < closestDist) {
      closestDist = d
      closest = pin
    }
  }
  return closest
}
