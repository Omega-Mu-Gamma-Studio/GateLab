/**
 * ShipMap.jsx
 *
 * Story Mode navigation hub — the full-page version of the AETHER-9 deck
 * schematic. Fills the entire viewport below the TopBar edge-to-edge, no
 * centered/padded column — the grid (or, once a room is selected, a full
 * LocationScene) IS the page. Header info and dev-flag toggles are
 * floating HUD overlays on top of the map, not stacked content that
 * shrinks how much of the screen the map itself gets.
 *
 * Renders either the grid or a LocationScene, never both — `activeScene`
 * in pdaStore drives this, so the page and the "press M" overlay
 * (ShipMapOverlay.jsx) are always in sync. When a scene is showing, the
 * page's own header is hidden — LocationScene already has its own
 * heading + back button, so there's no need for two.
 */

import { useLessonStore } from '../store/lessonStore'
import usePdaStore, { rapportBand } from '../store/pdaStore'
import ShipMapGrid from '../components/shipmap/ShipMapGrid'
import LocationScene from '../components/shipmap/LocationScene'
import { ROOMS, safeEnterWorkstation } from '../components/shipmap/shipMapData'

// Must match App.jsx's TOPBAR_H (not exported from there, so kept in sync
// by hand — same approach App.jsx already uses in a couple of places).
const TOPBAR_H = '5vh'

// ── Component ────────────────────────────────────────────────────────────────

export default function ShipMap() {
  const { goToUnit, activeUnitId } = useLessonStore()
  const storyFlags = usePdaStore(s => s.storyFlags)
  const rapport = usePdaStore(s => s.rapport)
  const roomVisits = usePdaStore(s => s.roomVisits)
  const activeScene = usePdaStore(s => s.activeScene)
  const openScene = usePdaStore(s => s.openScene)
  const closeScene = usePdaStore(s => s.closeScene)
  const openPda = usePdaStore(s => s.openPda)

  // Dev-mode story-state overrides now live in the global DevCheatPanel
  // (see src/components/dev/DevCheatPanel.jsx) — it writes directly to
  // storyFlags/rapport/roomVisits in pdaStore, so this page just reads
  // the real state and needs no local override merging anymore.
  const activeFlags = storyFlags

  // Determine which unit the workstation should send the player to.
  const targetUnit = activeUnitId ?? 1
  const resuming = activeUnitId === targetUnit

  const sceneRoom = ROOMS.find(r => r.id === activeScene) ?? null

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: `calc(100vh - ${TOPBAR_H})`,
      overflow: 'hidden',
      background: 'var(--bg)',
      fontFamily: 'var(--mono)',
    }}>
      {sceneRoom ? (
        <LocationScene
          room={sceneRoom}
          activeFlags={activeFlags}
          onBack={closeScene}
          resuming={resuming}
          onOpenPda={() => openPda()}
          onBeginShift={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, closeScene)}
          rapportBand={rapportBand(rapport)}
          visits={roomVisits[sceneRoom.id] || 0}
        />
      ) : (
        <>
          <ShipMapGrid
            activeFlags={activeFlags}
            onSelectScene={openScene}
            onEnterWorkstation={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, () => {})}
          />

          {/* Header — HUD overlay, doesn't reserve dedicated page space */}
          <div style={{
            position: 'absolute', top: '20px', left: '24px', right: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            pointerEvents: 'none', zIndex: 3,
          }}>
            <div>
              <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: '3px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                AETHER-9 · DECK SCHEMATIC
              </div>
              <div style={{ fontSize: '16px', letterSpacing: '0.18em', fontWeight: 500, color: 'var(--text-h)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                SHIP MAP
              </div>
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.7, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              SHIFT END · STAND-DOWN<br />SELECT DESTINATION
            </div>
          </div>
        </>
      )}
    </div>
  )
}
