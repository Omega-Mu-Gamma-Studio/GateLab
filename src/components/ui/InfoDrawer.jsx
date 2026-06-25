import { useState, useEffect } from 'react'
import { useLessonStore, UNITS } from '../../store/lessonStore'

/* ── Trivia content ─────────────────────────────────────────── */
const TRIVIA = [
  {
    type: 'fact',
    text: "Claude Shannon's 1948 paper \"A Mathematical Theory of Communication\" invented information theory over a single summer. He was 32.",
  },
  {
    type: 'fact',
    text: 'NAND is functionally complete — you can build every other logic gate using only NAND gates. So is NOR. No one talks about this enough.',
  },
  {
    type: 'joke',
    text: "Why do programmers prefer dark mode? Because light attracts bugs.",
  },
  {
    type: 'fact',
    text: "The first logic gates were built from electromechanical relays in the 1930s. Each relay was physically clicking open and closed to represent 0 and 1.",
  },
  {
    type: 'fact',
    text: 'XOR is used in virtually every parity check and CRC algorithm ever written. One gate. Everywhere.',
  },
  {
    type: 'joke',
    text: "There are 10 kinds of people in the world. Those who understand binary, and those who don't.",
  },
  {
    type: 'fact',
    text: "George Boole published \"An Investigation of the Laws of Thought\" in 1854 — 93 years before anyone thought to build circuits out of it.",
  },
  {
    type: 'fact',
    text: "The Apollo Guidance Computer had 4 KB of RAM and ran at 2 MHz. It landed humans on the moon. Your browser tab uses more memory than that just opening.",
  },
  {
    type: 'joke',
    text: "A NAND gate walks into a bar. The bartender says 'I'll get you a drink.' The NAND gate says 'No you won't.'",
  },
  {
    type: 'fact',
    text: "Karnaugh maps were invented by Maurice Karnaugh in 1953 while he was at Bell Labs. He was trying to simplify telephone switching circuits.",
  },
  {
    type: 'fact',
    text: "A race condition is called that because two signals are literally racing to a gate. Whoever arrives first changes the output before the other one gets there.",
  },
  {
    type: 'joke',
    text: "Q: What did the logic gate say when asked if it wanted coffee? A: OR. (Either is fine.)",
  },
  {
    type: 'fact',
    text: "The 7400 series TTL chips from the 1970s are still being manufactured today. You can buy a quad NAND gate IC for about 30 cents.",
  },
  {
    type: 'fact',
    text: "Flip-flops are called flip-flops because the output flips and flops between two stable states. The name predates digital electronics — it came from radio engineers.",
  },
  {
    type: 'joke',
    text: "Why did the JK flip-flop break up with the SR latch? Because it couldn't handle the undefined states.",
  },
  {
    type: 'fact',
    text: "A 4-variable K-map has 16 cells. A 5-variable K-map requires two 4-variable maps placed side by side. At 6 variables, most engineers just use a Quine-McCluskey solver.",
  },
  {
    type: 'fact',
    text: "Richard Hamming invented the Hamming code in 1950 out of frustration. Bell Labs computers kept making errors on weekends when no one was there to fix them, so he made the machine fix itself.",
  },
  {
    type: 'joke',
    text: "An engineer, a physicist, and a computer scientist walk into a bar. The engineer says 'a half-adder walks in.' The physicist says 'the sum is 1.' The computer scientist says 'the carry is 0.' The bartender has no idea what's happening.",
  },
  {
    type: 'fact',
    text: "SRAM holds its state as long as it has power — no refresh needed. DRAM leaks charge and must be refreshed thousands of times per second. Your RAM is DRAM. It is constantly being saved from forgetting.",
  },
  {
    type: 'fact',
    text: "De Morgan's theorem says NOT(A AND B) = NOT A OR NOT B. This single identity is why NAND gates are so powerful — they already contain a NOT and an AND.",
  },
  {
    type: 'joke',
    text: "I tried to write a joke about a D flip-flop but it only remembered the punchline on the rising clock edge.",
  },
  {
    type: 'fact',
    text: "The first transistor was invented at Bell Labs in 1947. Within 10 years it replaced the vacuum tube. Within 20 years Intel was putting 2,300 of them on a single chip. Today's chips have over 100 billion.",
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── Trivia Card ─────────────────────────────────────────────── */
function TriviaCard({ item, onShuffle }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '16px',
      padding: '20px', height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: item.type === 'joke' ? '#f5c400' : 'var(--accent-text)',
        }}>
          {item.type === 'joke' ? '⚡ Circuit Humor' : '◈ Did You Know'}
        </span>
        <button
          onClick={onShuffle}
          title="Shuffle"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px',
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <p style={{
        fontSize: '13px', color: 'var(--text-h)',
        lineHeight: 1.75, flex: 1,
        fontStyle: item.type === 'joke' ? 'italic' : 'normal',
      }}>
        {item.text}
      </p>

      {/* Footer hint */}
      <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        SHUFFLE FOR ANOTHER ONE
      </p>
    </div>
  )
}

/* ── Panel Tab content (functional mode) ────────────────────── */
function PanelPlaceholder({ label }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '8px', color: 'var(--text-muted)',
      fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.08em',
    }}>
      <span style={{ color: 'var(--accent-text)', fontSize: '10px' }}>{label.toUpperCase()}</span>
      <span>PANEL COMING SOON</span>
    </div>
  )
}

/* ── InfoDrawer ──────────────────────────────────────────────── */
export default function InfoDrawer({ open, onClose }) {
  const { activeUnitId } = useLessonStore()
  const [deck] = useState(() => shuffle(TRIVIA))
  const [idx, setIdx] = useState(0)
  const [tab, setTab] = useState('trivia')

  // available panels for active unit
  const unit = UNITS.find(u => u.id === activeUnitId)
  const panels = unit?.panels || []

  // reshuffle on every open
  useEffect(() => {
    if (open) setIdx(Math.floor(Math.random() * deck.length))
  }, [open])

  // default tab: first available panel, else trivia
  useEffect(() => {
    if (panels.length > 0) setTab(panels[0])
    else setTab('trivia')
  }, [activeUnitId])

  const allTabs = [...panels, 'trivia']

  const TAB_LABELS = {
    timing: 'Timing',
    state:  'State',
    verilog:'Verilog',
    trivia: panels.length > 0 ? '✦ Chill' : '✦ Trivia',
  }

  return (
    <>
      {/* Backdrop — only on mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{
            display: 'none',
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(0,0,0,0.4)',
          }}
        />
      )}

      {/* Drawer panel */}
      <div style={{
        position: 'fixed',
        top: '52px', right: 0, bottom: 0,
        width: '280px',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border-strong)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 160,
      }}>

        {/* Tab bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          padding: '0 4px',
          flexShrink: 0,
        }}>
          {allTabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 6px',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: tab === t ? 'var(--accent-text)' : 'var(--text-muted)',
                transition: 'color 0.15s',
                marginBottom: '-1px',
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '8px',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-h)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'timing'  && <PanelPlaceholder label="Timing Diagram" />}
          {tab === 'state'   && <PanelPlaceholder label="State Diagram" />}
          {tab === 'verilog' && <PanelPlaceholder label="Verilog View" />}
          {tab === 'trivia'  && (
            <TriviaCard
              item={deck[idx % deck.length]}
              onShuffle={() => setIdx(i => (i + 1) % deck.length)}
            />
          )}
        </div>
      </div>
    </>
  )
}