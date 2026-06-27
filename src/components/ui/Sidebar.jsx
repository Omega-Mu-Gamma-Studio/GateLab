/**
 * Sidebar.jsx
 *
 * Collapsible left navigation.
 * - Expanded (220px): shows unit titles + lesson list
 * - Collapsed (40px): shows only unit roman numeral icons
 * - State persists in localStorage
 * - Closed by default when inside a lesson (canvas gets full width)
 */
import { useState, useEffect } from 'react'
import { useLessonStore, UNITS } from '../../store/lessonStore'

const UNIT_LESSONS = {
  1: ['AND Gate','OR Gate','NOT Gate','NAND & NOR','XOR & XNOR','Boolean Laws','SOP & POS','K-Map 2-Var','K-Map 3-Var','K-Map 4-Var'],
  2: ['Half Adder','Full Adder','Ripple Carry Adder','Subtractor','Encoder','Decoder','Multiplexer','Demultiplexer','Comparator'],
  3: ['SR Latch','SR Flip-Flop','JK Flip-Flop','D Flip-Flop','T Flip-Flop','Ripple Counter','Mod-N Counter','Ring Counter','Johnson Counter'],
  4: ['Async Circuits Intro','Race Conditions','Static Hazards','Dynamic Hazards','Hazard Elimination','Delay Model'],
  5: ['SRAM','DRAM','ROM','EPROM & Flash','PLA','PAL','Hamming Code'],
}

export default function Sidebar() {
  const { activeUnitId, activeLessonIdx, goToUnit, goToLesson } = useLessonStore()
  const lessons = activeUnitId ? (UNIT_LESSONS[activeUnitId] || []) : []

  // Collapsed by default when inside a lesson
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('gatelab-sidebar-collapsed')
    if (saved !== null) return saved === 'true'
    return !!activeUnitId  // default closed if already in a lesson
  })

  useEffect(() => {
    localStorage.setItem('gatelab-sidebar-collapsed', collapsed)
  }, [collapsed])

  const width = collapsed ? '40px' : '220px'

  return (
    <aside style={{
      width,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      transition: 'width 0.25s ease',
    }}>
      {/* Toggle button */}
      <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-end',
        padding: collapsed ? '0' : '0 8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          style={{
            width: '26px', height: '26px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Unit switcher */}
      <div style={{
        padding: collapsed ? '8px 4px' : '12px 8px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: '2px',
        flexShrink: 0,
      }}>
        {UNITS.map(unit => (
          <button
            key={unit.id}
            onClick={() => goToUnit(unit.id)}
            title={collapsed ? `Unit ${unit.roman}: ${unit.title}` : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px',
              padding: collapsed ? '7px 0' : '7px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '8px',
              border: 'none',
              background: activeUnitId === unit.id ? 'var(--accent-dim)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left', width: '100%',
              transition: 'background 0.15s',
            }}
          >
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
              color: activeUnitId === unit.id ? 'var(--accent-text)' : 'var(--text-muted)',
              width: collapsed ? 'auto' : '20px',
              flexShrink: 0,
              textAlign: 'center',
            }}>
              {unit.roman}
            </span>
            {!collapsed && (
              <span style={{
                fontSize: '12px',
                color: activeUnitId === unit.id ? 'var(--text-h)' : 'var(--text)',
                fontWeight: activeUnitId === unit.id ? 500 : 400,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {unit.title.split(',')[0]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lesson list — only visible when expanded */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {lessons.length === 0 ? (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', padding: '12px', letterSpacing: '0.06em' }}>
              SELECT A UNIT
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {lessons.map((name, i) => (
                <button
                  key={i}
                  onClick={() => goToLesson(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px', borderRadius: '7px',
                    border: 'none',
                    background: activeLessonIdx === i ? 'var(--accent-dim)' : 'transparent',
                    borderLeft: activeLessonIdx === i ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '10px',
                    color: activeLessonIdx === i ? 'var(--accent)' : 'var(--text-muted)',
                    width: '18px', flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: activeLessonIdx === i ? 'var(--text-h)' : 'var(--text)',
                    fontWeight: activeLessonIdx === i ? 500 : 400,
                  }}>
                    {name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}