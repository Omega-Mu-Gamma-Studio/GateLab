/**
 * TasksApp.jsx
 *
 * The MAINT-SYS work order viewer. Replaces PlotBox entirely.
 *
 * Displays the current lesson as a maintenance ticket:
 *   - Work order ID, location, shift (from meta)
 *   - Phase status strip (OBSERVE → FAULT → REPAIR)
 *   - Incident summary / recap (narrative.recap)
 *   - Current phase objective — updates live as phase shifts
 *
 * Content comes from pdaStore.currentTask which is seeded by
 * lessonStore.syncCanvas via triggerLessonLoad / updateTaskPhase.
 * TasksApp never reads lessonStore directly.
 *
 * When no lesson is active, shows an idle state.
 */
import usePdaStore from '../../store/pdaStore'
import AppShell from './AppShell'

const PHASE_ORDER  = ['work', 'break', 'try']
const PHASE_LABELS = { work: 'OBSERVE', break: 'FAULT', try: 'REPAIR' }
const PHASE_COLORS = { work: '#44cc88', break: '#ff4d5e', try: '#f5c400' }
const PHASE_DESCS  = {
  work:  'Nominal state. Study the circuit behaviour.',
  break: 'Fault injected. Identify what failed and why.',
  try:   'Repair required. Wire the correct circuit.',
}

function PhaseStrip({ current }) {
  return (
    <div style={{ display: 'flex', gap: '6px', margin: '0 0 16px 0' }}>
      {PHASE_ORDER.map((p, i) => {
        const isDone   = PHASE_ORDER.indexOf(current) > i
        const isActive = current === p
        const color    = PHASE_COLORS[p]
        return (
          <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: isActive ? color : isDone ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              boxShadow: isActive ? `0 0 8px ${color}` : 'none',
              transition: 'all 0.3s',
            }}/>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.08em',
              color: isActive ? color : 'rgba(255,255,255,0.2)',
              transition: 'color 0.3s',
            }}>
              {PHASE_LABELS[p]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, value, mono = true }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: '3px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: mono ? 'var(--mono)' : 'inherit',
        fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
      }}>
        {value}
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      height: '1px',
      background: 'rgba(255,255,255,0.06)',
      margin: '14px 0',
    }}/>
  )
}

export default function TasksApp() {
  const { currentTask } = usePdaStore()

  if (!currentTask) {
    return (
      <AppShell appId="tasks">
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(245,196,0,0.08)',
            border: '1px solid rgba(245,196,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(245,196,0,0.4)" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em',
            textAlign: 'center',
          }}>
            NO ACTIVE WORK ORDER
          </span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'rgba(255,255,255,0.12)', letterSpacing: '0.04em',
            textAlign: 'center',
          }}>
            Select a lesson to begin
          </span>
        </div>
      </AppShell>
    )
  }

  const { workOrder, location, shift, title, unit, phase, recap, briefing, fault, dispatch } = currentTask

  // Pick the objective text for the current phase
  const objective = phase === 'try'   ? dispatch
                  : phase === 'break' ? fault
                  : briefing

  return (
    <AppShell appId="tasks">
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 20px 18px' }}>

        {/* Work order header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '14px',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700,
              color: '#f5c400', letterSpacing: '0.1em', marginBottom: '4px',
            }}>
              {workOrder}
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600,
              color: 'rgba(255,255,255,0.85)', lineHeight: 1.3,
            }}>
              {title}
            </div>
          </div>
          <div style={{
            background: 'rgba(245,196,0,0.08)',
            border: '1px solid rgba(245,196,0,0.2)',
            borderRadius: '6px', padding: '3px 8px',
            fontFamily: 'var(--mono)', fontSize: '9px',
            color: '#f5c400', letterSpacing: '0.08em',
            whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px',
          }}>
            UNIT {unit}
          </div>
        </div>

        {/* Phase status strip */}
        <PhaseStrip current={phase} />

        {/* Current phase objective */}
        <div style={{
          background: phase === 'break'
            ? 'rgba(255,77,94,0.06)'
            : phase === 'try'
            ? 'rgba(245,196,0,0.06)'
            : 'rgba(68,204,136,0.06)',
          border: `1px solid ${
            phase === 'break' ? 'rgba(255,77,94,0.2)'
            : phase === 'try' ? 'rgba(245,196,0,0.2)'
            : 'rgba(68,204,136,0.2)'
          }`,
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.1em',
            color: PHASE_COLORS[phase], marginBottom: '6px',
          }}>
            {PHASE_LABELS[phase]} · OBJECTIVE
          </div>
          <p style={{
            margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'rgba(255,255,255,0.72)', lineHeight: 1.6,
          }}>
            {objective || PHASE_DESCS[phase]}
          </p>
        </div>

        <Divider />

        {/* Meta fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Field label="Location" value={location} />
          <Field label="Shift"    value={shift} />
        </div>

        <Divider />

        {/* Incident summary / recap */}
        {recap && (
          <>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: '8px',
            }}>
              Background
            </div>
            <p style={{
              margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {recap}
            </p>
          </>
        )}

        {/* MAINT-SYS footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#44cc88', boxShadow: '0 0 5px #44cc88',
          }}/>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '9px',
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em',
          }}>
            MAINT-SYS · AUTO-GENERATED · AETHER-9
          </span>
        </div>

      </div>
    </AppShell>
  )
}