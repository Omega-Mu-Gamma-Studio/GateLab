/**
 * NotesTab.jsx
 *
 * Auto-generated lore notes. Every completed lesson writes its
 * narrative.lore field here as a timestamped entry.
 *
 * Styled as the ship's maintenance log — not a personal journal.
 * The player doesn't write these; the system does. That's intentional:
 * it makes the lore feel like official record rather than player notes,
 * which fits the setting and the mechanic's amnesia (someone is keeping
 * the record for them).
 *
 * Notes accumulate in order of lesson completion. Each has:
 *   - lesson ID / work order reference
 *   - a generated title (the lesson name)
 *   - the lore text
 *   - a timestamp (date the lesson was completed)
 *
 * Tapping a note expands it. No editing, no deletion — read-only log.
 */
import { useState } from 'react'
import usePdaStore from '../../store/pdaStore'

function NoteCard({ note, expanded, onToggle }) {
  return (
    <div
      style={{
        margin: '8px 12px',
        background: expanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${expanded ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Log icon */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: 'rgba(77,255,172,0.08)',
          border: '1px solid rgba(77,255,172,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="rgba(77,255,172,0.6)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600,
            color: 'var(--text-h)', marginBottom: '3px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {note.title}
          </div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '9px',
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em',
            display: 'flex', gap: '8px',
          }}>
            <span>{note.lessonId?.toUpperCase()}</span>
            <span>·</span>
            <span>{note.ts}</span>
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.25)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{
          padding: '0 14px 14px 52px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: '12px',
        }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
            whiteSpace: 'pre-line',
            fontStyle: 'italic',
          }}>
            {note.body}
          </p>
          <div style={{
            marginTop: '10px',
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(77,255,172,0.06)',
            border: '1px solid rgba(77,255,172,0.12)',
          }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '8px',
              color: 'rgba(77,255,172,0.4)', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Auto-logged · MAINT-SYS
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NotesTab() {
  const notes = usePdaStore(s => s.notes)
  const [expandedId, setExpandedId] = useState(null)

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  if (notes.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: '12px',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'rgba(255,255,255,0.18)', textAlign: 'center',
          lineHeight: 1.6,
        }}>
          No log entries yet.
        </p>
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.1)', textAlign: 'center',
          fontStyle: 'italic',
        }}>
          MAINT-SYS logs technical notes here each time you close a work order.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Maintenance Log
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.2)',
        }}>
          {notes.length} entr{notes.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Notes list — newest first */}
      {[...notes].reverse().map(note => (
        <NoteCard
          key={note.id}
          note={note}
          expanded={expandedId === note.id}
          onToggle={() => toggle(note.id)}
        />
      ))}

      {/* Footer attribution */}
      <div style={{
        padding: '16px 14px',
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.1)', textAlign: 'center',
        letterSpacing: '0.06em',
      }}>
        AUTOMATED SYSTEM LOG · DECK 7 · ALPHA SHIFT
      </div>
    </div>
  )
}