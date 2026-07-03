/**
 * shipMapData.js
 *
 * Single source of truth for the AETHER-9 deck layout — room data,
 * corridor connections, and the colour palette. Both the full-page
 * ShipMap (Story Mode hub) and the fullscreen ShipMapOverlay (the
 * in-lesson "press M" map) render from this file, so the two never
 * drift apart.
 *
 * Layout: a 4-column x 3-row grid, matching the AETHER-9 deck
 * schematic concept art —
 *
 *   MESS HALL     OBS. DECK     ADA'S QUARTERS   BRIDGE
 *   YOUR QUARTERS WORKSTATION   ·  (corridor)  ·  (corridor)
 *   ENGINE ROOM   HYDRO-POOL    LOUNGE           MAINT. BAY
 *
 * `col`/`row` are 0-indexed grid coordinates. Workstation sits at the
 * centre of gravity — every other room either borders it directly or
 * reaches it in one hop, same as the reference art.
 */

export const GRID_COLS = 4
export const GRID_ROWS = 3

export const ROOMS = [
  {
    id: 'quarters', label: 'YOUR QUARTERS', code: 'A-07', deck: 'DECK 7',
    col: 0, row: 1,
    alwaysOpen: true, unlockFlag: null,
    npc: null, npcColor: null, isWork: false,
    denial: null,
    dlg: { sp: '[ ambient ]', txt: 'Your bunk. The PDA glows on the desk. The hull hums beneath the floor.' },
    tint: '#3fa8d8',
    bgImage: null,        // drop a real photo path in here later
    sealedImage: null,    // AI-generated "sealed door" art goes here later
    hasPda: true,
  },
  {
    id: 'mess', label: 'MESS HALL', code: 'B-01', deck: 'DECK 7',
    col: 0, row: 0,
    alwaysOpen: true, unlockFlag: null,
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: null,
    dlg: { sp: 'Ada', txt: "You're early. Or late. I can never tell with you. Sit — I'll grab your ration." },
    tint: '#d05858',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'engine', label: 'ENGINE ROOM', code: 'E-01', deck: 'DECK 4',
    col: 0, row: 2,
    alwaysOpen: false, unlockFlag: 'unit2_l9',
    npc: 'Reyes', npcColor: '#c07028', isWork: false,
    denial: "Reyes has the room sealed for a maintenance sweep. The door doesn't budge.",
    dlg: { sp: 'Reyes', txt: "You're not supposed to be down here. But since you are — suit up." },
    tint: '#c07028',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'obs_deck', label: 'OBS. DECK', code: 'C-01', deck: 'DECK 7',
    col: 1, row: 0,
    alwaysOpen: false, unlockFlag: 'unit1_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Observation Deck is closed for maintenance. Try again after your first shift.',
    dlg: { sp: 'Ada', txt: "The Veil Nebula is visible on clear cycles. I used to come up here with... well. It's a good view." },
    tint: '#6f8fd8',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'hydro', label: 'HYDRO-POOL', code: 'D-03', deck: 'DECK 6',
    col: 1, row: 2,
    alwaysOpen: false, unlockFlag: 'unit2_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Hydro-Pool is on a scheduled maintenance cycle. Check back after your next shift.',
    dlg: { sp: 'Ada', txt: "Don't look so surprised. Even mechanics get shore leave. The water's warm — for now." },
    tint: '#2ea88a',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'workstation', label: 'WORKSTATION', code: 'B-02', deck: 'DECK 7',
    col: 1, row: 1,
    alwaysOpen: true, unlockFlag: null,
    npc: null, npcColor: null, isWork: true,
    denial: null,
    dlg: { sp: 'MAINT-SYS', txt: 'TERMINAL ACTIVE — WORK ORDER QUEUE: 1 PENDING — AUTHENTICATE TO BEGIN SHIFT.' },
    tint: '#40a860',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'ada_quarters', label: "ADA'S QUARTERS", code: 'A-12', deck: 'DECK 7',
    col: 2, row: 0,
    alwaysOpen: false, unlockFlag: 'unit3_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: "Ada's door is shut. You can hear music from inside. Probably best not to interrupt.",
    dlg: { sp: 'Ada', txt: "...I wasn't expecting anyone. Come in. Mind the books — I keep meaning to sort them." },
    tint: '#c05840',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'lounge', label: 'LOUNGE', code: 'C-02', deck: 'DECK 7',
    col: 2, row: 2,
    alwaysOpen: false, unlockFlag: 'unit3_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Lounge is closed for a private crew event.',
    dlg: { sp: 'Ada', txt: "Game night. You in? Reyes keeps winning and it's starting to feel personal." },
    tint: '#9868c0',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'bridge', label: 'BRIDGE', code: 'α-01', deck: 'COMMAND',
    col: 3, row: 0,
    alwaysOpen: false, unlockFlag: 'unit4_l6',
    npc: 'Voss', npcColor: '#9080cc', isWork: false,
    denial: 'The Bridge is a restricted area. Captain Voss is not accepting visitors.',
    dlg: { sp: 'Voss', txt: "I've been watching your work orders, Mechanic. Sit down. We need to talk about Sub-Level 3." },
    tint: '#9080cc',
    bgImage: null,
    sealedImage: null,
  },
  {
    id: 'maint_bay', label: 'MAINT. BAY', code: 'F-01', deck: 'DECK 4',
    col: 3, row: 2,
    alwaysOpen: false, unlockFlag: 'unit4_l6',
    npc: 'MAINT-SYS', npcColor: '#40a860', isWork: false,
    denial: 'The Maintenance Bay is locked down for a diagnostic cycle.',
    dlg: { sp: 'MAINT-SYS', txt: 'DIAGNOSTIC COMPLETE — INTEGRITY: 94.7% — ANOMALY LOGGED: SUB-LEVEL 3 — CLASSIFICATION: [REDACTED]' },
    tint: '#40a860',
    bgImage: null,
    sealedImage: null,
  },
]

