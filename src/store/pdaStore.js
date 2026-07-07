/**
 * pdaStore.js
 *
 * The relationship engine. Everything Ada says to you, every reply you
 * make, every photo she's sent, every note the ship auto-generated from
 * your completed work — it all lives here, persisted across sessions.
 *
 * ── Architecture ────────────────────────────────────────────────────────
 *
 *  RAPPORT         (-10 → +10)
 *    A single running score. Every reply choice shifts it up or down.
 *    Three bands determine which dialogue stream Ada uses:
 *      warm    : rapport >= 4
 *      neutral : rapport -3 to +3
 *      cold    : rapport <= -4
 *
 *  CHOICE LOG
 *    Full history of every reply the player has made, with timestamp and
 *    the rapport delta it caused. For debugging, story reflection, maybe
 *    a late-game "your record" screen.
 *
 *  STORY FLAGS
 *    Key/value map for plot-critical state. Unit endings write here.
 *    Examples:
 *      'unit1_ending': 'aligned' | 'defiant'
 *      'ada_knows_memory': true
 *      'reyes_trust': true
 *    Other systems can read flags to gate content.
 *
 *  MESSAGE THREADS
 *    Keyed by contact ID. Each message has:
 *      - type: 'incoming' | 'reply' | 'system' | 'image'
 *      - unlocked: boolean (false = queued, not yet delivered)
 *      - replyOptions: null | array of 3 choices
 *      - replied: false | choiceId string
 *      - image: null | { src, caption, alt }
 *
 *  CONTACTS
 *    Ada + crew. Most threads empty placeholders for now. Contact cards
 *    show status, role, and how many unread messages.
 *
 *  GALLERY
 *    Every image Ada (or others) have sent, in chronological order.
 *    Also accessible from ContactsTab as a filtered view.
 *
 *  NOTES
 *    Auto-generated lore entries. When a lesson is completed, its
 *    narrative.lore gets written here as a note with timestamp.
 *    The player never writes notes; the ship does.
 *
 * ── Unlock model ────────────────────────────────────────────────────────
 *
 *  Messages unlock when their `trigger` condition is met.
 *  Triggers are strings, resolved by unlockTrigger(trigger):
 *    'lesson:unit1-01'   → lesson unit1-01 completed
 *    'unit1:end'         → unit 1 binary choice made
 *    'rapport:warm'      → rapport reached warm band
 *    'flag:ada_knows_memory' → story flag set
 *
 *  The action triggerLessonComplete(lessonId, lore?) is called by
 *  canvasStore/SuccessCard after a lesson is solved. It:
 *    1. Unlocks any messages gated on that lesson
 *    2. Adds a note if lore was provided
 *    3. Sets unread counts
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  UNIT1_MESSAGES,
  UNIT2_MESSAGES,
  UNIT3_MESSAGES,
  UNIT4_MESSAGES,
  UNIT5_MESSAGES,
  REYES_MESSAGES,
  VOSS_MESSAGES,
  MAINT_MESSAGES,
  DAY60_MESSAGES,
} from '../data/adaMessages'
import { ROOMS, resolveRoomStage } from '../components/shipmap/shipMapData'

// ── Rapport bands ──────────────────────────────────────────────────────
export function rapportBand(rapport) {
  if (rapport >= 4)  return 'warm'
  if (rapport <= -4) return 'cold'
  return 'neutral'
}

// ── Initial contacts ───────────────────────────────────────────────────
const INITIAL_CONTACTS = [
  {
    id:     'ada',
    name:   'Ada',
    role:   'Mechanic 2nd Class · Deck 7',
    status: 'online',
    color:  '#ff4d5e',
    initials: 'A',
    bio:    'Your shift partner. She\'s been covering for you since the accident — catching you up before every rotation so you\'re not flying blind. Doesn\'t make a big deal of it.',
    hasPhoto: false,   // toggled true when Ada sends her first selfie
  },
  {
    id:     'reyes',
    name:   'Engineer Reyes',
    role:   'Engineering Lead · Deck 4',
    status: 'away',
    color:  '#f5c400',
    initials: 'R',
    bio:    'Dispatch. Sends work orders through COMMAND channel. Hasn\'t spoken to you directly yet.',
    hasPhoto: false,
  },
  {
    id:     'captain',
    name:   'Captain Voss',
    role:   'Command · Bridge',
    status: 'offline',
    color:  '#6699ff',
    initials: 'V',
    bio:    'Ship\'s commanding officer. You have no messages from her. That\'s probably fine.',
    hasPhoto: false,
  },
  {
    id:     'maint',
    name:   'MAINT-SYS',
    role:   'Automated · Ship Infrastructure',
    status: 'online',
    color:  '#44cc88',
    initials: 'M',
    bio:    'The ship\'s own maintenance system. Auto-generates work logs and incident reports. Not a person.',
    hasPhoto: false,
  },
]

// ── Default PDA state ──────────────────────────────────────────────────
function defaultState() {
  return {
    // ── Mode select ─────────────────────────────────────────────────
    // null    = not chosen yet (Home shows the mode-select gate)
    // true    = Story Mode (Home → Map → Location)
    // false   = Standard Mode (Home → unit grid, current app)
    // Locked once set (see setStoryMode) — no mid-save switching.
    storyMode:    null,

    // Navigation
    pdaOpen:      false,
    mapOpen:      false,       // fullscreen Ship Map overlay (TopBar button / "M" key)
    activeScene:  null,        // room id, or null = showing the map grid
    pdaView:      'home',      // 'home' | 'app'
    activeApp:    'comm',      // 'comm' | 'tasks' | 'gallery' | 'crew' | 'logs'
    activeTab:    'messages',  // legacy compat — unused by new shell
    activeThread: 'ada',

    // Relationship
    rapport:     0,
    choiceLog:   [],   // [{ lessonId, replyId, label, delta, ts }]
    storyFlags:  {},   // { flagKey: value }

    // Content
    contacts:    INITIAL_CONTACTS,
    threads:     {
      ada:     [],
      reyes:   [],
      captain: [],
      maint:   [],
    },
    gallery:     [],   // [{ id, src, caption, alt, senderId, ts, lessonId }]
    notes:       [],   // [{ id, title, body, lessonId, ts }]
    roomVisits:  {},   // { roomId: count } — free-roam visit counter, per room

    // Unread counts per thread
    unread:      { ada: 0, reyes: 0, captain: 0, maint: 0 },

    // Track which lesson messages have been seeded (prevent duplicates on re-load)
    seededLessons: [],

    // Current active work order (set by triggerLessonLoad)
    currentTask: null,

    // ── Standing PDA tasks (separate from work orders) ───────────────
    // Seeded once at game start. Pinned items are never checkable —
    // they're narrative fixtures, not actual to-dos.
    tasks: [
      {
        id:        'task-day60-psych',
        label:     'Check in with Psych before Day 60.',
        addedBy:   'A.',
        pinned:    true,
        completed: false,
      },
    ],
    shipDay: 1,
  }
}

const usePdaStore = create(
  persist(
    (set, get) => ({
      ...defaultState(),

      // ── Mode select ─────────────────────────────────────────────────
      /**
       * Chosen once per save file, then locked — the Home mode-select
       * gate only renders while storyMode is null, so in practice this
       * only ever fires once, but the guard makes that a hard rule
       * rather than an accident of the UI.
       */
      setStoryMode(mode) {
        if (get().storyMode !== null) return
        set({ storyMode: mode })
      },

      // ── PDA open/close ───────────────────────────────────────────────
      openPda(app = null, thread = null) {
        if (app) {
          set({ pdaOpen: true, pdaView: 'app', activeApp: app })
        } else {
          set({ pdaOpen: true, pdaView: 'home' })
        }
        if (thread) set({ activeThread: thread })
      },
      closePda() { set({ pdaOpen: false }) },

      // ── Ship Map overlay open/close ───────────────────────────────────
      // Fullscreen tactical map, summonable mid-lesson (TopBar button or
      // the "M" key) without leaving the Workspace/lesson you're in.
      openMap()   { set({ mapOpen: true }) },
      // Also clears activeScene — otherwise reopening the overlay later
      // would drop the player straight into whatever scene they last had
      // open instead of the map grid.
      closeMap()  { set({ mapOpen: false, activeScene: null }) },
      toggleMap() { set(s => ({ mapOpen: !s.mapOpen })) },

      // ── Location Scene open/close ─────────────────────────────────────
      // activeScene is a room id ('quarters', 'mess', ...) or null.
      // Works identically whether the map underneath is the full page or
      // the mid-lesson overlay — neither needs to know which context it's in.
      openScene(roomId)  {
        const state = get()
        const visits = (state.roomVisits[roomId] || 0) + 1
        set({ activeScene: roomId, roomVisits: { ...state.roomVisits, [roomId]: visits } })
        get()._checkRoomMoment(roomId, visits)
      },
      closeScene()       { set({ activeScene: null }) },

      // ── Free-roam moment photos ───────────────────────────────────────
      /**
       * Called every time a room scene opens. Resolves the room's current
       * dialogue stage (same logic RoomDialoguePanel uses) and, if that
       * stage carries a `moment`, unlocks it into the gallery — once.
       */
      _checkRoomMoment(roomId, visits) {
        const room = ROOMS.find(r => r.id === roomId)
        if (!room) return
        const state = get()
        const ctx = { flags: state.storyFlags, rapportBand: rapportBand(state.rapport), visits }
        const stage = resolveRoomStage(room, ctx)
        if (stage.moment) get().unlockMoment(stage.moment)
      },
      unlockMoment(moment) {
        const gallery = get().gallery
        if (gallery.find(p => p.id === moment.id)) return  // already collected
        set({
          gallery: [...gallery, {
            id:       moment.id,
            src:      moment.src,
            caption:  moment.caption || '',
            alt:      moment.alt || '',
            senderId: 'moment',
            ts:       Date.now(),
            lessonId: null,
          }],
        })
      },
      getRoomVisits(roomId) { return get().roomVisits[roomId] || 0 },

      // ── Dev cheat: unlock every gallery photo at once ──────────────────
      /**
       * Force-unlocks EVERY photo the gallery can ever contain, regardless
       * of story flags, rapport band, room-visit counts, or which of the
       * 3 reply options a real player would've had to pick — in one shot.
       * Purely additive: never removes/replaces existing entries, and
       * dedups by id, so it's safe to hit this before, during, or after a
       * real playthrough without creating duplicate gallery cards.
       *
       * Two independent photo systems feed the gallery, so this walks both:
       *   1. Room "moments"     — stage.moment across every ROOMS entry
       *      (shipMapData.js), normally gated by flags/rapport/minVisits.
       *   2. Ada's reply photos — the `adaImage` tucked inside a specific
       *      replyOptions entry (adaMessages.js), normally only added once
       *      a player picks that exact reply out of 3 choices.
       *
       * NOTE: the id scheme for #2 below must exactly match what
       * submitReply() would generate for a real playthrough
       * (`response-${parentMsgId}-${replyOption.id}`) — otherwise cheating
       * this in first and then actually playing through legitimately would
       * create a duplicate card for the same photo.
       */
      devUnlockAllPhotos() {
        const gallery = get().gallery
        const seen = new Set(gallery.map(p => p.id))
        const additions = []

        // 1) Every room moment, ignoring flag/rapport/minVisits gates.
        for (const room of ROOMS) {
          for (const stage of room.stages || []) {
            if (!stage.moment || seen.has(stage.moment.id)) continue
            seen.add(stage.moment.id)
            additions.push({
              id:       stage.moment.id,
              src:      stage.moment.src,
              caption:  stage.moment.caption || '',
              alt:      stage.moment.alt || '',
              senderId: 'moment',
              ts:       Date.now(),
              lessonId: null,
            })
          }
        }

        // 2) Every adaImage across all 5 units' message banks, ignoring
        //    which reply option a player would've had to choose.
        const allMessages = [
          ...UNIT1_MESSAGES, ...UNIT2_MESSAGES, ...UNIT3_MESSAGES,
          ...UNIT4_MESSAGES, ...UNIT5_MESSAGES,
        ]
        for (const message of allMessages) {
          for (const option of message.replyOptions || []) {
            if (!option.adaImage) continue
            const id = `response-${message.id}-${option.id}`
            if (seen.has(id)) continue
            seen.add(id)
            additions.push({
              id,
              src:      option.adaImage.src,
              caption:  option.adaImage.caption || '',
              alt:      option.adaImage.alt || '',
              senderId: message.contactId,
              ts:       Date.now(),
              lessonId: message.id,
            })
          }
          // Belt-and-suspenders: also catch any top-level `image` a message
          // might carry directly (the type:'image' shape _addMessage
          // already supports) — none exist in the data today, but this
          // keeps the cheat correct if that pattern gets used later.
          if (message.image && !seen.has(message.id)) {
            seen.add(message.id)
            additions.push({
              id:       message.id,
              src:      message.image.src,
              caption:  message.image.caption || '',
              alt:      message.image.alt || '',
              senderId: message.contactId,
              ts:       Date.now(),
              lessonId: message.id,
            })
          }
        }

        if (additions.length) set({ gallery: [...gallery, ...additions] })
      },

      goHome()   { set({ pdaView: 'home' }) },
      openApp(app) { set({ pdaView: 'app', activeApp: app }) },
      setTab(tab) {
        const appMap = { messages: 'comm', photos: 'gallery', contacts: 'crew', notes: 'logs' }
        set({ pdaView: 'app', activeApp: appMap[tab] || 'comm' })
      },
      setThread(threadId) {
        // Clear unread for this thread
        const unread = { ...get().unread, [threadId]: 0 }
        set({ activeThread: threadId, unread })
      },

      // ── Rapport ─────────────────────────────────────────────────────
      applyRapportDelta(delta) {
        const current = get().rapport
        const next = Math.max(-10, Math.min(10, current + delta))
        set({ rapport: next })
        return next
      },
      getRapportBand() { return rapportBand(get().rapport) },

      // ── Story flags ──────────────────────────────────────────────────
      setFlag(key, value) {
        set({ storyFlags: { ...get().storyFlags, [key]: value } })
      },
      getFlag(key) { return get().storyFlags[key] },
      hasFlag(key) { return key in get().storyFlags },

      // ── Message delivery ─────────────────────────────────────────────
      /**
       * Add a single message object to a thread.
       * msg shape: {
       *   id, contactId, type, content, image,
       *   replyOptions, replied, ts
       * }
       */
      _addMessage(contactId, msg) {
        const threads = get().threads
        const thread  = threads[contactId] || []

        // Prevent duplicate IDs
        if (thread.find(m => m.id === msg.id)) return

        const next = { ...threads, [contactId]: [...thread, msg] }
        const unread = { ...get().unread }
        if (msg.type !== 'reply') {
          unread[contactId] = (unread[contactId] || 0) + 1
        }

        // Add to gallery if it's an image
        if (msg.type === 'image' && msg.image) {
          const gallery = [...get().gallery, {
            id:       msg.id,
            src:      msg.image.src,
            caption:  msg.image.caption || '',
            alt:      msg.image.alt || '',
            senderId: contactId,
            ts:       msg.ts,
            lessonId: msg.lessonId || null,
          }]
          set({ threads: next, unread, gallery })
        } else {
          set({ threads: next, unread })
        }
      },

      /**
       * Advance the standing ship-day counter. Once it crosses 60 for the
       * first time, seeds the one-time "Day 60" callback message (rapport-
       * gated, same pattern as the per-unit bonus messages). The pinned
       * task itself never gets marked complete — that's intentional.
       */
      _advanceShipDay(amount) {
        const current = get().shipDay
        const next = current + amount
        set({ shipDay: next })

        if (current < 60 && next >= 60 && !get().storyFlags['day60_crossed']) {
          get().setFlag('day60_crossed', true)
          get()._seedMessagesForTrigger('flag:day60_crossed:true')
        }
      },

      /**
       * Seed messages from a lesson trigger.
       * Called by triggerLessonComplete. Reads UNIT1_MESSAGES (and future
       * unit message banks) and delivers any message whose trigger matches.
       */
      _seedMessagesForTrigger(trigger) {
        const band = rapportBand(get().rapport)
        const allMessages = [
          ...UNIT1_MESSAGES,
          ...UNIT2_MESSAGES,
          ...UNIT3_MESSAGES,
          ...UNIT4_MESSAGES,
          ...UNIT5_MESSAGES,
          ...REYES_MESSAGES,
          ...VOSS_MESSAGES,
          ...MAINT_MESSAGES,
          ...DAY60_MESSAGES,
        ]

        for (const msg of allMessages) {
          if (msg.trigger !== trigger) continue
          // Check rapport gating
          if (msg.rapportGate && msg.rapportGate !== band) continue
          // Check flag gating
          if (msg.flagGate) {
            const [flagKey, flagVal] = msg.flagGate
            if (get().storyFlags[flagKey] !== flagVal) continue
          }
          get()._addMessage(msg.contactId, {
            ...msg,
            ts: msg.ts || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          })
        }
      },

      // ── Lesson completion hook ───────────────────────────────────────
      /**
       * Call this from SuccessCard / canvasStore after a lesson is solved.
       * lessonId: e.g. 'unit1-01'
       * lore:     optional string from narrative.lore
       */
      triggerLessonComplete(lessonId, lore = null, lessonTitle = '') {
        const { seededLessons } = get()
        if (seededLessons.includes(lessonId)) return  // idempotent

        set({ seededLessons: [...seededLessons, lessonId] })

        // Advance the ship-day counter and check the Day 60 threshold
        get()._advanceShipDay(2)

        // Seed messages
        get()._seedMessagesForTrigger(`lesson:${lessonId}`)

        // Story Mode room unlocks (ShipMap.jsx). lessonId 'unit1-01' -> flag
        // 'unit1_l1' — matches the unlockFlag values on ROOMS 1:1, so every
        // lesson completion just derives and sets its own flag generically
        // rather than needing a hand-maintained lessonId → room table.
        const m = /^unit(\d+)-(\d+)$/.exec(lessonId || '')
        if (m) {
          const [, unitNum, lessonNum] = m
          get().setFlag(`unit${unitNum}_l${Number(lessonNum)}`, true)
        }

        // Auto-generate note from lore
        if (lore) {
          const note = {
            id:       `note-${lessonId}`,
            title:    lessonTitle || lessonId,
            body:     lore,
            lessonId,
            ts:       new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }
          set({ notes: [...get().notes, note] })
        }
      },

      // ── Unit ending trigger ──────────────────────────────────────────
      triggerUnitEnd(unitId) {
        get()._seedMessagesForTrigger(`unit${unitId}:end`)
      },

      // ── Lesson load hook ─────────────────────────────────────────────
      /**
       * Called when a new lesson loads. Stores the current work order
       * data so TasksApp can display it without reading lessonStore directly.
       * Also auto-opens the PDA to Tasks if this is the first time seeing it.
       * lessonMeta:      { id, workOrder, location, shift, title, unit }
       * lessonNarrative: { recap, briefing, fault, dispatch, success }
       * phase:           current phase string
       */
      triggerLessonLoad(lessonMeta, lessonNarrative, phase) {
        set({
          currentTask: {
            lessonId:  lessonMeta?.id || null,
            workOrder: lessonMeta?.workOrder || '—',
            location:  lessonMeta?.location || '—',
            shift:     lessonMeta?.shift || '—',
            title:     lessonMeta?.title || '—',
            unit:      lessonMeta?.unit || null,
            recap:     lessonNarrative?.recap || null,
            briefing:  lessonNarrative?.briefing || null,
            fault:     lessonNarrative?.fault || null,
            dispatch:  lessonNarrative?.dispatch || null,
            success:   lessonNarrative?.success || null,
            phase,
          }
        })
      },

      // Update just the phase on the current task (called when phase shifts)
      updateTaskPhase(phase) {
        const { currentTask } = get()
        if (!currentTask) return
        set({ currentTask: { ...currentTask, phase } })
      },

      clearCurrentTask() { set({ currentTask: null }) },

      // ── Reply to Ada ─────────────────────────────────────────────────
      /**
       * Player picks a reply option.
       * replyOption: { id, label, rapportDelta, adaResponse, adaImage? }
       * parentMsgId: the message being replied to
       */
      submitReply(contactId, parentMsgId, replyOption, lessonId = null) {
        const { threads, choiceLog } = get()
        const thread = threads[contactId] || []

        // Mark parent as replied
        const updatedThread = thread.map(m =>
          m.id === parentMsgId ? { ...m, replied: replyOption.id } : m
        )

        const ts = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: false
        })

        // Add the player's reply bubble
        const playerMsg = {
          id:   `reply-${parentMsgId}-${replyOption.id}`,
          contactId,
          type: 'reply',
          content: replyOption.label,
          ts,
          replyOptions: null,
          replied: null,
          image: null,
        }

        // Add Ada's response bubble
        const adaResponse = {
          id:       `response-${parentMsgId}-${replyOption.id}`,
          contactId,
          type:     replyOption.adaImage ? 'image' : 'incoming',
          content:  replyOption.adaResponse,
          image:    replyOption.adaImage || null,
          ts,
          replyOptions: null,
          replied: null,
          lessonId,
        }

        const nextThreadMessages = [...updatedThread, playerMsg, adaResponse]
        const nextThreads = { ...threads, [contactId]: nextThreadMessages }

        // Apply rapport delta
        const newRapport = Math.max(-10, Math.min(10, get().rapport + (replyOption.rapportDelta || 0)))

        // Log the choice
        const logEntry = {
          lessonId,
          replyId:   replyOption.id,
          label:     replyOption.label,
          delta:     replyOption.rapportDelta || 0,
          rapport:   newRapport,
          ts,
        }

        set({
          threads: nextThreads,
          rapport: newRapport,
          choiceLog: [...choiceLog, logEntry],
        })

        // Add Ada's photo to gallery if it's an image response
        if (replyOption.adaImage) {
          const gallery = [...get().gallery, {
            id:       adaResponse.id,
            src:      replyOption.adaImage.src,
            caption:  replyOption.adaImage.caption || '',
            alt:      replyOption.adaImage.alt || '',
            senderId: contactId,
            ts,
            lessonId,
          }]
          set({ gallery })
        }

        // After reply, check if rapport shift unlocks anything
        const band = rapportBand(newRapport)
        get()._seedMessagesForTrigger(`rapport:${band}`)
      },

      // ── Binary unit-end choice ───────────────────────────────────────
      /**
       * The big moment. Only called at end of unit 5 (and optionally
       * intermediate unit endings). Sets a story flag and seeds flag-gated
       * messages.
       */
      submitUnitChoice(unitId, choiceKey, choiceLabel) {
        const flagKey = `unit${unitId}_ending`
        get().setFlag(flagKey, choiceKey)

        const ts = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: false
        })

        const logEntry = {
          lessonId: `unit${unitId}:end`,
          replyId:  choiceKey,
          label:    choiceLabel,
          delta:    0,
          rapport:  get().rapport,
          ts,
        }
        set({ choiceLog: [...get().choiceLog, logEntry] })

        // Unit endings are bigger narrative beats — advance the day counter more
        get()._advanceShipDay(4)

        // Seed flag-gated messages
        get()._seedMessagesForTrigger(`flag:${flagKey}:${choiceKey}`)
      },

      // ── Unread count helpers ─────────────────────────────────────────
      totalUnread() {
        return Object.values(get().unread).reduce((a, b) => a + b, 0)
      },
      clearUnread(contactId) {
        set({ unread: { ...get().unread, [contactId]: 0 } })
      },

      // ── Dev / reset ──────────────────────────────────────────────────
      devReset() { set(defaultState()) },
      devSetRapport(val) { set({ rapport: Math.max(-10, Math.min(10, val)) }) },
      // Direct room-visit override — lets the dev cheat panel preview
      // minVisits-gated stages (e.g. Hydro-Pool visit 2 / visit 5) without
      // actually walking in and out of a room N times.
      devSetRoomVisits(roomId, n) {
        set({ roomVisits: { ...get().roomVisits, [roomId]: Math.max(0, n) } })
      },
      // Wipes every story flag at once — used by the cheat panel's
      // "Jump to Unit" presets before laying down a clean set for the
      // target unit, so stale flags from a previous jump can't linger.
      devClearFlags() { set({ storyFlags: {} }) },
    }),
    {
      name:    'gatelab-pda',
      version: 2,
      // Migrate if schema changes
      migrate(persistedState, version) {
        let state = persistedState
        if (version === 0) state = { ...defaultState(), ...state }
        // storyMode introduced in v2. Saves that predate it were all
        // Standard Mode (Story Mode didn't exist yet) — default them
        // there instead of surfacing the mode-select gate retroactively.
        if (version < 2 && state.storyMode === undefined) {
          state = { ...state, storyMode: false }
        }
        return state
      },
    }
  )
)

export default usePdaStore