/**
 * MessagesTab.jsx
 *
 * Two views:
 *   1. Thread list  — all contacts, unread counts, last message preview
 *   2. Chat view    — single thread, message bubbles, reply choices
 *
 * Reply choices only appear on the most recent incoming message that
 * hasn't been replied to yet. Once replied, choices collapse and the
 * player's bubble + Ada's response take their place (already in store).
 *
 * Image messages render as a tappable preview that opens the lightbox
 * via PhotosTab (or inline, since we're inside PDA already — we open
 * a simple inline lightbox here rather than switching tabs).
 *
 * Unit-end binary choice renders as a special full-screen overlay
 * inside the PDA frame when unit1_ending flag is not yet set and
 * all 10 unit 1 lessons are complete. Triggered manually for now —
 * later we'll hook it to progressStore.
 */
import { useState, useEffect, useRef } from 'react'
import usePdaStore, { rapportBand } from '../../store/pdaStore'
import {
  UNIT1_END_CHOICE,
  UNIT2_END_CHOICE,
  UNIT3_END_CHOICE,
  UNIT4_END_CHOICE,
  UNIT5_END_CHOICE,
} from '../../data/adaMessages'

// ── Unit-end metadata ──────────────────────────────────────────────────────
// Maps each unit to its lesson count (for completion checks), its end-choice
// config, and short banner copy for the thread-list CTA card.
const UNIT_END_META = {
  1: { lessonCount: 10, choice: UNIT1_END_CHOICE, bannerTitle: 'Incident Report Pending', bannerSub: 'WO-0052 · Requires your signature' },
  2: { lessonCount: 9,  choice: UNIT2_END_CHOICE, bannerTitle: 'Performance Review Pending', bannerSub: "Reyes's assessment · Confirm or amend" },
  3: { lessonCount: 9,  choice: UNIT3_END_CHOICE, bannerTitle: 'A Question, Unanswered', bannerSub: 'Personnel file anomaly · Tell or wait' },
  4: { lessonCount: 6,  choice: UNIT4_END_CHOICE, bannerTitle: 'Supplemental Report Pending', bannerSub: 'Off-shift incident · Requires your signature' },
  5: { lessonCount: 7,  choice: UNIT5_END_CHOICE, bannerTitle: 'One Last Thing', bannerSub: 'The escape pod matrix · A conversation, not a form' },
}
const UNIT_IDS = [1, 2, 3, 4, 5]

