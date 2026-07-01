/**
 * ShipMap.jsx
 *
 * Story Mode navigation hub. A top-down schematic of the AETHER-9 with
 * clickable room hotspots. Locked rooms show denial dialogue; open rooms
 * show NPC lines. The WORKSTATION room hands off into the existing lesson
 * engine via goToUnit().
 *
 * Architecture notes:
 *  - Reads storyFlags from pdaStore to determine which rooms are unlocked.
 *  - Calls goToUnit(currentUnit) when the player enters the Workstation.
 *  - SVG is drawn imperatively in a useEffect so the rendering logic stays
 *    close to the original PoC — easy to iterate without JSX sprawl.
 *  - Dev flag toggles are visible in development builds only.
 */

import { useEffect, useRef, useState } from 'react'
import { useLessonStore } from '../store/lessonStore'
import usePdaStore from '../store/pdaStore'

// ── Room data ────────────────────────────────────────────────────────────────

// `art.tint` drives the CSS placeholder background shown for a room until
// real art exists. `art.bgImage` is the override slot — drop a path in
// (e.g. '/assets/rooms/quarters.jpg') and RoomArtPanel switches straight
// from the generated placeholder to that static image, no other changes
// needed. Leave it null to keep using the placeholder.
const ROOMS = [
  {
    id: 'quarters',    label: 'YOUR QUARTERS',  code: 'A-07', deck: 'DECK 7',
    x: 10,  y: 110, w: 105, h: 90,
    alwaysOpen: true,  unlockFlag: null,
    npc: null,         npcColor: null,   isWork: false,
    denial: null,
    dlg: { sp: '[ ambient ]', txt: 'Your bunk. The PDA glows on the desk. The hull hums beneath the floor.' },
    art: { tint: '#3fa8d8', bgImage: null },
    hasPda: true,
  },
  {
    id: 'mess',        label: 'MESS HALL',       code: 'B-01', deck: 'DECK 7',
    x: 135, y: 25,  w: 105, h: 90,
    alwaysOpen: true,  unlockFlag: null,
    npc: 'Ada',        npcColor: '#d05858', isWork: false,
    denial: null,
    dlg: { sp: 'Ada', txt: "You're early. Or late. I can never tell with you. Sit — I'll grab your ration." },
    art: { tint: '#d05858', bgImage: null },
  },
  {
    id: 'engine',      label: 'ENGINE ROOM',     code: 'E-01', deck: 'DECK 4',
    x: 135, y: 195, w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit2_l9',
    npc: 'Reyes',      npcColor: '#c07028', isWork: false,
    denial: "Reyes has the room sealed for a maintenance sweep. The door doesn't budge.",
    dlg: { sp: 'Reyes', txt: "You're not supposed to be down here. But since you are — suit up." },
    art: { tint: '#c07028', bgImage: null },
  },
  {
    id: 'obs_deck',    label: 'OBS. DECK',       code: 'C-01', deck: 'DECK 7',
    x: 260, y: 25,  w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit1_l1',
    npc: 'Ada',        npcColor: '#d05858', isWork: false,
    denial: 'The Observation Deck is closed for maintenance. Try again after your first shift.',
    dlg: { sp: 'Ada', txt: 'The Veil Nebula is visible on clear cycles. I used to come up here with... well. It\'s a good view.' },
    art: { tint: '#6f8fd8', bgImage: null },
  },
  {
    id: 'hydro',       label: 'HYDRO-POOL',      code: 'D-03', deck: 'DECK 6',
    x: 260, y: 195, w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit2_l1',
    npc: 'Ada',        npcColor: '#d05858', isWork: false,
    denial: 'The Hydro-Pool is on a scheduled maintenance cycle. Check back after your next shift.',
    dlg: { sp: 'Ada', txt: "Don't look so surprised. Even mechanics get shore leave. The water's warm — for now." },
    art: { tint: '#2ea88a', bgImage: null },
  },
  {
    id: 'workstation', label: 'WORKSTATION',     code: 'B-02', deck: 'DECK 7',
    x: 385, y: 110, w: 105, h: 90,
    alwaysOpen: true,  unlockFlag: null,
    npc: null,         npcColor: null,   isWork: true,
    denial: null,
    dlg: { sp: 'MAINT-SYS', txt: 'TERMINAL ACTIVE — WORK ORDER QUEUE: 1 PENDING — AUTHENTICATE TO BEGIN SHIFT.' },
    art: { tint: '#40a860', bgImage: null },
  },
  {
    id: 'ada_quarters', label: "ADA'S QUARTERS", code: 'A-12', deck: 'DECK 7',
    x: 510, y: 25,  w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit3_l1',
    npc: 'Ada',        npcColor: '#d05858', isWork: false,
    denial: "Ada's door is shut. You can hear music from inside. Probably best not to interrupt.",
    dlg: { sp: 'Ada', txt: "...I wasn't expecting anyone. Come in. Mind the books — I keep meaning to sort them." },
    art: { tint: '#d05858', bgImage: null },
  },
  {
    id: 'lounge',      label: 'LOUNGE',          code: 'C-02', deck: 'DECK 7',
    x: 510, y: 195, w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit3_l1',
    npc: 'Ada',        npcColor: '#d05858', isWork: false,
    denial: 'The Lounge is closed for a private crew event.',
    dlg: { sp: 'Ada', txt: "Game night. You in? Reyes keeps winning and it's starting to feel personal." },
    art: { tint: '#9868c0', bgImage: null },
  },
  {
    id: 'bridge',      label: 'BRIDGE',          code: 'α-01', deck: 'COMMAND',
    x: 635, y: 25,  w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit4_l6',
    npc: 'Voss',       npcColor: '#9080cc', isWork: false,
    denial: 'The Bridge is a restricted area. Captain Voss is not accepting visitors.',
    dlg: { sp: 'Voss', txt: "I've been watching your work orders, Mechanic. Sit down. We need to talk about Sub-Level 3." },
    art: { tint: '#9080cc', bgImage: null },
  },
  {
    id: 'maint_bay',   label: 'MAINT. BAY',      code: 'F-01', deck: 'DECK 4',
    x: 635, y: 195, w: 105, h: 90,
    alwaysOpen: false, unlockFlag: 'unit4_l6',
    npc: 'MAINT-SYS',  npcColor: '#40a860', isWork: false,
    denial: 'The Maintenance Bay is locked down for a diagnostic cycle.',
    dlg: { sp: 'MAINT-SYS', txt: 'DIAGNOSTIC COMPLETE — INTEGRITY: 94.7% — ANOMALY LOGGED: SUB-LEVEL 3 — CLASSIFICATION: [REDACTED]' },
    art: { tint: '#40a860', bgImage: null },
  },
]

