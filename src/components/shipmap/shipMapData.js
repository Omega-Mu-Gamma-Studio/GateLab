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

/**
 * ── Free-roam dialogue stages ────────────────────────────────────────────
 *
 * Each room can optionally carry a `stages` array on top of its base `dlg`.
 * Stages are ordered MOST-ADVANCED FIRST — resolveRoomStage() walks the
 * list and returns the first one whose conditions are satisfied, so a
 * later stage always wins over an earlier one once its flag is set.
 *
 * Stage shape:
 *   {
 *     flag?:        [flagKey, flagValue]   — storyFlags[flagKey] === flagValue
 *     rapportGate?: 'warm' | 'neutral' | 'cold'
 *     minVisits?:   number                 — ctx.visits >= minVisits
 *     sp, txt:      same as room.dlg
 *     moment?:      { id, src, alt, caption } — unlocked into the gallery
 *                   (senderId: 'moment') the first time this stage resolves
 *   }
 *
 * A stage with no conditions always matches — used as the final fallback
 * and it's just the room's original unlock-line `dlg` content, so rooms
 * with no `stages` array at all behave exactly as before.
 *
 * NOTE ON FLAGS: "unit N start" here means the flag for that unit's lesson
 * 1 (e.g. `unit3_l1`), auto-set by triggerLessonLoad the moment a player
 * begins that lesson. Room `unlockFlag` values are now kept in lockstep
 * with this same convention (Obs. Deck / Lounge → `unit2_l1`, Ada's
 * Quarters → `unit3_l1`, Hydro-Pool → `unit4_l1`) — Mess Hall, Your
 * Quarters, Workstation, Engine Room, Bridge, and Maint. Bay are all
 * `alwaysOpen`, available from Day 1 per the free-roam design doc, and
 * rely on their base `dlg` (or the lowest-priority `stages` entry) to
 * carry a room until its first real story beat fires.
 */

