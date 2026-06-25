import { create } from 'zustand'

// Units manifest — source of truth for Home + Sidebar
export const UNITS = [
  {
    id: 1,
    roman: 'I',
    title: 'Boolean Algebra & Logic Gates',
    sub: 'Gates, K-Maps, SOP/POS',
    description: 'From primitive AND/OR/NOT gates through NAND/NOR universality, Boolean laws, and K-Map simplification. The foundation everything else is built on.',
    lessons: 10,
    status: 'dev',
    // Which right-panel tabs are available in this unit
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
    description: 'SR, JK, D, T flip-flops with live timing diagrams that grow as you interact. State diagrams pulse on every clock edge. The ripple counter shows why ripple means ripple.',
    lessons: 9,
    status: 'dev',
    panels: ['timing', 'state', 'verilog'],
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Asynchronous Circuits',
    sub: 'Race Conditions & Hazards',
    description: 'Per-gate delay sliders, live glitch visualization, event-driven simulation with a timeline scrubber. Add the consensus term and watch the glitch disappear.',
    lessons: 6,
    status: 'dev',
    panels: ['timing', 'verilog'],
  },
  {
    id: 5,
    roman: 'V',
    title: 'Memory & Programmable Logic',
    sub: 'SRAM, ROM, PLA, PAL, Hamming',
    description: 'Memory grid visualizer, clickable PLA/PAL dot matrix, and Hamming code error injection. Inject a bit flip, watch the syndrome point at it, hit Correct.',
    lessons: 7,
    status: 'dev',
    panels: [],
  },
]

export const useLessonStore = create((set, get) => ({
  // null = on home page
  activeUnitId: null,
  activeLessonIdx: 0,
  // 'work' | 'break' | 'try'
  phase: 'work',

  goToUnit: (unitId) => set({ activeUnitId: unitId, activeLessonIdx: 0, phase: 'work' }),
  goHome: () => set({ activeUnitId: null, activeLessonIdx: 0, phase: 'work' }),
  goToLesson: (idx) => set({ activeLessonIdx: idx, phase: 'work' }),
  setPhase: (phase) => set({ phase }),

  activeUnit: () => UNITS.find(u => u.id === get().activeUnitId) || null,
}))