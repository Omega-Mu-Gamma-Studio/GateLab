import { useState } from 'react'
import { useLessonStore, UNITS } from '../store/lessonStore'
import usePdaStore from '../store/pdaStore'

function ScanlineBg() {
  return (
    <>
      <div className="bg-scanlines" />
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '420px',
        background: 'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>
    </>
  )
}

function UnitCard({ unit, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="glass-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', padding: '26px', display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '10px',
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '15px',
          color: 'var(--accent-text)',
          boxShadow: hovered ? '0 0 16px var(--accent-glow)' : 'none',
          transition: 'box-shadow 0.25s',
        }}>
          {unit.roman}
        </div>
        <span className="status-dev">In Dev</span>
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
          {unit.title}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--accent-text)', fontFamily: 'var(--mono)', marginBottom: '10px' }}>
          {unit.sub}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.65 }}>
          {unit.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {unit.lessons} LESSONS
        </span>
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.2s, opacity 0.2s',
            opacity: hovered ? 1 : 0.35,
          }}
        >
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  )
}

function ModeSelect() {
  const { setStoryMode } = usePdaStore()
  const [hoveredMode, setHoveredMode] = useState(null)

  const modes = [
    {
      id: false,
      tag: 'STANDARD MODE',
      title: 'Just the circuits.',
      body: '41 interactive lessons across 5 units. Jump in, fix gates, learn digital logic — no story layer, no fluff.',
      cta: 'ENTER GATELAB →',
      accent: 'var(--accent)',
      accentDim: 'var(--accent-dim)',
      accentBorder: 'var(--accent-border)',
      accentText: 'var(--accent-text)',
    },
    {
      id: true,
      tag: 'STORY MODE',
      title: 'AETHER-9 needs you.',
      body: "You don't remember joining the crew. Ada does. The circuits are your job — what happens after your shift is something else entirely.",
      cta: 'BOARD THE SHIP →',
      accent: '#3fa8d8',
      accentDim: 'rgba(63,168,216,0.08)',
      accentBorder: 'rgba(63,168,216,0.28)',
      accentText: '#7aaccc',
    },
  ]

  return (
    <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{
        textAlign: 'center', marginBottom: '52px',
        fontFamily: 'var(--mono)', fontSize: '11px',
        letterSpacing: '0.18em', color: 'var(--text-muted)',
      }}>
        SELECT MODE · THIS CHOICE LOCKS TO YOUR SAVE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {modes.map(mode => {
          const hovered = hoveredMode === mode.id
          return (
            <button
              key={String(mode.id)}
              onClick={() => setStoryMode(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '20px',
                padding: '32px', borderRadius: '12px',
                background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? mode.accentBorder : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.2s',
                boxShadow: hovered ? `0 0 32px ${mode.accentDim}` : 'none',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                letterSpacing: '0.2em', color: mode.accentText,
                padding: '3px 10px', borderRadius: '4px',
                background: mode.accentDim,
                border: `0.5px solid ${mode.accentBorder}`,
                alignSelf: 'flex-start',
              }}>
                {mode.tag}
              </span>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '12px' }}>
                  {mode.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7 }}>
                  {mode.body}
                </p>
              </div>

              <span style={{
                fontFamily: 'var(--mono)', fontSize: '10px',
                letterSpacing: '0.12em', marginTop: 'auto',
                color: hovered ? mode.accentText : 'var(--text-muted)',
                transition: 'color 0.2s',
              }}>
                {mode.cta}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function Home() {
  const { goToUnit } = useLessonStore()
  const storyMode = usePdaStore(s => s.storyMode)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <ScanlineBg />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <section style={{ padding: '120px 24px 64px', textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <span className="badge">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}/>
              CS22303 · Omega Mu Gamma Studio
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(52px, 8vw, 84px)', fontWeight: 700,
            letterSpacing: '-0.03em', lineHeight: 1.0,
            marginBottom: '22px', color: 'var(--text-h)',
          }}>
            Gate<span className="glow-text">Lab</span>
          </h1>

          <p style={{
            fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-muted)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px',
          }}>
            The broken circuit is the explanation.
          </p>

          <p style={{ fontSize: '16px', color: 'var(--text)', maxWidth: '480px', margin: '0 auto 52px', lineHeight: 1.75 }}>
            {storyMode === null
              ? 'Two ways in. Same circuits. Choose how you want to learn.'
              : '41 interactive lessons across 5 units of Digital Principles — drag gates, draw wires, break circuits, fix them.'
            }
          </p>
        </section>

        {storyMode === null ? (
          <ModeSelect />
        ) : (
          <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px 80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
              {UNITS.map(unit => (
                <UnitCard key={unit.id} unit={unit} onClick={() => goToUnit(unit.id)} />
              ))}
            </div>
          </section>
        )}

        <div style={{
          textAlign: 'center', paddingBottom: '40px',
          fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em',
        }}>
          BUILT AT OMEGA MU GAMMA STUDIO
        </div>
      </div>
    </div>
  )
}