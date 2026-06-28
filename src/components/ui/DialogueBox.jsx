/**
 * DialogueBox.jsx
 *
 * Floating, draggable dialogue card layered over the canvas — not a
 * docked row. Two reasons for the shift:
 *
 *   1. It frees up the canvas's permanently-reserved 20% of height —
 *      the card now only takes up space where it's actually placed,
 *      and only while there's something to say.
 *   2. It reads as "someone talking to you" rather than "a system log
 *      pinned to the UI chrome" — the speaker tab overlapping the top
 *      edge of the card is doing a lot of that work on its own.
 *
 * Two voices, mapped onto the existing phases:
 *   - ADA     (red)   — Work phase. A fellow mechanic with better
 *                        short-term memory than the player, who ends up
 *                        being the one who explains things. Real person,
 *                        no hidden twist — the amnesia is the player's,
 *                        not a mystery about her.
 *   - COMMAND (amber) — Break phase (incident alert) + Try phase
 *                        (dispatch order). Fixed *role*, variable
 *                        *speaker* — attributed per-lesson via
 *                        meta.commandSpeaker (engineer/captain/the ship's
 *                        own maintenance system), falling back to
 *                        'MAINT-SYS' when a lesson doesn't specify one.
 *
 * Draggable: press-drag anywhere on the header (tab + speaker line) to
 * reposition; release to drop. Position resets to the default anchor on
 * remount (e.g. switching lessons) rather than persisting — a wandering
 * card that resets per-lesson felt better than one that silently drifts
 * forever, but say the word if you'd rather it stuck.
 */
import { useState, useRef, useEffect } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'

const VOICES = {
  ada: {
    color: '#ff4d5e',
    glow: 'rgba(255,77,94,0.22)',
    name: 'ADA',
    role: 'Mechanic 2nd Class',
  },
  command: {
    color: '#f5c400',
    glow: 'rgba(245,196,0,0.22)',
    role: 'Command',
  },
}

const PHASE_LABEL = {
  work:  'Walking you through it',
  break: 'Incident Alert',
  try:   'Dispatch Order',
}

export default function DialogueBox() {
  const { phase, narrative, meta, activeUnitId, activeLessonIdx } = useLessonStore()
  const hint = useCanvasStore(s => s.hint)

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  // Reset position when the lesson changes, so the card doesn't end up
  // stranded somewhere odd on a fresh circuit.
  useEffect(() => { setPos({ x: 0, y: 0 }) }, [activeUnitId, activeLessonIdx, phase])

  if (!activeUnitId) return null

  let displayText = hint
  if (narrative) {
    if (phase === 'work'  && narrative.briefing) displayText = narrative.briefing
    if (phase === 'break' && narrative.fault)    displayText = narrative.fault
    if (phase === 'try'   && narrative.dispatch) displayText = narrative.dispatch
  }
  if (!displayText) return null

  const isAda = phase === 'work'
  const voice = isAda ? VOICES.ada : VOICES.command
  const speakerName = isAda ? VOICES.ada.name : (meta?.commandSpeaker || 'MAINT-SYS')

  function handlePointerDown(e) {
    const startX = e.clientX
    const startY = e.clientY
    const origin = { ...pos }
    dragRef.current = { startX, startY, origin }

    function onMove(ev) {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setPos({ x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy })
    }
    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '28px',
        width: 'min(65%, 640px)',
        minWidth: '300px',
        transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`,
        zIndex: 50,
      }}
    >
      {/* Speaker tab — overlaps the top edge of the card; also the drag handle */}
      <div
        onMouseDown={handlePointerDown}
        title="Drag to move"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '10px 10px 0 0',
          background: voice.color,
          color: '#0a0d0a',
          fontFamily: 'var(--mono)',
          fontWeight: 700,
          fontSize: '12px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginLeft: '20px',
          cursor: 'grab',
          userSelect: 'none',
          boxShadow: `0 -2px 14px ${voice.glow}`,
        }}
      >
        {speakerName}
        {isAda && (
          <span style={{ fontWeight: 500, fontSize: '10px', opacity: 0.75, textTransform: 'none' }}>
            · {voice.role}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{
        background: 'var(--surface-2)',
        border: `1px solid ${voice.color}`,
        borderRadius: '4px 14px 14px 14px',
        boxShadow: `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2)`,
        padding: '14px 20px 18px 20px',
        maxHeight: '34vh',
        overflowY: 'auto',
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.07em',
          textTransform: 'uppercase', color: voice.color, marginBottom: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        }}>
          <span>{PHASE_LABEL[phase]}</span>
          {meta?.workOrder && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, whiteSpace: 'nowrap' }}>
              {meta.workOrder}{meta.location ? ` · ${meta.location}` : ''}
            </span>
          )}
        </div>
        <p style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: 1.65,
          color: 'var(--text-h)',
        }}>
          {displayText}
        </p>
      </div>
    </div>
  )
}