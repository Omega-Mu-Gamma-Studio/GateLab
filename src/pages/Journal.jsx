/**
 * Journal.jsx
 *
 * Completed lesson notebook.
 * Lists every completed lesson as a card with work order, location, and date.
 * Accessible from TopBar (not yet wired — stub page for now).
 */
import useProgressStore from '../store/progressStore'
import { UNITS } from '../store/lessonStore'

const ALL_LESSONS = {
  'unit1-01': { title: 'AND Gate',            unit: 1, workOrder: 'WO-0047', location: 'Deck 7 · Bay 4'  },
  'unit1-02': { title: 'OR Gate',             unit: 1, workOrder: 'WO-0048', location: 'Deck 7 · Bay 5'  },
  'unit1-03': { title: 'NOT Gate',            unit: 1, workOrder: 'WO-0049', location: 'Deck 6 · Bay 2'  },
  'unit1-04': { title: 'NAND & NOR',          unit: 1, workOrder: 'WO-0050', location: 'Deck 6 · Bay 8'  },
  'unit1-05': { title: 'XOR & XNOR',          unit: 1, workOrder: 'WO-0051', location: 'Deck 5 · Bay 1'  },
  'unit1-06': { title: 'Boolean Laws',        unit: 1, workOrder: 'WO-0052', location: 'Deck 4 · Bay 3'  },
  'unit1-07': { title: 'SOP & POS',           unit: 1, workOrder: 'WO-0053', location: 'Deck 4 · Bay 7'  },
  'unit1-08': { title: 'K-Map 2-Var',         unit: 1, workOrder: 'WO-0054', location: 'Deck 3 · Bay 6'  },
  'unit1-09': { title: 'K-Map 3-Var',         unit: 1, workOrder: 'WO-0055', location: 'Deck 3 · Bay 9'  },
  'unit1-10': { title: 'K-Map 4-Var',         unit: 1, workOrder: 'WO-0056', location: 'Deck 2 · Bay 12' },
}

function UnitRoman(unitId) {
  return UNITS.find(u => u.id === unitId)?.roman || '?'
}

export default function Journal() {
  const { completedLessons, xp, level, getLevelProgress } = useProgressStore()
  const completed = Object.keys(completedLessons).filter(k => completedLessons[k])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '80px 40px 60px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          ◈ Field Service Record
        </div>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--text-h)',
          marginBottom: '12px',
        }}>
          Circuit Journal
        </h1>

        {/* XP / Level bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          <span style={{ color: 'var(--accent-text)' }}>Level {level}</span>
          <div style={{
            flex: 1, maxWidth: '200px',
            height: '4px',
            background: 'var(--border-strong)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${getLevelProgress()}%`,
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px var(--accent-glow)',
            }} />
          </div>
          <span>{xp} XP</span>
          <span>·</span>
          <span>{completed.length} faults resolved</span>
        </div>
      </div>

      {/* Empty state */}
      {completed.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          fontFamily: 'var(--mono)',
          color: 'var(--text-muted)',
          fontSize: '13px',
          letterSpacing: '0.06em',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.3 }}>◈</div>
          No work orders completed yet.<br/>
          Complete a lesson to generate your first journal entry.
        </div>
      )}

      {/* Completed lesson cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        {completed.map(lessonId => {
          const info = ALL_LESSONS[lessonId]
          if (!info) return null
          return (
            <div key={lessonId} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--accent-text)',
                  letterSpacing: '0.08em',
                }}>
                  {info.workOrder}
                </span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                }}>
                  Unit {UnitRoman(info.unit)}
                </span>
              </div>

              <div style={{
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-h)',
              }}>
                {info.title}
              </div>

              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
              }}>
                {info.location}
              </div>

              <div style={{
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: 'var(--accent-text)',
              }}>
                <span>✓</span>
                <span>CLOSED</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}