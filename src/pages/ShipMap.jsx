/**
 * ShipMap.jsx
 *
 * Story Mode navigation hub — the full-page version of the AETHER-9 deck
 * schematic. Renders either the ShipMapGrid (also used by the fullscreen
 * "press M" overlay, see components/shipmap/ShipMapOverlay.jsx) or, once a
 * room is selected, a full LocationScene — never both. `activeScene` in
 * pdaStore drives this, so the page and the overlay are always in sync.
 *
 * The grid/corridor rendering itself lives in components/shipmap/ — this
 * file just wires it up to the page's own state (dev flags) and the
 * surrounding chrome (header).
 */

import { useState } from 'react'
import { useLessonStore } from '../store/lessonStore'
import usePdaStore from '../store/pdaStore'
import ShipMapGrid from '../components/shipmap/ShipMapGrid'
import LocationScene from '../components/shipmap/LocationScene'
import { ROOMS, DEV_FLAGS, safeEnterWorkstation } from '../components/shipmap/shipMapData'

// ── Component ────────────────────────────────────────────────────────────────

export default function ShipMap() {
  const { goToUnit, activeUnitId } = useLessonStore()
  const storyFlags = usePdaStore(s => s.storyFlags)
  const activeScene = usePdaStore(s => s.activeScene)
  const openScene = usePdaStore(s => s.openScene)
  const closeScene = usePdaStore(s => s.closeScene)
  const openPda = usePdaStore(s => s.openPda)

  // Dev flag overrides — only visible/useful in dev builds
  const [devFlags, setDevFlags] = useState(new Set())

  // Combine real story flags + dev overrides
  const activeFlags = { ...storyFlags }
  for (const f of devFlags) activeFlags[f] = true

  // Determine which unit the workstation should send the player to.
  const targetUnit = activeUnitId ?? 1
  const resuming = activeUnitId === targetUnit

  const sceneRoom = ROOMS.find(r => r.id === activeScene) ?? null

  function toggleDevFlag(f) {
    setDevFlags(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '80px 24px 40px',
      background: 'var(--bg)', fontFamily: 'var(--mono)',
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: '3px' }}>
              AETHER-9 · DECK SCHEMATIC
            </div>
            <div style={{ fontSize: '16px', letterSpacing: '0.18em', fontWeight: 500, color: 'var(--text-h)' }}>
              SHIP MAP
            </div>
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.7 }}>
            SHIFT END · STAND-DOWN<br />SELECT DESTINATION
          </div>
        </div>

        <div style={{ height: '0.5px', background: 'var(--border-strong)', marginBottom: '12px' }} />

        {sceneRoom ? (
          <LocationScene
            room={sceneRoom}
            activeFlags={activeFlags}
            onBack={closeScene}
            resuming={resuming}
            onOpenPda={() => openPda()}
            onBeginShift={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, closeScene)}
          />
        ) : (
          <ShipMapGrid
            activeFlags={activeFlags}
            onSelectScene={openScene}
            onEnterWorkstation={() => safeEnterWorkstation(goToUnit, activeUnitId, targetUnit, () => {})}
          />
        )}

        {/* Dev flag toggles — only render in dev */}
        {import.meta.env.DEV && (
          <>
            <div style={{ fontSize: '8px', letterSpacing: '0.2em', color: 'var(--text-muted)', margin: '12px 0 6px' }}>
              POC — UNLOCK FLAGS (dev)
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DEV_FLAGS.map(f => {
                const active = devFlags.has(f)
                return (
                  <button
                    key={f}
                    onClick={() => toggleDevFlag(f)}
                    style={{
                      background: active ? '#0a1e30' : 'transparent',
                      border: `0.5px solid ${active ? '#2a6fa8' : 'var(--border-strong)'}`,
                      color: active ? '#3fa8d8' : 'var(--text-muted)',
                      padding: '3px 10px', fontSize: '8px', letterSpacing: '0.1em',
                      cursor: 'pointer', borderRadius: '4px',
                      fontFamily: 'var(--mono)', transition: 'all 0.15s',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
