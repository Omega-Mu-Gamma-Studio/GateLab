import { useState, useRef, useEffect } from 'react'
import { useLessonStore, UNITS } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'
import usePdaStore from '../../store/pdaStore'
import VerilogExportModal from './VerilogExportModal'
const THEMES = [
  { id: 'green', label: 'Matrix',  color: '#00ff88', attr: ''     },
  { id: 'gold',  label: 'Logic',   color: '#f5c400', attr: 'gold' },
  { id: 'blue',  label: 'Signal',  color: '#0099ff', attr: 'blue' },
]

export default function TopBar() {
  const saved = localStorage.getItem('gatelab-theme') || 'green'
  const [active, setActive] = useState(saved)
  const [open, setOpen] = useState(false)
  const popRef = useRef(null)

  const { activeUnitId, activeLessonIdx, goHome } = useLessonStore()
  const devReset = usePdaStore(s => s.devReset)
  const storyMode = usePdaStore(s => s.storyMode)
  const toggleMap = usePdaStore(s => s.toggleMap)
  const showMapButton = storyMode === true && activeUnitId !== null
  const nodeCount = useCanvasStore(s => s.nodes.length)
  const [verilogOpen, setVerilogOpen] = useState(false)
  // Get current unit info for breadcrumb
  const activeUnit = UNITS.find(u => u.id === activeUnitId)

  const LESSON_NAMES = {
    1: ['AND Gate','OR Gate','NOT Gate','NAND & NOR','XOR & XNOR','Boolean Laws','SOP & POS','K-Map 2-Var','K-Map 3-Var','K-Map 4-Var'],
    2: ['Half Adder','Full Adder','Ripple Carry Adder','Subtractor','Encoder','Decoder','Multiplexer','Demultiplexer','Comparator'],
    3: ['SR Latch','SR Flip-Flop','JK Flip-Flop','D Flip-Flop','T Flip-Flop','Ripple Counter','Mod-N Counter','Ring Counter','Johnson Counter'],
    4: ['Async Intro','Race Conditions','Static Hazards','Dynamic Hazards','Hazard Elimination','Delay Model'],
    5: ['SRAM','DRAM','ROM','EPROM & Flash','PLA','PAL','Hamming Code'],
  }
  const lessonName = activeUnitId ? (LESSON_NAMES[activeUnitId]?.[activeLessonIdx] || '') : ''
  const totalLessons = activeUnit?.lessons || 0

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
    <>
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: '5vh',
      minHeight: '40px',
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

      {/* Center: lesson breadcrumb — only visible inside a unit */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {activeUnitId && lessonName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}>
            <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>
              Unit {activeUnit?.roman}
            </span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Lesson {activeLessonIdx + 1} of {totalLessons}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ color: 'var(--text-h)' }}>{lessonName}</span>
          </div>
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

        {showMapButton && (
          <button
            onClick={toggleMap}
            title="Ship Map (M)"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              height: '32px', padding: '0 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            MAP
            <span style={{ fontSize: '9px', opacity: 0.6 }}>M</span>
          </button>
        )}

        {activeUnitId && nodeCount > 0 && (
          <button
            onClick={() => setVerilogOpen(true)}
            title="Export circuit as Verilog"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              height: '32px', padding: '0 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.06em',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            .V
          </button>
        )}

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

              {import.meta.env.DEV && (
                <>
                  <div style={{ height: '0.5px', background: 'var(--border)', margin: '6px 4px' }} />
                  <button
                    onClick={() => { devReset(); localStorage.removeItem('gatelab-pda'); setOpen(false); window.location.reload() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '7px 8px', borderRadius: '7px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      width: '100%', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,60,60,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: '#ff3c3c', flexShrink: 0,
                    }}/>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#ff6060' }}>
                      Reset Save
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    {verilogOpen && <VerilogExportModal onClose={() => setVerilogOpen(false)} />}
    </>
  )
}