const CORRIDORS = [
  ['quarters',    'mess'],
  ['quarters',    'engine'],
  ['mess',        'obs_deck'],
  ['obs_deck',    'ada_quarters'],
  ['ada_quarters','bridge'],
  ['engine',      'hydro'],
  ['hydro',       'lounge'],
  ['lounge',      'maint_bay'],
  ['bridge',      'maint_bay'],
  ['mess',        'workstation'],
  ['engine',      'workstation'],
  ['obs_deck',    'workstation'],
  ['hydro',       'workstation'],
  ['workstation', 'ada_quarters'],
  ['workstation', 'lounge'],
]

// speaker → colour mapping for the dialogue box
const SP_COLORS = {
  'Ada':         '#d05858',
  'Reyes':       '#c07028',
  'Voss':        '#9080cc',
  'MAINT-SYS':   '#40a860',
  '[ ambient ]': '#3fa8d8',
  '[ SYSTEM ]':  '#1a3050',
}

const DEV_FLAGS = ['unit1_l1', 'unit2_l1', 'unit2_l9', 'unit3_l1', 'unit4_l6']

// ── SVG helpers ──────────────────────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg'
function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(SVG_NS, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  return e
}
function svgTxt(content, attrs = {}) {
  const e = svgEl('text', attrs)
  e.textContent = content
  return e
}

const cx = r => r.x + r.w / 2
const cy = r => r.y + r.h / 2

// ── Colours (match the dark ship aesthetic, agnostic of the app theme) ───────
const C = {
  bg:           '#050d18',
  roomBg:       '#080f1c',
  roomSel:      '#0d1f32',
  corridor:     '#0b1928',
  corridorLine: '#102233',
  dim:          '#162636',
  accent:       '#3fa8d8',
  lockedDim:    '#0d1c28',
  mono:         "'Courier New', monospace",
}