// ── Placeholder image renderer ────────────────────────────────────────────
// Until real art assets exist, renders a styled placeholder card.
// Once src is a real path (e.g. '/assets/ada/milky-way.jpg'), it just
// renders <img> with the caption.
function ImageBubble({ image, onClick }) {
  const isPlaceholder = image.src?.startsWith('ada:') || image.src?.startsWith('photo:')

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        maxWidth: '220px',
        border: '1px solid rgba(255,77,94,0.3)',
        background: 'rgba(255,77,94,0.08)',
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {isPlaceholder ? (
        <div style={{
          width: '220px', height: '140px',
          background: 'linear-gradient(135deg, rgba(255,77,94,0.12) 0%, rgba(255,77,94,0.04) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '8px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,77,94,0.5)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '9px',
            color: 'rgba(255,77,94,0.5)', letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {image.alt || 'Photo'}
          </span>
        </div>
      ) : (
        <img
          src={image.src} alt={image.alt || ''}
          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
        />
      )}
      {image.caption && (
        <div style={{
          padding: '8px 10px',
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          {image.caption}
        </div>
      )}
    </div>
  )
}

// ── Rapport bar ──────────────────────────────────────────────────────────
function RapportBar({ rapport }) {
  const band = rapportBand(rapport)
  const pct  = ((rapport + 10) / 20) * 100  // -10..+10 → 0..100%
  const color = band === 'warm' ? '#4dffac' : band === 'cold' ? '#ff4d5e' : '#f5c400'

  return (
    <div style={{
      padding: '8px 14px 6px 14px',
      background: 'rgba(0,0,0,0.25)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        Rapport
      </span>
      <div style={{
        flex: 1, height: '3px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.6s ease, background 0.4s ease',
          boxShadow: `0 0 6px ${color}`,
        }}/>
      </div>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color, letterSpacing: '0.04em', textTransform: 'capitalize',
        minWidth: '40px', textAlign: 'right',
      }}>
        {band}
      </span>
    </div>
  )
}

// ── Thread list item ──────────────────────────────────────────────────────
function ThreadRow({ contact, thread, unreadCount, onClick }) {
  const lastMsg = thread[thread.length - 1]
  const preview = lastMsg
    ? (lastMsg.type === 'image' ? '📷 ' + (lastMsg.image?.caption || 'Photo') : lastMsg.content?.slice(0, 60) + (lastMsg.content?.length > 60 ? '…' : ''))
    : 'No messages yet'

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', background: 'none', border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: thread.length ? 'pointer' : 'default',
        textAlign: 'left', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (thread.length) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: `rgba(${contact.color === '#ff4d5e' ? '255,77,94' : contact.color === '#f5c400' ? '245,196,0' : contact.color === '#6699ff' ? '102,153,255' : '68,204,136'}, 0.12)`,
        border: `1.5px solid ${contact.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '15px',
        color: contact.color, flexShrink: 0,
      }}>
        {contact.initials}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
            color: unreadCount ? 'var(--text-h)' : 'rgba(255,255,255,0.5)',
          }}>
            {contact.name}
          </span>
          {lastMsg && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
              {lastMsg.ts}
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: unreadCount ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontStyle: !thread.length ? 'italic' : 'normal',
        }}>
          {preview}
        </div>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#ff4d5e', color: '#0a0d0a',
          fontFamily: 'var(--mono)', fontSize: '9px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  )
}

// ── Chat bubble ──────────────────────────────────────────────────────────
function Bubble({ msg, isPlayer, onImageClick }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isPlayer ? 'flex-end' : 'flex-start',
      marginBottom: '8px',
    }}>
      <div style={{
        maxWidth: '82%',
        background: isPlayer
          ? 'rgba(255,77,94,0.18)'
          : 'rgba(255,255,255,0.05)',
        border: isPlayer
          ? '1px solid rgba(255,77,94,0.3)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: isPlayer
          ? '14px 4px 14px 14px'
          : '4px 14px 14px 14px',
        padding: msg.type === 'image' ? '6px' : '10px 13px',
      }}>
        {msg.type === 'image' && msg.image ? (
          <div>
            <ImageBubble image={msg.image} onClick={() => onImageClick?.(msg.image)} />
            {msg.content && (
              <p style={{
                margin: '8px 4px 2px 4px',
                fontFamily: 'var(--mono)', fontSize: '11px',
                color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
              }}>
                {msg.content}
              </p>
            )}
          </div>
        ) : (
          <p style={{
            margin: 0,
            fontFamily: 'var(--mono)', fontSize: '12px',
            lineHeight: 1.65,
            color: isPlayer ? 'rgba(255,255,255,0.7)' : 'var(--text-h)',
            whiteSpace: 'pre-line',
          }}>
            {msg.content}
          </p>
        )}
        <div style={{
          marginTop: msg.type === 'image' ? '2px' : '5px',
          textAlign: isPlayer ? 'right' : 'left',
          fontFamily: 'var(--mono)', fontSize: '9px',
          color: 'rgba(255,255,255,0.18)',
          padding: msg.type === 'image' ? '0 4px 2px 4px' : '0',
        }}>
          {msg.ts}
        </div>
      </div>
    </div>
  )
}

// ── Reply choices ────────────────────────────────────────────────────────
function ReplyChoices({ options, onPick }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{
      padding: '10px 14px 14px 14px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', gap: '6px',
      flexShrink: 0,
      background: 'rgba(0,0,0,0.3)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: '2px',
      }}>
        Reply
      </div>
      {options.map((opt, i) => (
        <button
          key={opt.id}
          onClick={() => onPick(opt)}
          onMouseEnter={() => setHovered(opt.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            border: `1px solid ${hovered === opt.id ? 'rgba(255,77,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: hovered === opt.id ? 'rgba(255,77,94,0.1)' : 'rgba(255,255,255,0.03)',
            color: hovered === opt.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--mono)', fontSize: '11px',
            textAlign: 'left', cursor: 'pointer',
            lineHeight: 1.5, transition: 'all 0.15s',
          }}
        >
          <span style={{ color: 'rgba(255,77,94,0.6)', marginRight: '8px', fontSize: '9px' }}>
            {['A', 'B', 'C'][i]}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Unit-end binary choice modal ─────────────────────────────────────────
function UnitEndChoice({ choice, onSubmit }) {
  const [hovered, setHovered] = useState(null)
  const [picked, setPicked]   = useState(null)

  function handle(c) {
    setPicked(c.id)
    setTimeout(() => onSubmit(c), 600)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(8,11,8,0.96)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 20px',
      overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#ff4d5e', marginBottom: '6px',
      }}>
        ⚠ Decision Required · Unit I End
      </div>

      {/* Preamble */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '14px',
        marginBottom: '16px',
      }}>
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
          lineHeight: 1.7, color: 'rgba(255,255,255,0.55)',
          whiteSpace: 'pre-line',
        }}>
          {choice.preamble}
        </p>
      </div>

      {/* Context note */}
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.2)', marginBottom: '14px',
        fontStyle: 'italic', textAlign: 'center',
      }}>
        {choice.contextNote}
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {choice.choices.map(c => (
          <button
            key={c.id}
            onClick={() => handle(c)}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            disabled={!!picked}
            style={{
              padding: '16px 18px',
              borderRadius: '12px',
              border: `1px solid ${
                picked === c.id ? c.color : hovered === c.id ? c.color + '88' : 'rgba(255,255,255,0.1)'
              }`,
              background: picked === c.id
                ? `rgba(${c.color === '#4dffac' ? '77,255,172' : '255,77,94'},0.15)`
                : hovered === c.id
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.02)',
              cursor: picked ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              opacity: picked && picked !== c.id ? 0.3 : 1,
            }}
          >
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
              color: picked === c.id ? c.color : hovered === c.id ? c.color : 'rgba(255,255,255,0.7)',
              marginBottom: '5px', transition: 'color 0.2s',
            }}>
              {c.label}
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: 'rgba(255,255,255,0.35)', lineHeight: 1.5,
            }}>
              {c.sub}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Inline image lightbox ────────────────────────────────────────────────
