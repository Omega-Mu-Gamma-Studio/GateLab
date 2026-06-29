/**
 * Master lesson registry — maps unitId → lesson array.
 * Import this anywhere you need to resolve a lesson by (unitId, lessonIndex).
 */
import unit1 from './unit1/index'
import unit2 from './unit2/index'

const LESSONS = {
  1: unit1,
  2: unit2,
  3: [],
  4: [],
  5: [],
}

/**
 * getLesson(unitId, lessonIndex) → lesson object | null
 */
export function getLesson(unitId, lessonIndex) {
  return LESSONS[unitId]?.[lessonIndex] ?? null
}

export default LESSONS