export const ROOMS = [
  {
    id: 'quarters', label: 'YOUR QUARTERS', code: 'A-07', deck: 'DECK 7',
    col: 0, row: 1,
    alwaysOpen: true, unlockFlag: null,
    npc: null, npcColor: null, isWork: false,
    denial: null,
    dlg: { sp: '[ ambient ]', txt: 'Your bunk. The PDA glows on the desk. The hull hums beneath the floor.' },
    tint: '#3fa8d8',
    bgImage: '/background/Ship-Quarters.png',        // drop a real photo path in here later
    sealedImage:'/background/Blast-Door.png',    // AI-generated "sealed door" art goes here later
    hasPda: true,
    stages: [
      { flag: ['unit5_ending', 'need'], sp: '[ ambient ]', txt: 'Bags half-packed, half not. You still haven\u2019t decided if "know everything" means "leave."' },
      { flag: ['unit5_ending', 'matter'], sp: '[ ambient ]', txt: 'Everything\u2019s exactly where you left it. Some questions you just stop asking.' },
      { flag: ['unit5_l1'], sp: '[ ambient ]', txt: 'Time to pack up. Or stay? Nobody\u2019s told you which yet.' },
      { flag: ['unit4_ending', 'protect'], sp: '[ ambient ]', txt: 'You made a choice. You\u2019re living with it — and so is she.' },
      { flag: ['unit4_ending', 'accurate'], sp: '[ ambient ]', txt: 'You filed it straight. The bunk doesn\u2019t care either way. You do.' },
      { flag: ['unit3_l1'], sp: '[ ambient ]', txt: 'Something\u2019s off. Ada looked at you strangely at the door this morning.' },
      { flag: ['unit2_l1'], sp: '[ ambient ]', txt: 'You\u2019ve got a routine now. Same bunk, same hum, less strange than it was.' },
      { flag: ['unit1_ending', 'aligned'], sp: '[ ambient ]', txt: 'You filed it straight. Starting to feel like this place is actually yours.' },
      { flag: ['unit1_ending', 'defiant'], sp: '[ ambient ]', txt: 'You kept it vague. Starting to feel like home, whatever that costs later.' },
    ],
  },
  {
    id: 'mess', label: 'MESS HALL', code: 'B-01', deck: 'DECK 7',
    col: 0, row: 0,
    alwaysOpen: true, unlockFlag: null,
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: null,
    dlg: { sp: 'Ada', txt: "You're early. Or late. I can never tell with you. Sit — I'll grab your ration." },
    tint: '#d05858',
    bgImage: '/background/Mess-Hall.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_ending', 'need'], sp: 'Ada', txt: "You did good. I mean it — not the report, you. Eat something." },
      { flag: ['unit5_ending', 'matter'], sp: 'Ada', txt: "You did good. That\u2019s all I\u2019ve got today. Eat something." },
      { flag: ['unit5_l1'], sp: 'Ada', txt: "We're almost done here. Feels strange to say out loud." },
      { flag: ['unit4_ending', 'protect'], sp: 'Ada', txt: "You didn\u2019t have to write it that way. I know what it cost you. Thank you." },
      { flag: ['unit4_ending', 'accurate'], sp: 'Ada', txt: "You filed it straight. I get it. I would\u2019ve done the same." },
      { flag: ['unit4_l1'], sp: 'Ada', txt: "You heard about the off-shift thing. Everyone has. Nobody\u2019s saying whose fault yet." },
      { flag: ['unit3_ending', 'tell'], sp: 'Ada', txt: "I told you what I found. Still feels like I should\u2019ve waited. You okay?" },
      { flag: ['unit3_ending', 'wait'], sp: 'Ada', txt: "I\u2019m still holding onto it. Whenever you\u2019re ready — no rush." },
      { flag: ['unit3_l1'], sp: 'Ada', txt: "There's something in your file. I'm not going to pretend I'm not a little worried." },
      { flag: ['unit2_l1'], sp: 'Ada', txt: "You're getting the hang of this. Don't let it go to your head, mechanic." },
      { flag: ['unit1_ending', 'aligned'], sp: 'Ada', txt: "Word got around you filed that report straight. Reyes noticed. So did I." },
      { flag: ['unit1_ending', 'defiant'], sp: 'Ada', txt: "You kept it vague. Reyes hasn't said anything. Yet. I'm not going to push." },
      {
        flag: ['unit1_l3'], sp: 'Ada', txt: "That relay fault's still bugging Reyes. She won't say it, but she's impressed you caught it.",
        moment: { id: 'moment-mess-hall-candid', src: 'moment:mess-hall-candid', caption: 'Ada mid-sentence, coffee in hand, explaining something with that "you getting this?" look.', alt: 'Ada mid-sentence, coffee in hand, explaining something with a "you getting this?" look' },
      },
    ],
  },
  {
    id: 'engine', label: 'ENGINE ROOM', code: 'E-01', deck: 'DECK 4',
    col: 0, row: 2,
    alwaysOpen: true, unlockFlag: null,
    npc: 'Reyes', npcColor: '#c07028', isWork: false,
    denial: null,
    dlg: { sp: 'Reyes', txt: "You're not supposed to be down here. But since you are — suit up." },
    tint: '#c07028',
    bgImage: '/background/Engine-Room.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_ending', 'need'], sp: 'Reyes', txt: "So you know about Sub-Level 3 now. Wondered when it'd catch up to you." },
      { flag: ['unit5_ending', 'matter'], sp: 'Reyes', txt: "Didn't push it, huh. Your call. Not mine to say if that's smart." },
      { flag: ['unit5_l1'], sp: 'Reyes', txt: "Voss is asking about you. Didn't say why. That's never good." },
      { flag: ['unit4_ending', 'protect'], sp: 'Reyes', txt: "Didn't expect that out of you. Protecting her on paper. Noted." },
      { flag: ['unit4_ending', 'accurate'], sp: 'Reyes', txt: "Filed it straight. Can't fault you for that. Doesn't make it easy on her, though." },
      { flag: ['unit4_l1'], sp: 'Reyes', txt: "Heard about the off-shift thing. Rough. Don't ask me whose fault it was." },
      { flag: ['unit3_l1'], sp: 'Reyes', txt: "You hear about that anomaly in your file? Ship's full of ghosts, mechanic." },
      { flag: ['unit2_ending', 'amended'], sp: 'Reyes', txt: "You amended my assessment. We're gonna talk about that — later, not now." },
      { flag: ['unit2_ending', 'confirmed'], sp: 'Reyes', txt: "Let my assessment stand, huh. Didn't expect anything else from you." },
      { flag: ['unit1_ending', 'aligned'], sp: 'Reyes', txt: "Filed the relay fault straight. Good. That's how it's supposed to work." },
      { flag: ['unit1_ending', 'defiant'], sp: 'Reyes', txt: "Filed it vague. That's not how we do things down here. Watch yourself." },
      {
        flag: ['unit1_l5'], sp: 'Reyes', txt: "Relay's acting up again. Don't just stand there — hand me that meter.",
        moment: { id: 'moment-engine-reyes-console', src: 'moment:engine-reyes-console', caption: 'Reyes scowling at a readout, greasy hands, annoyed at the relay fault.', alt: 'Reyes scowling at a diagnostic readout, hands greasy, visibly annoyed' },
      },
    ],
  },
  {
    id: 'obs_deck', label: 'OBS. DECK', code: 'C-01', deck: 'DECK 7',
    col: 1, row: 0,
    alwaysOpen: false, unlockFlag: 'unit2_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Observation Deck is closed for maintenance. Try again after your first shift.',
    dlg: { sp: 'Ada', txt: "The Veil Nebula is visible on clear cycles. I used to come up here with... well. It's a good view." },
    tint: '#6f8fd8',
    bgImage: '/background/Observation-Deck.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_ending', 'need'], sp: 'Ada', txt: "It was my brother. That's — that's what I've been circling for months. Now you know too." },
      { flag: ['unit5_ending', 'matter'], sp: 'Ada', txt: "Maybe another time. I'm not ready to finish that sentence out loud yet." },
      { flag: ['unit5_l1'], sp: 'Ada', txt: "There's something I need to tell you. Not tonight. Soon, though." },
      { flag: ['unit4_ending', 'protect'], sp: 'Ada', txt: "You didn't have to do that for me. I won't forget it." },
      { flag: ['unit4_ending', 'accurate'], sp: 'Ada', txt: "I understand why you filed it that way. I would've done the same." },
      { flag: ['unit4_l1'], sp: 'Ada', txt: "I keep replaying the off-shift thing. Wish I didn't." },
      { flag: ['unit3_ending', 'tell'], sp: 'Ada', txt: "You okay? I know what I told you wasn't nothing." },
      { flag: ['unit3_ending', 'wait'], sp: 'Ada', txt: "I heard you asked to wait. That's fair. I'll be here when you're ready." },
      { flag: ['unit3_l1'], sp: 'Ada', txt: "I heard about your file. You doing alright?" },
      {
        flag: ['unit2_l5'], sp: 'Ada', txt: "You ever feel small up here? In a good way, I mean.",
        moment: { id: 'moment-obsdeck-nebula-silhouette', src: 'moment:obsdeck-nebula-silhouette', caption: 'Ada silhouetted against the Veil Nebula, back to camera, trailing off mid-sentence.', alt: 'Ada silhouetted against the Veil Nebula through the observation window, back to camera' },
      },
    ],
  },
  {
    id: 'hydro', label: 'HYDRO-POOL', code: 'D-03', deck: 'DECK 6',
    col: 1, row: 2,
    alwaysOpen: false, unlockFlag: 'unit4_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Hydro-Pool is on a scheduled maintenance cycle. Check back after your next shift.',
    dlg: { sp: 'Ada', txt: "Don't look so surprised. Even mechanics get shore leave. The water's warm — for now." },
    tint: '#2ea88a',
    bgImage: '/background/Hydro-Pool.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_l1'], sp: 'Ada', txt: "We're almost done. Feels like we should be out here more, not less." },
      { flag: ['unit4_ending', 'protect'], sp: 'Ada', txt: "I won't forget this. What you did for me. Come sit, the water's fine." },
      { flag: ['unit4_ending', 'accurate'], sp: 'Ada', txt: "I get it. I do. Come sit anyway — no point both of us being tense." },
      {
        flag: ['unit4_l1'], minVisits: 5, rapportGate: 'warm', sp: 'Ada', txt: "You're quiet today. In a good way, I think. Sit with me a while.",
        moment: { id: 'moment-hydro-pool-edge', src: 'moment:hydro-pool-edge', caption: 'Ada sitting at the pool edge, feet in the water, quiet conversation.', alt: 'Ada sitting at the edge of the Hydro-Pool with her feet in the water, mid quiet conversation' },
      },
      {
        flag: ['unit4_l1'], minVisits: 2, sp: 'Ada', txt: "You're staring, mechanic.",
        moment: { id: 'moment-hydro-swim', src: 'moment:hydro-swim', caption: 'Ada mid-swim, hair back, unaware she\u2019s being watched.', alt: 'Ada mid-swim in the Hydro-Pool, hair pulled back, unaware she\u2019s being watched' },
      },
      { flag: ['unit2_l1'], sp: 'Ada', txt: "Shore leave. Finally. Don't look so surprised — even mechanics get it." },
    ],
  },
  {
    id: 'workstation', label: 'WORKSTATION', code: 'B-02', deck: 'DECK 7',
    col: 1, row: 1,
    alwaysOpen: true, unlockFlag: null,
    npc: null, npcColor: null, isWork: true,
    denial: null,
    dlg: { sp: 'MAINT-SYS', txt: 'TERMINAL ACTIVE — WORK ORDER QUEUE: 1 PENDING — AUTHENTICATE TO BEGIN SHIFT.' },
    tint: '#40a860',
    bgImage: '/background/Workstation.png',
    sealedImage:'/background/Blast-Door.png',
    // Always-available gameplay gate — text reflects lesson progress only,
    // handled by the existing lesson/task system, not free-roam stages.
  },
  {
    id: 'ada_quarters', label: "ADA'S QUARTERS", code: 'A-12', deck: 'DECK 7',
    col: 2, row: 0,
    alwaysOpen: false, unlockFlag: 'unit3_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: "Ada's door is shut. You can hear music from inside. Probably best not to interrupt.",
    dlg: { sp: 'Ada', txt: "...I wasn't expecting anyone. Come in. Mind the books — I keep meaning to sort them." },
    tint: '#c05840',
    bgImage: '/background/Ada-Quarters.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_ending', 'need'], sp: 'Ada', txt: "We'll figure it out together. Whatever's actually down there." },
      { flag: ['unit5_ending', 'matter'], sp: 'Ada', txt: "I respect that you let it go. Doesn't mean I have. Come in anyway." },
      { flag: ['unit5_l1'], sp: 'Ada', txt: "I've been thinking about everything. Sit — I'll put the guitar down for once." },
      { flag: ['unit4_ending', 'protect'], sp: 'Ada', txt: "You really did that for me. I don't know what to say. Sit down, please." },
      { flag: ['unit4_l1'], sp: 'Ada', txt: "I'm scared about what happens next, mechanic. Don't tell Reyes I said that." },
      { flag: ['unit3_ending', 'tell'], sp: 'Ada', txt: "You deserved to know. I meant that. Mind the books, still sorting them." },
      {
        flag: ['unit3_l5'], sp: 'Ada', txt: "You play? I'm still stuck on this one chord. Don't laugh.",
        moment: { id: 'moment-ada-quarters-guitar', src: 'moment:ada-quarters-guitar', caption: 'Ada actually playing the guitar, messy room, focused expression.', alt: 'Ada playing an acoustic guitar in her quarters, messy room, deeply focused expression' },
      },
    ],
  },
  {
    id: 'lounge', label: 'LOUNGE', code: 'C-02', deck: 'DECK 7',
    col: 2, row: 2,
    alwaysOpen: false, unlockFlag: 'unit2_l1',
    npc: 'Ada', npcColor: '#d05858', isWork: false,
    denial: 'The Lounge is closed for a private crew event.',
    dlg: { sp: 'Ada', txt: "Game night. You in? Reyes keeps winning and it's starting to feel personal." },
    tint: '#9868c0',
    bgImage: '/background/Lounge.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      { flag: ['unit5_l1'], sp: 'Ada', txt: "One more round before it's over? Reyes says you owe her a rematch." },
      { flag: ['unit4_l1'], sp: 'Ada', txt: "Ada's been quiet lately. Even here. You've probably noticed too." },
      { flag: ['unit3_l1'], sp: 'Ada', txt: "Reyes got chewed out. You hear? Won't say by who." },
      {
        flag: ['unit2_l5'], sp: 'Ada', txt: "You should join next time. Reyes needs someone else to lose to.",
        moment: { id: 'moment-lounge-game-night', src: 'moment:lounge-game-night', caption: 'Reyes mid-argument, Ada laughing, cards flying across the table.', alt: 'Reyes mid-argument over a card game, Ada laughing, cards flying across the table' },
      },
    ],
  },
  {
    id: 'bridge', label: 'BRIDGE', code: 'α-01', deck: 'COMMAND',
    col: 3, row: 0,
    alwaysOpen: true, unlockFlag: null,
    npc: 'Voss', npcColor: '#9080cc', isWork: false,
    denial: null,
    dlg: { sp: 'Voss', txt: "I've been watching your work orders, Mechanic. Sit down. We need to talk about Sub-Level 3." },
    tint: '#9080cc',
    bgImage: '/background/Bridge.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      {
        flag: ['unit5_ending', 'need'], sp: 'Voss', txt: "You want the full picture. Understood. Follow me — I'll show you what's actually down there.",
        moment: { id: 'moment-bridge-behind-door', src: 'moment:bridge-behind-door', caption: "Voss finally showing you what's behind Sub-Level 3.", alt: 'Captain Voss standing beside an open bulkhead, showing what lies behind Sub-Level 3' },
      },
      { flag: ['unit5_ending', 'matter'], sp: 'Voss', txt: "You let it go. Your peace, Mechanic. Just know the offer doesn't come twice." },
      { flag: ['unit5_l1'], sp: 'Voss', txt: "It's time you knew. Sit down properly this time." },
      { flag: ['unit4_l1'], sp: 'Voss', txt: "The incident was connected. More than you've been told. Sit." },
      {
        flag: ['unit3_l9'], sp: 'Voss', txt: "Something's coming. Be ready for it, Mechanic.",
        moment: { id: 'moment-bridge-sealed-bulkhead', src: 'moment:bridge-sealed-bulkhead', caption: 'Voss staring at a sealed door, hand on the frame, clearly troubled.', alt: 'Captain Voss standing before a sealed bulkhead door, hand on the frame, visibly troubled' },
      },
      { flag: ['unit2_l9'], sp: 'Voss', txt: "You've got questions. I can see it. Not yet, Mechanic." },
      { flag: ['unit1_l1'], sp: 'Voss', txt: "You're the new one. I've been watching your work orders since day one." },
    ],
  },
  {
    id: 'maint_bay', label: 'MAINT. BAY', code: 'F-01', deck: 'DECK 4',
    col: 3, row: 2,
    alwaysOpen: true, unlockFlag: null,
    npc: 'MAINT-SYS', npcColor: '#40a860', isWork: false,
    denial: null,
    dlg: { sp: 'MAINT-SYS', txt: 'DIAGNOSTIC COMPLETE — INTEGRITY: 94.7% — ANOMALY LOGGED: SUB-LEVEL 3 — CLASSIFICATION: [REDACTED]' },
    tint: '#40a860',
    bgImage: '/background/Maintenance-Bay.png',
    sealedImage:'/background/Blast-Door.png',
    stages: [
      {
        flag: ['unit5_ending', 'need'], sp: 'MAINT-SYS', txt: 'LOG UNSEALED — FULL RECORD AVAILABLE — CLASSIFICATION: [DECLASSIFIED]',
        moment: { id: 'moment-maintbay-unredacted-log', src: 'moment:maintbay-unredacted-log', caption: 'The full log, everything revealed.', alt: 'A terminal screen showing a fully unredacted maintenance log, no blacked-out lines remaining' },
      },
      { flag: ['unit5_ending', 'matter'], sp: 'MAINT-SYS', txt: 'LOG STATUS UNCHANGED — CLASSIFICATION: [REDACTED] — no further access requested' },
      { flag: ['unit5_l1'], sp: 'MAINT-SYS', txt: 'DIAGNOSTIC COMPLETE — INTEGRITY: 97.1% — SUB-LEVEL 3 RECORD: [MOSTLY DECLASSIFIED]' },
      { flag: ['unit4_l1'], sp: 'MAINT-SYS', txt: 'ANOMALY LOGGED: SUB-LEVEL 3 — CONNECTION FOUND: PERSONNEL — [REDACTED]' },
      { flag: ['unit3_l1'], sp: 'MAINT-SYS', txt: 'ANOMALY LOGGED: SUB-LEVEL 3 — PARTIAL ID MATCH: MECHANIC — [REDACTED]' },
      { flag: ['unit2_l1'], sp: 'MAINT-SYS', txt: 'ANOMALY LOGGED: SUB-LEVEL 3 — TWO LINES DECLASSIFIED — REMAINDER: [REDACTED]' },
      { flag: ['unit1_l1'], sp: 'MAINT-SYS', txt: 'ANOMALY LOGGED: SUB-LEVEL 3 — ONE LINE DECLASSIFIED — REMAINDER: [REDACTED]' },
    ],
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

// NOTE: the old POC unlock-flag toggle list that used to live here has
// been superseded by the global dev cheat panel
// (src/components/dev/DevCheatPanel.jsx), which tracks the full flag
// inventory (including ending variants and per-room visit counts) and
// writes straight to the real pdaStore instead of a page-local override.

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
  return  room.alwaysOpen || !!activeFlags[room.unlockFlag]
}

// ── Free-roam dialogue/moment resolver ───────────────────────────────────
// ctx: { flags: storyFlags, rapportBand: 'warm'|'neutral'|'cold', visits: number }
// Returns { sp, txt, moment? } — the highest-priority stage whose
// conditions are all satisfied, falling back to the room's base `dlg`.
function stageMatches(stage, ctx) {
  if (stage.flag) {
    const [key, val] = stage.flag
    if ((ctx.flags || {})[key] !== val) return false
  }
  if (stage.rapportGate && stage.rapportGate !== ctx.rapportBand) return false
  if (stage.minVisits != null && (ctx.visits || 0) < stage.minVisits) return false
  return true
}

export function resolveRoomStage(room, ctx = {}) {
  const stages = room.stages || []
  for (const stage of stages) {
    if (stageMatches(stage, ctx)) return stage
  }
  return { sp: room.dlg.sp, txt: room.dlg.txt }
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
