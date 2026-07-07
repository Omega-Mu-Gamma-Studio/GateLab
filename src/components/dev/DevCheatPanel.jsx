/**
 * DevCheatPanel.jsx
 *
 * A single, real cheat tool for previewing free-roam story content — every
 * control here writes to the ACTUAL pdaStore (storyFlags / rapport /
 * roomVisits), not a local override. That matters: it means jumping to
 * "Unit 3" doesn't just change what ShipMap shows you, it also changes
 * what the PDA's messages/gallery reflect, since both read off the same
 * store. Whatever you see here is exactly what a real playthrough at that
 * story point would look like.
 *
 * Mounted once at the app root (see App.jsx) so it's available from any
 * page — Home, Story Mode, or mid-lesson.
 *
 * ── Opening it ────────────────────────────────────────────────────────
 * Two ways in, neither of which show up in the UI unless you know them:
 *   1. Tap/click the small invisible zone in the bottom-right corner of
 *      the screen 5 times within 2 seconds.
 *   2. Press Ctrl+Shift+G (desktop).
 * Deliberately NOT gated behind import.meta.env.DEV — this needs to work
 * on a real deployed build too, since that's usually where you're actually
 * checking whether art assets and dialogue are wired correctly.
 *
 * ── Flag inventory ────────────────────────────────────────────────────
 * Pulled by hand from every `flag:`/`flagGate:` reference across
 * shipMapData.js and adaMessages.js — if a new stage/message introduces a
 * new flag key, add it to UNIT_LESSON_FLAGS / UNIT_ENDINGS below so the
 * panel stays a complete map of everything the story reads.
 */

import { useEffect, useRef, useState } from 'react'
import usePdaStore, { rapportBand } from '../../store/pdaStore'
import { ROOMS } from '../shipmap/shipMapData'

// Every lesson-numbered flag a room stage or PDA message actually checks,
// grouped by unit. Order matches narrative order within the unit.
const UNIT_LESSON_FLAGS = {
  1: ['unit1_l1', 'unit1_l3', 'unit1_l5'],
  2: ['unit2_l1', 'unit2_l5', 'unit2_l9'],
  3: ['unit3_l1', 'unit3_l5', 'unit3_l9'],
  4: ['unit4_l1', 'unit4_l6'],
  5: ['unit5_l1'],
}

// The binary unit-ending choice for each unit. `options[0]` is treated as
// the "default" branch when a Jump-to-Unit preset needs to lock in a past
// unit's ending automatically.
const UNIT_ENDINGS = {
  1: { flag: 'unit1_ending', options: ['aligned', 'defiant'] },
  2: { flag: 'unit2_ending', options: ['confirmed', 'amended'] },
  3: { flag: 'unit3_ending', options: ['tell', 'wait'] },
  4: { flag: 'unit4_ending', options: ['protect', 'accurate'] },
  5: { flag: 'unit5_ending', options: ['need', 'matter'] },
}

const UNITS = [1, 2, 3, 4, 5]

// ── Secret trigger ───────────────────────────────────────────────────────
function useSecretTrigger(onOpen) {
  const tapsRef = useRef([])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpen])

  function registerTap() {
    const now = Date.now()
    tapsRef.current = [...tapsRef.current.filter(t => now - t < 2000), now]
    if (tapsRef.current.length >= 5) {
      tapsRef.current = []
      onOpen()
    }
  }

  return registerTap
}

