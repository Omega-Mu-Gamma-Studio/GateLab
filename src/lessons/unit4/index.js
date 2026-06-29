/**
 * Unit IV lesson registry.
 * Asynchronous Circuits — Race Conditions, Hazards, and Delay Models.
 */
import asyncIntro       from './01-async-circuits-intro'
import raceConditions   from './02-race-conditions'
import staticHazards    from './03-static-hazards'
import dynamicHazards   from './04-dynamic-hazards'
import hazardElimination from './05-hazard-elimination'
import delayModel       from './06-delay-model'

const unit4Lessons = [
  asyncIntro,         // 00 — Async Circuits Intro (SR Latch)
  raceConditions,     // 01 — Race Conditions
  staticHazards,      // 02 — Static-1 Hazard
  dynamicHazards,     // 03 — Dynamic Hazards
  hazardElimination,  // 04 — Hazard Elimination (SOP Redesign)
  delayModel,         // 05 — Gate Delay Model
]

export default unit4Lessons