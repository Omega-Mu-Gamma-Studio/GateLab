import { useLessonStore, UNITS } from '../../store/lessonStore'

export default function GateCanvas() {
  const { activeUnitId, activeLessonIdx, phase } = useLessonStore()
  const unit = UNITS.find(u => u.id === activeUnitId)

  const UNIT_LESSONS = {
    1: ['AND Gate','OR Gate','NOT Gate','NAND & NOR','XOR & XNOR','Boolean Laws','SOP & POS','K-Map 2-Var','K-Map 3-Var','K-Map 4-Var'],
    2: ['Half Adder','Full Adder','Ripple Carry Adder','Subtractor','Encoder','Decoder','Multiplexer','Demultiplexer','Comparator'],
    3: ['SR Latch','SR Flip-Flop','JK Flip-Flop','D Flip-Flop','T Flip-Flop','Ripple Counter','Mod-N Counter','Ring Counter','Johnson Counter'],
    4: ['Async Circuits Intro','Race Conditions','Static Hazards','Dynamic Hazards','Hazard Elimination','Delay Model'],
    5: ['SRAM','DRAM','ROM','EPROM & Flash','PLA','PAL','Hamming Code'],
  }

  const lessonName = UNIT_LESSONS[activeUnitId]?.[activeLessonIdx] || ''

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 50% 30%, var(--accent-glow) 0%, transparent 60%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 31px,
          var(--border) 31px,
          var(--border) 32px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 31px,
          var(--border) 31px,
          var(--border) 32px
        )
      `,
    }}>
      {/* Lesson title watermark */}
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'var(--text-muted)', letterSpacing: '0.12em',
          textTransform: 'uppercase', display: 'block', marginBottom: '12px',
        }}>
          Unit {unit?.roman} · {lessonName}
        </span>
        <h2 style={{ fontSize: '22px', color: 'var(--text-h)', marginBottom: '8px' }}>
          {lessonName}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>
          CANVAS COMING SOON
        </p>
      </div>

      {/* Phase reminder */}
      <div style={{
        padding: '10px 18px',
        borderRadius: '10px',
        border: '1px solid var(--accent-border)',
        background: 'var(--accent-dim)',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--accent-text)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {phase === 'work'  && '▶ See It Work — watch the circuit operate'}
        {phase === 'break' && '✕ See It Break — find the fault'}
        {phase === 'try'   && '◈ You Try — build it yourself'}
      </div>
    </div>
  )
}