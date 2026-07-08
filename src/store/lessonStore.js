/**
 * lessonStore.js
 *
 * Navigation state: unit → lesson → phase.
 * On every navigation action, pushes the new phase snapshot into canvasStore.
 *
 * Circular import note: lessonStore imports canvasStore, and GateCanvas
 * imports both. Vite handles this fine because by the time any action is
 * called both modules are fully initialised. No lazy import needed.
 */
import { create } from 'zustand'
import { getLesson } from '../lessons/index'
import { useCanvasStore } from './canvasStore'
import usePdaStore from './pdaStore'
import useProgressStore from './progressStore'

export const UNITS = [
  {
    id: 1,
    roman: 'I',
    title: 'Boolean Algebra & Logic Gates',
    sub: 'Gates, K-Maps, SOP/POS',
    description: 'From primitive AND/OR/NOT gates through NAND/NOR universality, Boolean laws, and K-Map simplification. The foundation everything else is built on.',
    lessons: 10,
    status: 'dev',
    panels: [],
  },
  {
    id: 2,
    roman: 'II',
    title: 'Combinational Circuits',
    sub: 'Adders, MUX, Decoders, Comparators',
    description: 'Functional circuit blocks wired together. Block Mode shows black boxes; Expand Mode dissolves them to gate level. Carry propagation you can actually watch.',
    lessons: 9,
    status: 'dev',
    panels: ['verilog'],
  },
  {
    id: 3,
    roman: 'III',
    title: 'Sequential Circuits',
    sub: 'Flip-Flops, Latches, Counters',
    description: 'SR, JK, D, T flip-flops with live timing diagrams that grow as you interact. State diagrams pulse on every clock edge.',
    lessons: 9,
    status: 'dev',
    panels: ['timing', 'state', 'verilog'],
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Asynchronous Circuits',
    sub: 'Race Conditions & Hazards',
    description: 'Per-gate delay sliders, live glitch visualisation, event-driven simulation with a timeline scrubber.',
    lessons: 6,
    status: 'dev',
    panels: ['timing', 'verilog'],
  },
  {
    id: 5,
    roman: 'V',
    title: 'Memory & Programmable Logic',
    sub: 'SRAM, ROM, PLA, PAL, Hamming',
    description: 'Memory grid visualiser, clickable PLA/PAL dot matrix, and Hamming code error injection.',
    lessons: 7,
    status: 'dev',
    panels: ['memory', 'pla'],
  },
]

// Find the first lesson in a unit that hasn't been completed yet, so
// re-entering a unit (e.g. from the Ship Map workstation) resumes where
// the player left off instead of always restarting at lesson 0.
// Falls back to the last lesson in the unit if everything is complete.
function firstIncompleteLessonIdx(unitId) {
  const unit = UNITS.find(u => u.id === unitId)
  if (!unit) return 0
  const { completedLessons } = useProgressStore.getState()
  for (let i = 0; i < unit.lessons; i++) {
    const lesson = getLesson(unitId, i)
    const id = lesson?.meta?.id
    if (id && !completedLessons[id]) return i
  }
  return Math.max(0, unit.lessons - 1)
}

// Push a lesson phase into the canvas store.
// Called after every navigation action.
function syncCanvas(unitId, lessonIdx, phase) {
  const canvas = useCanvasStore.getState()
  const lesson = getLesson(unitId, lessonIdx)
  if (!lesson) { canvas.reset(); return }
  const phaseData = lesson.phases?.[phase]
  if (!phaseData) { canvas.reset(); return }
  canvas.loadPhase(phaseData, phase)

  // Sync lesson context to PDA
  const pda = usePdaStore.getState()
  if (phase === 'work') {
    // New lesson loaded — seed the full task
    pda.triggerLessonLoad(lesson.meta, lesson.narrative, phase)
  } else {
    // Phase shift only — update phase field
    pda.updateTaskPhase(phase)
  }
}

export const useLessonStore = create((set, get) => ({
  activeUnitId:    null,
  activeLessonIdx: 0,
  phase:           'work',
  narrative:       null,  // { briefing, fault, dispatch, success, lore } | null
  meta:            null,  // { workOrder, location, shift } | null

  // idx is optional — pass it to jump to a specific lesson (e.g. from the
  // Journal / dev tools). Left undefined, it resumes at the player's first
  // incomplete lesson in that unit instead of always restarting at 0.
  goToUnit(unitId, idx) {
    const startIdx = idx ?? firstIncompleteLessonIdx(unitId)
    const lesson = getLesson(unitId, startIdx)
    set({
      activeUnitId: unitId,
      activeLessonIdx: startIdx,
      phase: 'work',
      narrative: lesson?.narrative || null,
      meta: lesson?.meta || null,
    })
    syncCanvas(unitId, startIdx, 'work')
  },

  goHome() {
    set({ activeUnitId: null, activeLessonIdx: 0, phase: 'work', narrative: null, meta: null })
    useCanvasStore.getState().reset()
  },

  goToLesson(idx) {
    const { activeUnitId } = get()
    const lesson = getLesson(activeUnitId, idx)
    set({
      activeLessonIdx: idx,
      phase: 'work',
      narrative: lesson?.narrative || null,
      meta: lesson?.meta || null,
    })
    syncCanvas(activeUnitId, idx, 'work')
  },

  setPhase(phase) {
    const { activeUnitId, activeLessonIdx } = get()
    set({ phase })
    syncCanvas(activeUnitId, activeLessonIdx, phase)
  },

  // Advance work → break → try. Called by WorkOrderBar "Next →" button.
  nextPhase() {
    const { phase, activeUnitId, activeLessonIdx } = get()
    const order = ['work', 'break', 'try']
    const idx = order.indexOf(phase)
    if (idx < order.length - 1) {
      const next = order[idx + 1]
      set({ phase: next })
      syncCanvas(activeUnitId, activeLessonIdx, next)
    }
  },

  // Advance to the next lesson (wraps to first in unit when exhausted).
  nextLesson() {
    const { activeUnitId, activeLessonIdx } = get()
    const unit = UNITS.find(u => u.id === activeUnitId)
    if (!unit) return
    const nextIdx = activeLessonIdx + 1 < unit.lessons ? activeLessonIdx + 1 : 0
    const lesson = getLesson(activeUnitId, nextIdx)
    set({
      activeLessonIdx: nextIdx,
      phase: 'work',
      narrative: lesson?.narrative || null,
      meta: lesson?.meta || null,
    })
    syncCanvas(activeUnitId, nextIdx, 'work')
    // Reset solved state
    useCanvasStore.getState().clearSolved()
  },

  activeUnit: () => UNITS.find(u => u.id === get().activeUnitId) || null,
}))