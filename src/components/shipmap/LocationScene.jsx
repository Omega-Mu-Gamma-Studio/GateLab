/**
 * LocationScene.jsx
 *
 * Full-screen "you are now standing in this room" scene. Replaces the old
 * grid + 150px art strip + dialogue box combo with one immersive screen:
 * background fills the frame, dialogue docks at the bottom, a small tab
 * gets you back to the map.
 *
 * Sealed-door variant: if the room is locked, this renders the same shell
 * but swaps in `sealedImage` and lets RoomDialoguePanel's own open/closed
 * branch surface the room's `denial` line — no separate locked-scene
 * component needed.
 *
 * LocationScene never imports useLessonStore or calls goToUnit itself.
 * onBeginShift is passed in by whoever mounted the scene (ShipMap.jsx or
 * ShipMapOverlay.jsx), and that caller decides — via safeEnterWorkstation —
 * whether it's actually safe to navigate. This keeps the "looking ≠ doing"
 * rule enforced at the boundary, not scattered through this component.
 */
import RoomDialoguePanel from './RoomDialoguePanel'
import { isRoomOpen } from './shipMapData'
import './LocationScene.css'

export default function LocationScene({ room, activeFlags, onBack, onBeginShift, resuming, onOpenPda }) {
  const open = isRoomOpen(room, activeFlags)
  const tint = room.tint
  // Sealed-door variant reuses the bgImage slot logic, just points at
  // sealedImage instead when the room is locked.
  const bgImage = open ? room.bgImage : room.sealedImage
  const hasImage = !!bgImage

  return (
    <div
      className="loc-scene"
      style={{
        '--room-color': tint,
        background: hasImage
          ? `center / cover no-repeat url(${bgImage})`
          : `radial-gradient(ellipse at 40% 25%, ${tint}33 0%, transparent 60%),
             linear-gradient(165deg, ${tint}22 0%, #050d18 70%)`,
      }}
    >
      {/* scanline texture, placeholder-only — swaps out the moment bgImage/sealedImage is set */}
      {!hasImage && <div className="loc-scene-scanlines" />}

      <div className="loc-scene-vignette" />

      {/* Back-to-map tab — always present, always in the same corner */}
      <button type="button" className="loc-scene-back" onClick={onBack}>
        ← MAP
      </button>

      {/* Room heading */}
      <div className="loc-scene-heading">
        <div className="loc-scene-label">{room.label}</div>
        <div className="loc-scene-code">{room.deck} · {room.code}</div>
      </div>

      {/* NPC tag, only if open and someone's actually here */}
      {open && room.npc && (
        <div className="loc-scene-npc" style={{ '--npc-color': room.npcColor }}>
          <span className="loc-scene-npc-dot" />
          {room.npc}
        </div>
      )}

      {!open && <div className="loc-scene-locked">ACCESS DENIED</div>}

      {/* PDA hotspot — carried over from the old RoomArtPanel, only Quarters has it */}
      {open && room.hasPda && (
        <button type="button" className="loc-scene-pda" onClick={onOpenPda} title="Open PDA">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff4d5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>OPEN PDA</span>
        </button>
      )}

      {/* Workstation gets one extra action; nobody else does */}
      {open && room.isWork && (
        <button type="button" className="loc-scene-begin" onClick={onBeginShift}>
          {resuming ? '▶ RESUME SHIFT' : '▶ BEGIN SHIFT'}
        </button>
      )}

      {/* Dialogue, docked bottom — same shared component as before */}
      <div className="loc-scene-dialogue">
        <RoomDialoguePanel room={room} activeFlags={activeFlags} />
      </div>
    </div>
  )
}
