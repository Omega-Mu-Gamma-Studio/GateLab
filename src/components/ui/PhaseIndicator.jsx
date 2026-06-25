import { useLessonStore } from '../../store/lessonStore'

const PHASES = [
  { id: 'work',  label: 'See It Work',  cls: 'phase-work'  },
  { id: 'break', label: 'See It Break', cls: 'phase-break'  },
  { id: 'try',   label: 'You Try',      cls: 'phase-try'    },
]

export default function PhaseIndicator() {
  const { phase, setPhase } = useLessonStore()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {PHASES.map((p, i) => (
        <button
          key={p.id}
          onClick={() => setPhase(p.id)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid',
            cursor: 'pointer',
            transition: 'all 0.15s',
            ...(phase === p.id
              ? {
                  background: `var(--accent-dim)`,
                  borderColor: `var(--accent-border)`,
                  color: 'var(--accent-text)',
                }
              : {
                  background: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }),
          }}
        >
          {i + 1}. {p.label}
        </button>
      ))}
    </div>
  )
}