function ImageLightbox({ image, onClose }) {
  const isPlaceholder = image.src?.startsWith('ada:') || image.src?.startsWith('photo:')
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '12px', padding: '20px',
        cursor: 'pointer',
      }}
    >
      {isPlaceholder ? (
        <div style={{
          width: '100%', maxWidth: '320px',
          aspectRatio: '4/3',
          background: 'linear-gradient(135deg, rgba(255,77,94,0.15) 0%, rgba(255,77,94,0.05) 100%)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,77,94,0.2)',
          flexDirection: 'column', gap: '10px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,77,94,0.4)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'rgba(255,77,94,0.4)', letterSpacing: '0.06em',
            textTransform: 'uppercase', textAlign: 'center', padding: '0 20px',
          }}>
            {image.alt || image.src}
          </span>
        </div>
      ) : (
        <img
          src={image.src} alt={image.alt}
          style={{ maxWidth: '100%', maxHeight: '70%', objectFit: 'contain', borderRadius: '8px' }}
        />
      )}
      {image.caption && (
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'rgba(255,255,255,0.45)', textAlign: 'center',
          lineHeight: 1.5, fontStyle: 'italic', maxWidth: '280px',
        }}>
          {image.caption}
        </p>
      )}
      <span style={{
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        tap to close
      </span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function MessagesTab() {
  const {
    contacts, threads, unread, rapport, storyFlags, seededLessons,
    setThread, activeThread, submitReply, submitUnitChoice, clearUnread,
  } = usePdaStore()

  const [view, setView]         = useState('list')  // 'list' | 'chat'
  const [lightbox, setLightbox] = useState(null)    // image object | null
  const [showUnitEnd, setShowUnitEnd] = useState(false)
  const scrollRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (view === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [view, threads, activeThread])

  // Clear unread when opening a thread
  useEffect(() => {
    if (view === 'chat') clearUnread(activeThread)
  }, [view, activeThread])

  function openThread(contactId) {
    setThread(contactId)
    setView('chat')
  }

  // Find the pending reply message — the latest incoming that hasn't been replied to
  const currentThread = threads[activeThread] || []
  const pendingReplyMsg = [...currentThread].reverse().find(
    m => m.replyOptions && !m.replied && (m.type === 'incoming' || m.type === 'image')
  )

  function handleReply(option) {
    if (!pendingReplyMsg) return
    submitReply(activeThread, pendingReplyMsg.id, option)
  }

  function handleUnitEndChoice(unitId, choice) {
    submitUnitChoice(unitId, choice.id, choice.label)
    setShowUnitEnd(false)
  }

  // Find the earliest unit whose lessons are all complete but whose
  // ending choice hasn't been made yet. Units resolve in order — Unit 3's
  // CTA won't appear until Unit 2's ending has been chosen, even if all
  // of Unit 3's lessons are already done.
  const pendingUnitId = UNIT_IDS.find(unitId => {
    const meta = UNIT_END_META[unitId]
    const flagKey = `unit${unitId}_ending`
    const completed = seededLessons.filter(id => id.startsWith(`unit${unitId}-`)).length
    return completed >= meta.lessonCount && !storyFlags[flagKey]
  })
  const pendingMeta = pendingUnitId ? UNIT_END_META[pendingUnitId] : null

  const contact = contacts.find(c => c.id === activeThread)

  // ── Thread list view ────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <RapportBar rapport={rapport} />

        {/* Unit-end CTA if applicable */}
        {pendingMeta && (
          <button
            onClick={() => setShowUnitEnd(true)}
            style={{
              margin: '10px 14px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,77,94,0.4)',
              background: 'rgba(255,77,94,0.07)',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 600,
                color: '#ff4d5e', letterSpacing: '0.04em', marginBottom: '2px',
              }}>
                {pendingMeta.bannerTitle}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                color: 'rgba(255,255,255,0.3)',
              }}>
                {pendingMeta.bannerSub}
              </div>
            </div>
          </button>
        )}

        {contacts.map(c => (
          <ThreadRow
            key={c.id}
            contact={c}
            thread={threads[c.id] || []}
            unreadCount={unread[c.id] || 0}
            onClick={() => threads[c.id]?.length ? openThread(c.id) : null}
          />
        ))}

        {/* Unit-end modal */}
        {showUnitEnd && pendingMeta && (
          <UnitEndChoice
            choice={pendingMeta.choice}
            onSubmit={choice => handleUnitEndChoice(pendingUnitId, choice)}
          />
        )}
      </div>
    )
  }

  // ── Chat view ───────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Chat header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <button
          onClick={() => setView('list')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', padding: '2px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {contact && (
          <>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,77,94,0.12)',
              border: `1.5px solid ${contact.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px',
              color: contact.color, flexShrink: 0,
            }}>
              {contact.initials}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600,
                color: 'var(--text-h)',
              }}>
                {contact.name}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                color: contact.status === 'online' ? '#4dffac' : 'rgba(255,255,255,0.25)',
              }}>
                ● {contact.status}
              </div>
            </div>
          </>
        )}

        {activeThread === 'ada' && (
          <div style={{ marginLeft: 'auto' }}>
            <RapportBar rapport={rapport} />
          </div>
        )}
      </div>

      {/* Message scroll area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '14px 14px 8px 14px',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {currentThread.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'rgba(255,255,255,0.15)', fontStyle: 'italic',
          }}>
            No messages yet
          </div>
        ) : (
          currentThread.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              isPlayer={msg.type === 'reply'}
              onImageClick={setLightbox}
            />
          ))
        )}
      </div>

      {/* Reply choices — only show if there's a pending reply */}
      {pendingReplyMsg && (
        <ReplyChoices options={pendingReplyMsg.replyOptions} onPick={handleReply} />
      )}

      {/* Lightbox */}
      {lightbox && <ImageLightbox image={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}