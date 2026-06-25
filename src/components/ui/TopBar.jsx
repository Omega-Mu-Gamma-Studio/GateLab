import { useState, useRef, useEffect } from 'react'
import { useLessonStore, UNITS } from '../../store/lessonStore'

const THEMES = [
  { id: 'green', label: 'Matrix',  color: '#00ff88', attr: ''     },
  { id: 'gold',  label: 'Logic',   color: '#f5c400', attr: 'gold' },
  { id: 'blue',  label: 'Signal',  color: '#0099ff', attr: 'blue' },
]

const PHASE_META = {
  work:  { label: 'See It Work', cls: 'phase-work'  },
  break: { label: 'See It Break', cls: 'phase-break' },
  try:   { label: 'You Try',      cls: 'phase-try'   },
}

export default function TopBar() {
  const saved = localStorage.getItem('gatelab-theme') || 'green'
  const [active, setActive] = useState(saved)
  const [open, setOpen] = useState(false)
  const popRef = useRef(null)

  const { activeUnitId, phase, goHome } = useLessonStore()
  const phaseMeta = PHASE_META[phase]

  useEffect(() => {
    const theme = THEMES.find(t => t.id === active)
    document.documentElement.setAttribute('data-theme', theme?.attr || '')
    localStorage.setItem('gatelab-theme', active)
  }, [active])

  useEffect(() => {
    function handleClick(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: '52px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
      background: 'rgba(10,13,10,0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Left: wordmark */}
      <button
        onClick={goHome}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '10px', padding: 0,
        }}
      >
        <span style={{
          fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '17px',
          color: 'var(--accent-text)',
          textShadow: '0 0 14px var(--accent-glow)',
          letterSpacing: '0.02em',
        }}>
          GateLab
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          v0.1
        </span>
      </button>

      {/* Center: phase indicator — only visible inside a unit */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {activeUnitId && (
          <span
            className={`badge ${phaseMeta.cls}`}
            style={{ fontSize: '10px', letterSpacing: '0.08em' }}
          >
            {phaseMeta.label}
          </span>
        )}
      </div>

      {/* Right: course code + theme picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'var(--text-muted)', letterSpacing: '0.08em',
        }}>
          CS22303
        </span>

        <div ref={popRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(o => !o)}
            title="Switch theme"
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid var(--border)',
              background: open ? 'var(--accent-dim)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: open ? 'var(--accent-text)' : 'var(--text-muted)',
            }}
          >
            {/* Circuit/chip icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="7" width="10" height="10" rx="1"/>
              <line x1="7" y1="9" x2="3" y2="9"/><line x1="7" y1="12" x2="3" y2="12"/><line x1="7" y1="15" x2="3" y2="15"/>
              <line x1="17" y1="9" x2="21" y2="9"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="17" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="7" x2="9" y2="3"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="15" y1="7" x2="15" y2="3"/>
              <line x1="9" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="15" y1="17" x2="15" y2="21"/>
            </svg>
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: '40px', right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px', padding: '10px',
              minWidth: '155px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <p style={{
                fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '4px', padding: '0 4px',
              }}>
                Interface
              </p>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActive(t.id); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 8px', borderRadius: '7px', border: 'none',
                    background: active === t.id ? 'var(--accent-dim)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: '9px', height: '9px', borderRadius: '50%',
                    background: t.color, boxShadow: `0 0 7px ${t.color}`, flexShrink: 0,
                  }}/>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '12px',
                    color: active === t.id ? 'var(--accent-text)' : 'var(--text)',
                    fontWeight: active === t.id ? 500 : 400,
                  }}>
                    {t.label}
                  </span>
                  {active === t.id && (
                    <svg style={{ marginLeft: 'auto' }} width="11" height="11" viewBox="0 0 24 24"
                      fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}