// ── Small shared UI bits ─────────────────────────────────────────────────
function Btn({ active, onClick, children, tone = 'default' }) {
  const colors = {
    default: { on: '#3fa8d8', off: 'var(--text-muted)' },
    warm:    { on: '#d05858', off: 'var(--text-muted)' },
    cold:    { on: '#6699ff', off: 'var(--text-muted)' },
    danger:  { on: '#e05050', off: '#e05050' },
  }
  const c = colors[tone] || colors.default
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? c.on : 'rgba(255,255,255,0.15)'}`,
        color: active ? c.on : c.off,
        padding: '4px 9px',
        fontSize: '10px',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        borderRadius: '4px',
        fontFamily: 'var(--mono, monospace)',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '9px', letterSpacing: '0.18em', color: 'var(--text-muted, #8899aa)',
      marginBottom: '6px', marginTop: '14px', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────
export default function DevCheatPanel() {
  const [open, setOpen] = useState(false)

  const rapport      = usePdaStore(s => s.rapport)
  const storyFlags    = usePdaStore(s => s.storyFlags)
  const roomVisits     = usePdaStore(s => s.roomVisits)
  const setFlag        = usePdaStore(s => s.setFlag)
  const devSetRapport  = usePdaStore(s => s.devSetRapport)
  const devSetRoomVisits = usePdaStore(s => s.devSetRoomVisits)
  const devClearFlags  = usePdaStore(s => s.devClearFlags)
  const devReset        = usePdaStore(s => s.devReset)

  const registerTap = useSecretTrigger(() => setOpen(true))
  const band = rapportBand(rapport)

  function jumpToUnit(n) {
    devClearFlags()
    for (const u of UNITS) {
      if (u < n) {
        // Fully completed past unit: every lesson flag + default ending
        for (const f of UNIT_LESSON_FLAGS[u]) setFlag(f, true)
        const ending = UNIT_ENDINGS[u]
        if (ending) setFlag(ending.flag, ending.options[0])
      } else if (u === n) {
        // Currently in this unit: every lesson flag set (so all of the
        // unit's dialogue stages/moments are reachable), ending left
        // unset — that choice hasn't happened yet.
        for (const f of UNIT_LESSON_FLAGS[u]) setFlag(f, true)
      }
      // u > n: leave untouched (cleared already by devClearFlags)
    }
  }

  function toggleFlag(key) {
    setFlag(key, !storyFlags[key])
  }

  function setEnding(unit, value) {
    const ending = UNIT_ENDINGS[unit]
    const current = storyFlags[ending.flag]
    setFlag(ending.flag, current === value ? undefined : value)
  }

  return (
    <>
      {/* Invisible 5-tap corner trigger — always present, never rendered
          visibly. Sized generously (56px) so it's findable on mobile
          without being anywhere near "discoverable" by accident. */}
      <div
        onClick={registerTap}
        style={{
          position: 'fixed', bottom: 0, right: 0, width: '56px', height: '56px',
          zIndex: 9998, background: 'transparent', cursor: 'default',
        }}
      />

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(4,8,14,0.88)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono, monospace)',
        }}>
          <div style={{
            width: 'min(720px, 92vw)', maxHeight: '86vh', overflowY: 'auto',
            background: '#0a1420', border: '1px solid rgba(63,168,216,0.35)',
            borderRadius: '8px', padding: '20px 22px', color: '#cfe3f0',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#3fa8d8' }}>
                  AETHER-9 · DEV CHEAT PANEL
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted, #8899aa)', marginTop: '2px' }}>
                  Writes to the real store — every page reflects this instantly.
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#cfe3f0', padding: '4px 10px', borderRadius: '4px',
                  cursor: 'pointer', fontSize: '10px', fontFamily: 'var(--mono, monospace)',
                }}
              >
                CLOSE ✕
              </button>
            </div>

            {/* Rapport */}
            <SectionLabel>Rapport — currently {rapport} ({band})</SectionLabel>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Btn tone="cold" active={band === 'cold'} onClick={() => devSetRapport(-6)}>COLD (-6)</Btn>
              <Btn active={band === 'neutral'} onClick={() => devSetRapport(0)}>NEUTRAL (0)</Btn>
              <Btn tone="warm" active={band === 'warm'} onClick={() => devSetRapport(6)}>WARM (+6)</Btn>
              <input
                type="range" min={-10} max={10} value={rapport}
                onChange={e => devSetRapport(Number(e.target.value))}
                style={{ flex: 1, minWidth: '120px' }}
              />
              <span style={{ fontSize: '10px', width: '28px', textAlign: 'right' }}>{rapport}</span>
            </div>

            {/* Unit jump presets */}
            <SectionLabel>Jump to unit (clears &amp; rebuilds flags cleanly)</SectionLabel>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {UNITS.map(u => (
                <Btn key={u} onClick={() => jumpToUnit(u)}>UNIT {u} START</Btn>
              ))}
              <Btn tone="danger" onClick={() => { devClearFlags() }}>CLEAR ALL FLAGS</Btn>
            </div>

            {/* Per-unit fine control */}
            <SectionLabel>Fine control — individual flags &amp; endings</SectionLabel>
            {UNITS.map(u => (
              <div key={u} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', color: '#7fa8c0', marginBottom: '4px' }}>UNIT {u}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  {UNIT_LESSON_FLAGS[u].map(f => (
                    <Btn key={f} active={!!storyFlags[f]} onClick={() => toggleFlag(f)}>{f}</Btn>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {UNIT_ENDINGS[u].options.map(opt => (
                    <Btn
                      key={opt}
                      active={storyFlags[UNIT_ENDINGS[u].flag] === opt}
                      onClick={() => setEnding(u, opt)}
                    >
                      ending: {opt}
                    </Btn>
                  ))}
                </div>
              </div>
            ))}

            {/* Room visit overrides */}
            <SectionLabel>Room visit counts (for minVisits-gated moments)</SectionLabel>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ROOMS.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted, #8899aa)' }}>{r.id}</span>
                  <input
                    type="number" min={0} value={roomVisits[r.id] || 0}
                    onChange={e => devSetRoomVisits(r.id, Number(e.target.value))}
                    style={{
                      width: '44px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)', color: '#cfe3f0',
                      borderRadius: '3px', fontSize: '10px', padding: '2px 4px',
                      fontFamily: 'var(--mono, monospace)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Reset */}
            <SectionLabel>Full reset</SectionLabel>
            <Btn tone="danger" onClick={() => { devReset(); setOpen(false) }}>
              RESET ENTIRE SAVE (rapport, flags, messages, gallery, everything)
            </Btn>
          </div>
        </div>
      )}
    </>
  )
}
