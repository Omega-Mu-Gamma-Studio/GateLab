/**
 * progressStore.js
 *
 * Ported from Java-Chan's progressStore.js.
 * Tracks student progress, XP, and level.
 *
 * Phase 1: persists to localStorage via zustand/persist.
 * Phase 2: swap persist adapter for API-backed storage.
 *          The store interface stays IDENTICAL.
 *
 * localStorage key changed from 'javachan-progress' → 'gatelab-progress'
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function calculateLevel(xp) {
  // Simple level curve: every 100 XP = 1 level
  return Math.floor(xp / 100) + 1
}

function xpForNextLevel(level) {
  return level * 100
}

const useProgressStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────
      completedLessons: {},       // { "unit1-01": true, ... }
      lessonAttempts:   {},       // { "unit1-01": 3, ... }
      xp:               0,
      level:            1,
      lastVisited:      null,
      rewardsCollected: [],

      // ── Actions ────────────────────────────────────────────────────────

      completeLesson(lessonId, xpEarned = 50) {
        const state = get()
        if (state.completedLessons[lessonId]) return  // no double XP
        const newXP    = state.xp + xpEarned
        const newLevel = calculateLevel(newXP)
        set({
          completedLessons: { ...state.completedLessons, [lessonId]: true },
          xp: newXP,
          level: newLevel,
          lessonAttempts: { ...state.lessonAttempts, [lessonId]: 0 },
        })
      },

      recordAttempt(lessonId) {
        const state   = get()
        const current = state.lessonAttempts[lessonId] || 0
        set({ lessonAttempts: { ...state.lessonAttempts, [lessonId]: current + 1 } })
      },

      getAttempts(lessonId) {
        return get().lessonAttempts[lessonId] || 0
      },

      isCompleted(lessonId) {
        return !!get().completedLessons[lessonId]
      },

      setLastVisited(lessonId) {
        set({ lastVisited: lessonId })
      },

      collectReward(rewardId) {
        const state = get()
        if (!state.rewardsCollected.includes(rewardId)) {
          set({ rewardsCollected: [...state.rewardsCollected, rewardId] })
        }
      },

      hasReward(rewardId) {
        return get().rewardsCollected.includes(rewardId)
      },

      getXPToNextLevel() {
        const state = get()
        return xpForNextLevel(state.level) - state.xp
      },

      getLevelProgress() {
        const state        = get()
        const currentFloor = xpForNextLevel(state.level - 1)
        const nextCeiling  = xpForNextLevel(state.level)
        const range        = nextCeiling - currentFloor
        const progress     = state.xp - currentFloor
        return Math.min(100, Math.round((progress / range) * 100))
      },

      // Dev helpers
      devMaxLevel:   () => set({ xp: 9999, level: 100 }),
      devResetLevel: () => set({ xp: 0, level: 1 }),

      _resetForMigration: () => set({
        completedLessons: {}, lessonAttempts: {},
        xp: 0, level: 1, lastVisited: null, rewardsCollected: [],
      }),
    }),
    {
      name: 'gatelab-progress',  // renamed from javachan-progress
    }
  )
)

export default useProgressStore