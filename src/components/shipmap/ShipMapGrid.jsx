/**
 * ShipMapGrid.jsx
 *
 * The actual map: a CSS Grid of real, focusable room elements (buttons/divs
 * with box-shadow glow, corner brackets, hover states — all real CSS, no
 * hand-drawn SVG shapes standing in for a room anymore) plus a thin
 * absolutely-positioned SVG layer *behind* the grid that draws just the
 * corridor pipes. The SVG's only job is geometry; every interactive bit
 * (click, hover, focus) lives on a real DOM element.
 *
 * Hover cards are a lightweight "what is this room" preview, separate from
 * the full dialogue line that appears on click/select — matching the ask:
 * hover for a quick peek, click to actually go there / talk to whoever's in it.
 */
import { useState, useRef } from 'react'
import { ROOMS, CORRIDORS, GRID_COLS, GRID_ROWS, VIEW_W, VIEW_H, nodeCenter, isRoomOpen } from './shipMapData'
import './ShipMapGrid.css'

export default function ShipMapGrid({ activeFlags, selectedId, onSelect, onEnterWorkstation }) {
  const [hoverId, setHoverId] = useState(null)
  const rootRef = useRef(null)

  const hoverRoom = ROOMS.find(r => r.id === hoverId) ?? null

  function handleClick(room, open) {
    if (room.isWork && open) {
      onEnterWorkstation(room)
      return
    }
    onSelect(room)
  }

  return (
    <div className="smg-root" ref={rootRef}>
      {/* Corridor pipes — pure geometry, no interactivity */}
      <svg
        className="smg-corridors"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {CORRIDORS.map(([a, b], i) => {
          const pa = nodeCenter(a)
          const pb = nodeCenter(b)
          return (
            <g key={i}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className="smg-corridor-base" />
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className="smg-corridor-line" />
            </g>
          )
        })}
      </svg>

      {/* Room grid — real elements */}
      <div
        className="smg-grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
      >
        {ROOMS.map(room => {
          const open = isRoomOpen(room, activeFlags)
          const isSel = selectedId === room.id
          return (
            <button
              key={room.id}
              type="button"
              className={`smg-room${open ? '' : ' is-locked'}${isSel ? ' is-selected' : ''}${room.isWork ? ' is-work' : ''}`}
              style={{
                gridColumn: room.col + 1,
                gridRow: room.row + 1,
                '--room-color': room.tint,
              }}
              onClick={() => handleClick(room, open)}
              onMouseEnter={() => setHoverId(room.id)}
              onMouseLeave={() => setHoverId(id => (id === room.id ? null : id))}
              onFocus={() => setHoverId(room.id)}
              onBlur={() => setHoverId(id => (id === room.id ? null : id))}
            >
              <span className="smg-corner smg-corner-tl" />
              <span className="smg-corner smg-corner-tr" />
              <span className="smg-corner smg-corner-bl" />
              <span className="smg-corner smg-corner-br" />

              {!open && <span className="smg-lock">⬡</span>}

              <span className="smg-label">{room.label}</span>
              <span className="smg-code">{room.deck} · {room.code}</span>

              {room.npc && open && (
                <span className="smg-npc" style={{ '--npc-color': room.npcColor }}>
                  <span className="smg-npc-dot" />
                  {room.npc}
                </span>
              )}

              {room.hasPda && open && (
                <span className="smg-pda-tag">PDA</span>
              )}

              {room.isWork && open && (
                <span className="smg-begin">▶ BEGIN SHIFT</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hover card — quick preview, independent of click-to-select */}
      {hoverRoom && (
        <div
          className="smg-hovercard"
          style={{
            '--hc-color': hoverRoom.tint,
            gridColumn: hoverRoom.col + 1,
            gridRow: hoverRoom.row + 1,
            left: `${((hoverRoom.col + 0.5) / GRID_COLS) * 100}%`,
            top: hoverRoom.row === 0
              ? `${((hoverRoom.row + 1) / GRID_ROWS) * 100}%`
              : `${(hoverRoom.row / GRID_ROWS) * 100}%`,
          }}
          data-flip={hoverRoom.row === 0 ? 'down' : 'up'}
        >
          <div className="smg-hovercard-head">
            <span className="smg-hovercard-title">{hoverRoom.label}</span>
            <span className="smg-hovercard-code">{hoverRoom.deck} · {hoverRoom.code}</span>
          </div>
          <div className="smg-hovercard-body">
            {isRoomOpen(hoverRoom, activeFlags)
              ? hoverRoom.dlg.txt
              : hoverRoom.denial}
          </div>
          {!isRoomOpen(hoverRoom, activeFlags) && (
            <div className="smg-hovercard-locked">ACCESS DENIED</div>
          )}
        </div>
      )}
    </div>
  )
}
