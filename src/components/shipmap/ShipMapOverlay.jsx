/**
 * ShipMapOverlay.jsx
 *
 * The fullscreen "press M" map. Always mounted (see App.jsx), self-hides
 * when mapOpen is false — same pattern as PDA.jsx. Lets the player check
 * the Ship Map mid-lesson without losing their place in the Workspace.
 *
 * Genuinely fills the whole viewport — no centered/padded modal box.
 * Header info and the close button are floating HUD overlays, same
 * pattern as the full ShipMap page, so the grid/scene underneath gets
 * the entire screen instead of a boxed-in chunk of it.
 *
 * Renders either the grid or a LocationScene, exactly like the full
 * ShipMap page — `activeScene` lives in pdaStore, so the page and this
 * overlay are always in sync and can never show a scene at the same time.
 *
 * This is the path where "just peeking mid-lesson" actually happens, so
 * entering the Workstation here goes through safeEnterWorkstation(): if
 * you're already in the target unit, it just closes the map instead of
 * re-firing goToUnit() and silently resetting your current lesson's phase.
 */
import { useEffect } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import usePdaStore, { rapportBand } from '../../store/pdaStore'
import ShipMapGrid from './ShipMapGrid'
import LocationScene from './LocationScene'
import { ROOMS, safeEnterWorkstation } from './shipMapData'

export default function ShipMapOverlay() {
  const { goToUnit, activeUnitId } = useLessonStore()
  const storyMode = usePdaStore(s => s.storyMode)
  const mapOpen = usePdaStore(s => s.mapOpen)
  const closeMap = usePdaStore(s => s.closeMap)
  const storyFlags = usePdaStore(s => s.storyFlags)
  const rapport = usePdaStore(s => s.rapport)
  const roomVisits = usePdaStore(s => s.roomVisits)
  const pdaOpen = usePdaStore(s => s.pdaOpen)
  const activeScene = usePdaStore(s => s.activeScene)
  const openScene = usePdaStore(s => s.openScene)
  const closeScene = usePdaStore(s => s.closeScene)
  const openPda = usePdaStore(s => s.openPda)

  const targetUnit = activeUnitId ?? 1
  const resuming = activeUnitId === targetUnit

  const sceneRoom = ROOMS.find(r => r.id === activeScene) ?? null

  // "M" toggles the map — only in Story Mode, only while inside a lesson
  // (the full ShipMap page already covers the "outside a lesson" case),
  // and never while typing in a field or with the PDA already open.
  useEffect(() => {
    if (storyMode !== true || activeUnitId === null) return
    function handler(e) {
      if (e.key !== 'm' && e.key !== 'M') return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (pdaOpen) return
      e.preventDefault()
      usePdaStore.getState().toggleMap()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [storyMode, activeUnitId, pdaOpen])

  // Escape closes it
  useEffect(() => {
    if (!mapOpen) return
    function handler(e) { if (e.key === 'Escape') closeMap() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mapOpen, closeMap])

  if (!mapOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: '#03060b',
      fontFamily: 'var(--mono)',
      overflow: 'hidden',
    }}>
      {sceneRoom ? (
        <LocationScene
          room={sceneRoom}
          activeFlags={storyFlags}
          onBack={closeScene}
          resuming={resuming}
          onOpenPda={() => { closeMap(); openPda() }}
          onBeginShift={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, () => {
            closeScene()
            closeMap()
          })}
          rapportBand={rapportBand(rapport)}
          visits={roomVisits[sceneRoom.id] || 0}
        />
      ) : (
        <ShipMapGrid
          activeFlags={storyFlags}
          onSelectScene={openScene}
          onEnterWorkstation={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, closeMap)}
        />
      )}

      {/* Header — HUD overlay, doesn't shrink the map's screen real estate */}
      <div style={{
        position: 'absolute', top: '20px', left: '24px', right: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        pointerEvents: 'none', zIndex: 3,
      }}>
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#3a5468', marginBottom: '3px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            AETHER-9 · DECK SCHEMATIC · LIVE OVERLAY
          </div>
          <div style={{ fontSize: '17px', letterSpacing: '0.18em', fontWeight: 500, color: '#eaf4fb', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            SHIP MAP
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'auto' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#3a5468', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            ESC or M to close
          </span>
          <button
            onClick={closeMap}
            title="Close map"
            style={{
              width: '30px', height: '30px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(5,13,24,0.6)',
              color: '#8fb4cc', cursor: 'pointer', fontSize: '14px', lineHeight: 1,
              backdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
