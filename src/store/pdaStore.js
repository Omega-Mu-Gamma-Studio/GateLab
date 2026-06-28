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
import { UNIT1_MESSAGES } from '../data/adaMessages'

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
    // Navigation
    pdaOpen:      false,
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

    // Unread counts per thread
    unread:      { ada: 0, reyes: 0, captain: 0, maint: 0 },

    // Track which lesson messages have been seeded (prevent duplicates on re-load)
    seededLessons: [],

    // Current active work order (set by triggerLessonLoad)
    currentTask: null,
  }
}

const usePdaStore = create(
  persist(
    (set, get) => ({
      ...defaultState(),

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
       * Seed messages from a lesson trigger.
       * Called by triggerLessonComplete. Reads UNIT1_MESSAGES (and future
       * unit message banks) and delivers any message whose trigger matches.
       */
      _seedMessagesForTrigger(trigger) {
        const band = rapportBand(get().rapport)
        const allMessages = [...UNIT1_MESSAGES]  // expand with UNIT2_MESSAGES etc. later

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

        // Seed messages
        get()._seedMessagesForTrigger(`lesson:${lessonId}`)

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
    }),
    {
      name:    'gatelab-pda',
      version: 1,
      // Migrate if schema changes
      migrate(persistedState, version) {
        if (version === 0) return { ...defaultState(), ...persistedState }
        return persistedState
      },
    }
  )
)

export default usePdaStore