// ── Room art panel ───────────────────────────────────────────────────────────
// Placeholder-first, override-ready. Until real background stills exist for
// a room, this renders a generated CSS "viewport" tinted per-room so each
// space still reads as a distinct place. The moment `room.art.bgImage` is
// filled in with a real asset path, this same panel swaps straight to the
// static image — no separate "real room" component to build later.
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

  const { tint, bgImage } = room.art
  const hasImage = !!bgImage

  return (
    <div style={{
      position: 'relative', height: '150px', borderRadius: '6px', marginBottom: '10px',
      overflow: 'hidden', border: '0.5px solid var(--border)',
      // Placeholder mode: layered radial/linear tint gradients standing in
      // for a still. Override mode: the real image, cover-fit.
      background: hasImage
        ? `center / cover no-repeat url(${bgImage})`
        : `radial-gradient(ellipse at 30% 20%, ${tint}2e 0%, transparent 55%),
           linear-gradient(165deg, ${tint}22 0%, #050d18 65%)`,
      filter: open ? 'none' : 'grayscale(0.6) brightness(0.5)',
      transition: 'filter 0.2s',
    }}>
      {/* Faint scanline texture — only in placeholder mode, sells "no art yet"
          without looking broken. Removed automatically once bgImage is set. */}
      {!hasImage && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Vignette so HUD text stays legible in both modes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(2,6,12,0.55) 0%, rgba(2,6,12,0.05) 30%, rgba(2,6,12,0.05) 65%, rgba(2,6,12,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* HUD label, top-left */}
      <div style={{ position: 'absolute', top: '10px', left: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#eaf4fb', fontFamily: C.mono, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {room.label}
        </div>
        <div style={{ fontSize: '7.5px', letterSpacing: '0.15em', color: '#a8c8dc', fontFamily: C.mono, opacity: 0.8 }}>
          {room.deck} · {room.code}
        </div>
      </div>

      {/* Placeholder tag, top-right — disappears once bgImage is set */}
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
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#7a8a9a', fontFamily: C.mono }}>
            ACCESS DENIED
          </span>
        </div>
      )}

      {/* The PDA is the whole point of Quarters — make it unmissable. */}
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
  const svgRef = useRef(null)

  // Combine real story flags + dev overrides
  const activeFlags = { ...storyFlags }
  for (const f of devFlags) activeFlags[f] = true

  const isOpen = (room) => room.alwaysOpen || !!activeFlags[room.unlockFlag]

  // Determine which unit the workstation should send the player to.
  // Defaults to unit 1 if no unit is active yet.
  const targetUnit = activeUnitId ?? 1

  // ── SVG render ────────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.innerHTML = ''

    const roomById = Object.fromEntries(ROOMS.map(r => [r.id, r]))

    // Defs — hatch pattern for locked rooms
    const defs = svgEl('defs')
    const hatch = svgEl('pattern', { id: 'hatch', x: 0, y: 0, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' })
    const hline = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#0a1825', 'stroke-width': 2 })
    hatch.appendChild(hline)
    defs.appendChild(hatch)
    svg.appendChild(defs)

    // Background
    svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 755, height: 310, rx: 6, fill: C.bg }))

    // Grid lines
    for (let i = 0; i < 24; i++)
      svg.appendChild(svgEl('line', { x1: i * 32, y1: 0, x2: i * 32, y2: 310, stroke: '#060d16', 'stroke-width': 1 }))
    for (let i = 0; i < 10; i++)
      svg.appendChild(svgEl('line', { x1: 0, y1: i * 32, x2: 755, y2: i * 32, stroke: '#060d16', 'stroke-width': 1 }))

    // Border dash
    svg.appendChild(svgEl('rect', { x: 4, y: 4, width: 747, height: 302, rx: 5, fill: 'none', stroke: '#0e2035', 'stroke-width': 1, 'stroke-dasharray': '8 4' }))

    // Corridors
    for (const [a, b] of CORRIDORS) {
      const ra = roomById[a], rb = roomById[b]
      svg.appendChild(svgEl('line', { x1: cx(ra), y1: cy(ra), x2: cx(rb), y2: cy(rb), stroke: C.corridor, 'stroke-width': 16 }))
      svg.appendChild(svgEl('line', { x1: cx(ra), y1: cy(ra), x2: cx(rb), y2: cy(rb), stroke: C.corridorLine, 'stroke-width': 1, 'stroke-dasharray': '4 5', 'stroke-linecap': 'round' }))
    }

    // Rooms
    for (const room of ROOMS) {
      const open = isOpen(room)
      const isSel = selected?.id === room.id

      const g = svgEl('g')
      g.style.cursor = 'pointer'

      g.appendChild(svgEl('rect', {
        x: room.x, y: room.y, width: room.w, height: room.h, rx: 3,
        fill: isSel ? C.roomSel : C.roomBg,
        stroke: isSel ? C.accent : C.dim,
        'stroke-width': isSel ? 1.5 : 1,
      }))

      if (!open) {
        g.appendChild(svgEl('rect', { x: room.x, y: room.y, width: room.w, height: room.h, rx: 3, fill: 'url(#hatch)' }))
        g.appendChild(svgEl('rect', { x: room.x, y: room.y, width: room.w, height: room.h, rx: 3, fill: '#00000040' }))
      }

      g.appendChild(svgTxt(room.label, {
        x: cx(room), y: room.y + 22, 'text-anchor': 'middle',
        'font-size': 7.5, 'letter-spacing': 1.2, 'font-weight': 'bold',
        fill: open ? (isSel ? C.accent : '#4a88a8') : '#122230',
        'font-family': C.mono,
      }))

      g.appendChild(svgTxt(`${room.deck} · ${room.code}`, {
        x: cx(room), y: room.y + 35, 'text-anchor': 'middle',
        'font-size': 7, 'letter-spacing': 0.8,
        fill: open ? '#1a3a55' : '#0b1820',
        'font-family': C.mono,
      }))

      if (room.npc && open) {
        g.appendChild(svgEl('circle', { cx: cx(room), cy: room.y + 55, r: 4, fill: C.bg, stroke: room.npcColor, 'stroke-width': 1.2 }))
        g.appendChild(svgTxt(room.npc, {
          x: cx(room), y: room.y + 70, 'text-anchor': 'middle',
          'font-size': 7.5, 'letter-spacing': 0.8,
          fill: room.npcColor, opacity: 0.9,
          'font-family': C.mono,
        }))
      }

      if (room.isWork && open) {
        g.appendChild(svgEl('rect', { x: room.x + 18, y: room.y + 50, width: 69, height: 17, rx: 2, fill: '#07111c', stroke: '#1a3a55', 'stroke-width': 0.5 }))
        g.appendChild(svgTxt('▶  BEGIN SHIFT', {
          x: cx(room), y: room.y + 62, 'text-anchor': 'middle',
          'font-size': 7, 'letter-spacing': 1,
          fill: '#2a6090', 'font-family': C.mono,
        }))
      }

      if (!open) {
        g.appendChild(svgTxt('⬡', {
          x: room.x + room.w - 10, y: room.y + 13, 'text-anchor': 'middle',
          'font-size': 9, fill: '#0e1e2e', 'font-family': C.mono,
        }))
      }

      // Hover feedback
      g.addEventListener('mouseenter', () => {
        if (isSel) return
        const r = g.querySelector('rect')
        r.setAttribute('stroke', open ? '#245870' : '#162636')
      })
      g.addEventListener('mouseleave', () => {
        const r = g.querySelector('rect')
        r.setAttribute('stroke', selected?.id === room.id ? C.accent : C.dim)
        r.setAttribute('stroke-width', selected?.id === room.id ? '1.5' : '1')
      })
      g.addEventListener('click', () => {
        if (room.isWork && open) {
          goToUnit(targetUnit)
          return
        }
        setSelected(room)
      })

      svg.appendChild(g)
    }

    // Cardinal labels
    svg.appendChild(svgTxt('AFT',     { x: 18,  y: 16, 'font-size': 7, 'letter-spacing': 2, fill: '#0e2030', 'font-family': C.mono }))
    svg.appendChild(svgTxt('AETHER-9',{ x: 377, y: 16, 'text-anchor': 'middle', 'font-size': 7, 'letter-spacing': 3, fill: '#090f1a', 'font-family': C.mono }))
    svg.appendChild(svgTxt('FORE',    { x: 710, y: 16, 'font-size': 7, 'letter-spacing': 2, fill: '#0e2030', 'font-family': C.mono }))

    // Direction arrow
    const poly = svgEl('polygon', { points: '751,155 757,138 763,155 757,172', fill: C.dim, opacity: '0.5' })
    svg.appendChild(poly)

  }, [selected, activeFlags, targetUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dev flag toggler ─────────────────────────────────────────────────────
  function toggleDevFlag(f) {
    setDevFlags(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  // ── Dialogue box content ─────────────────────────────────────────────────
  function renderDialogue() {
    if (!selected) {
      return (
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#1a3050' }}>
          SELECT A ROOM TO PROCEED —
        </span>
      )
    }
    const open = isOpen(selected)
    const spLabel = open ? selected.dlg.sp : '[ SYSTEM ]'
    const bodyText = open ? selected.dlg.txt : selected.denial
    const spColor = SP_COLORS[spLabel] ?? C.accent

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '8px', letterSpacing: '0.2em', color: '#1e4060', fontFamily: 'var(--mono)' }}>
            {selected.deck} · {selected.code} · {selected.label}
          </span>
          {!open && (
            <span style={{ fontSize: '8px', letterSpacing: '0.15em', color: '#1a2d40', fontFamily: 'var(--mono)' }}>
              ACCESS DENIED
            </span>
          )}
        </div>
        <div style={{ height: '0.5px', background: '#0c1e30', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.1em',
            minWidth: '80px', paddingTop: '2px', color: spColor,
          }}>
            {spLabel}
          </span>
          <span style={{
            fontSize: '13px', lineHeight: 1.7, flex: 1,
            color: open ? '#7aaccc' : '#1e3a55',
            fontStyle: open ? 'normal' : 'italic',
          }}>
            {bodyText}
          </span>
        </div>
      </>
    )
  }

  // ── Layout ───────────────────────────────────────────────────────────────
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

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'var(--border-strong)', marginBottom: '12px' }} />

        {/* SVG Map */}
        <svg
          ref={svgRef}
          viewBox="0 0 755 310"
          style={{
            width: '100%', display: 'block',
            borderRadius: '6px', border: '0.5px solid var(--border)',
          }}
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
          {renderDialogue()}
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