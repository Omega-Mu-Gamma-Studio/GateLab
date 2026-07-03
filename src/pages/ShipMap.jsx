/**
 * ShipMap.jsx
 *
 * Story Mode navigation hub — the full-page version of the AETHER-9 deck
 * schematic. Renders the same ShipMapGrid used by the fullscreen "press M"
 * overlay (see components/shipmap/ShipMapOverlay.jsx), plus the room art
 * viewport and dev flag toggles that only make sense on the full page.
 *
 * The grid/corridor rendering itself lives in components/shipmap/ — this
 * file just wires it up to the page's own state (selected room, dev flags)
 * and the surrounding chrome (header, art panel, dialogue box).
 */

import { useState } from 'react'
import { useLessonStore } from '../store/lessonStore'
import usePdaStore from '../store/pdaStore'
import ShipMapGrid from '../components/shipmap/ShipMapGrid'
import RoomDialoguePanel from '../components/shipmap/RoomDialoguePanel'
import { DEV_FLAGS } from '../components/shipmap/shipMapData'

const C = { mono: "'Courier New', monospace" }

// ── Room art panel ───────────────────────────────────────────────────────────
// Placeholder-first, override-ready. Until real background stills exist for
// a room, this renders a generated CSS "viewport" tinted per-room so each
// space still reads as a distinct place. The moment a room gets a real
// `bgImage` asset path, this panel swaps straight to the static image —
// no separate "real room" component to build later.
function RoomArtPanel({ room, open, openPda }) {
  if (!room) {
    return (
      <div style={{
        height: '150px', borderRadius: '6px', marginBottom: '10px',
        border: '0.5px solid var(--border)',
        background: '#050d18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#162636', fontFamily: C.mono }}>
          NO FEED SELECTED
        </span>
      </div>
    )
  }

  const tint = room.tint
  const bgImage = room.bgImage ?? null
  const hasImage = !!bgImage

  return (
    <div style={{
      position: 'relative', height: '150px', borderRadius: '6px', marginBottom: '10px',
      overflow: 'hidden', border: '0.5px solid var(--border)',
      background: hasImage
        ? `center / cover no-repeat url(${bgImage})`
        : `radial-gradient(ellipse at 30% 20%, ${tint}2e 0%, transparent 55%),
           linear-gradient(165deg, ${tint}22 0%, #050d18 65%)`,
      filter: open ? 'none' : 'grayscale(0.6) brightness(0.5)',
      transition: 'filter 0.2s',
    }}>
      {!hasImage && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(2,6,12,0.55) 0%, rgba(2,6,12,0.05) 30%, rgba(2,6,12,0.05) 65%, rgba(2,6,12,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', top: '10px', left: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#eaf4fb', fontFamily: C.mono, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {room.label}
        </div>
        <div style={{ fontSize: '7.5px', letterSpacing: '0.15em', color: '#a8c8dc', fontFamily: C.mono, opacity: 0.8 }}>
          {room.deck} · {room.code}
        </div>
      </div>

      {!hasImage && (
        <div style={{
          position: 'absolute', top: '10px', right: '14px',
          fontSize: '7px', letterSpacing: '0.15em', color: '#3a5468',
          fontFamily: C.mono, border: '0.5px solid #16283a', borderRadius: '3px',
          padding: '2px 6px', background: 'rgba(5,13,24,0.5)',
        }}>
          NO VISUAL FEED — PLACEHOLDER
        </div>
      )}

      {!open && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#7a8a9a', fontFamily: C.mono }}>
            ACCESS DENIED
          </span>
        </div>
      )}

      {room.hasPda && open && (
        <button
          onClick={openPda}
          title="Open PDA"
          style={{
            position: 'absolute', bottom: '10px', right: '12px',
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 12px', borderRadius: '20px',
            background: 'rgba(10,4,5,0.72)', border: '1px solid rgba(255,77,94,0.55)',
            cursor: 'pointer', backdropFilter: 'blur(6px)',
            boxShadow: '0 0 18px rgba(255,77,94,0.28)',
            animation: 'pda-hotspot-pulse 2.2s ease-in-out infinite',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,94,0.95)'; e.currentTarget.style.background = 'rgba(255,77,94,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,77,94,0.55)'; e.currentTarget.style.background = 'rgba(10,4,5,0.72)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff4d5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <span style={{ fontSize: '8.5px', letterSpacing: '0.15em', color: '#ffb3ba', fontFamily: C.mono }}>
            OPEN PDA
          </span>
        </button>
      )}

      <style>{`
        @keyframes pda-hotspot-pulse {
          0%, 100% { box-shadow: 0 0 18px rgba(255,77,94,0.28); }
          50%      { box-shadow: 0 0 28px rgba(255,77,94,0.55); }
        }
      `}</style>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ShipMap() {
  const { goToUnit, activeUnitId } = useLessonStore()
  const storyFlags = usePdaStore(s => s.storyFlags)
  const openPda = usePdaStore(s => s.openPda)

  // Dev flag overrides — only visible/useful in dev builds
  const [devFlags, setDevFlags] = useState(new Set())
  const [selected, setSelected] = useState(null)

  // Combine real story flags + dev overrides
  const activeFlags = { ...storyFlags }
  for (const f of devFlags) activeFlags[f] = true

  const isOpen = (room) => room.alwaysOpen || !!activeFlags[room.unlockFlag]

  // Determine which unit the workstation should send the player to.
  const targetUnit = activeUnitId ?? 1

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

        <ShipMapGrid
          activeFlags={activeFlags}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          onEnterWorkstation={() => goToUnit(targetUnit)}
        />

        {/* Room art panel — placeholder viewport now, real stills later */}
        <div style={{ marginTop: '10px' }}>
          <RoomArtPanel
            room={selected}
            open={selected ? isOpen(selected) : true}
            openPda={openPda}
          />
        </div>

        {/* Dialogue box */}
        <div style={{
          minHeight: '88px',
          padding: '14px 18px',
          background: '#050d18',
          border: '0.5px solid var(--border)',
          borderRadius: '6px',
        }}>
          <RoomDialoguePanel room={selected} activeFlags={activeFlags} />
        </div>

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