// Corridor edges, by room id. '__junction' is a virtual point (not a room)
// at col 3 / row 1 — the empty stretch of hallway the reference art shows
// running east from Workstation to meet the Bridge → Maintenance Bay spine.
export const CORRIDORS = [
  ['quarters', 'mess'],
  ['quarters', 'engine'],
  ['quarters', 'workstation'],
  ['workstation', 'hydro'],
  ['mess', 'obs_deck'],
  ['obs_deck', 'ada_quarters'],
  ['ada_quarters', 'bridge'],
  ['engine', 'hydro'],
  ['hydro', 'lounge'],
  ['lounge', 'maint_bay'],
  ['bridge', 'maint_bay'],
  ['mess', 'workstation'],
  ['ada_quarters', 'workstation'],
  ['workstation', '__junction'],
]

export const SP_COLORS = {
  Ada: '#d05858',
  Reyes: '#c07028',
  Voss: '#9080cc',
  'MAINT-SYS': '#40a860',
  '[ ambient ]': '#3fa8d8',
  '[ SYSTEM ]': '#1a3050',
}

export const DEV_FLAGS = ['unit1_l1', 'unit2_l1', 'unit2_l9', 'unit3_l1', 'unit4_l6']

// ── Geometry helpers ─────────────────────────────────────────────────────
// The map is drawn on a 400x300 virtual canvas (4 cols x 100, 3 rows x 100)
// so both the CSS grid and the corridor SVG overlay subdivide the exact
// same box the exact same way — they stay pixel-aligned at any real size.
export const VIEW_W = GRID_COLS * 100
export const VIEW_H = GRID_ROWS * 100

const NODE_POINTS = {
  __junction: { col: 3, row: 1 },
}

export function nodeCenter(id) {
  const room = ROOMS.find(r => r.id === id)
  const point = room ?? NODE_POINTS[id]
  if (!point) return { x: 0, y: 0 }
  return { x: point.col * 100 + 50, y: point.row * 100 + 50 }
}

export function isRoomOpen(room, activeFlags) {
  return room.alwaysOpen || !!activeFlags[room.unlockFlag]
}

// ── "Looking ≠ doing" guard ───────────────────────────────────────────────
// Only actually dispatch goToUnit() when the destination is a *different*
// unit than the one already active. Prevents "just peeking" at Workstation
// (e.g. from the mid-lesson map overlay) from resetting the current
// lesson's phase back to 'work' — goToUnit() always resets phase, so
// re-firing it while already inside the target unit would silently knock
// the player back to phase 1 of the lesson they're mid-way through.
export function safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, onDone) {
  if (activeUnitId !== targetUnit) {
    goToUnit(targetUnit)
  }
  onDone() // close the scene either way
}
