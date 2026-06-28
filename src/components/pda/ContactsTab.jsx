/**
 * ContactsTab.jsx
 *
 * Contact cards for all PDA contacts. Ada's card shows rapport.
 * Tapping a contact with messages jumps to their thread in MessagesTab.
 * Contacts without messages show their bio and a "no messages yet" note.
 */
import usePdaStore, { rapportBand } from '../../store/pdaStore'

const STATUS_COLOR = {
  online:  '#4dffac',
  away:    '#f5c400',
  offline: 'rgba(255,255,255,0.2)',
}

function StatusDot({ status }) {
  return (
    <div style={{
      width: '8px', height: '8px', borderRadius: '50%',
      background: STATUS_COLOR[status] || 'rgba(255,255,255,0.2)',
      boxShadow: status === 'online' ? '0 0 6px rgba(77,255,172,0.6)' : 'none',
      flexShrink: 0,
    }}/>
  )
}

function RapportPill({ rapport }) {
  const band  = rapportBand(rapport)
  const color = band === 'warm' ? '#4dffac' : band === 'cold' ? '#ff4d5e' : '#f5c400'
  const pct   = ((rapport + 10) / 20) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '9px',
          color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Rapport
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '9px',
          color, textTransform: 'capitalize',
        }}>
          {band} ({rapport > 0 ? '+' : ''}{rapport})
        </span>
      </div>
      <div style={{
        height: '3px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: color,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 5px ${color}`,
        }}/>
      </div>
    </div>
  )
}

function ContactCard({ contact, thread, rapport, onMessage }) {
  const hasMessages  = thread.length > 0
  const msgCount     = thread.filter(m => m.type !== 'reply').length
  const photoCount   = thread.filter(m => m.type === 'image').length
  const isAda        = contact.id === 'ada'

  return (
    <div style={{
      margin: '10px 14px',
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(${isAda ? '255,77,94' : '255,255,255'}, ${isAda ? '0.15' : '0.06'})`,
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px 12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: `${contact.color}18`,
          border: `2px solid ${contact.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '18px',
          color: contact.color, flexShrink: 0,
          boxShadow: `0 0 16px ${contact.color}22`,
        }}>
          {contact.initials}
        </div>

        {/* Name & role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600,
              color: 'var(--text-h)',
            }}>
              {contact.name}
            </span>
            <StatusDot status={contact.status} />
          </div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'rgba(255,255,255,0.3)', lineHeight: 1.4,
          }}>
            {contact.role}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'rgba(255,255,255,0.4)', lineHeight: 1.65,
        }}>
          {contact.bio}
        </p>
      </div>

      {/* Ada rapport */}
      {isAda && (
        <div style={{ padding: '0 16px 12px 16px' }}>
          <RapportPill rapport={rapport} />
        </div>
      )}

      {/* Stats row */}
      {hasMessages && (
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '10px 16px',
          gap: '16px',
        }}>
          {[
            { label: 'Messages', value: msgCount },
            { label: 'Photos',   value: photoCount },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600,
                color: contact.color,
              }}>
                {stat.value}
              </span>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </span>
            </div>
          ))}

          {/* Message button */}
          <button
            onClick={() => onMessage(contact.id)}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: '8px',
              border: `1px solid ${contact.color}66`,
              background: `${contact.color}12`,
              color: contact.color,
              fontFamily: 'var(--mono)', fontSize: '10px',
              fontWeight: 600, letterSpacing: '0.04em',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${contact.color}22`
              e.currentTarget.style.borderColor = contact.color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${contact.color}12`
              e.currentTarget.style.borderColor = `${contact.color}66`
            }}
          >
            Message →
          </button>
        </div>
      )}

      {/* No messages placeholder */}
      {!hasMessages && (
        <div style={{
          padding: '10px 16px 14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '9px',
            color: 'rgba(255,255,255,0.15)', fontStyle: 'italic',
          }}>
            No messages yet
          </span>
        </div>
      )}
    </div>
  )
}

export default function ContactsTab() {
  const { contacts, threads, rapport, setTab, setThread, openPda } = usePdaStore()

  function goToThread(contactId) {
    setThread(contactId)
    setTab('messages')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Crew · Deck 7
        </span>
      </div>

      {contacts.map(contact => (
        <ContactCard
          key={contact.id}
          contact={contact}
          thread={threads[contact.id] || []}
          rapport={rapport}
          onMessage={goToThread}
        />
      ))}
    </div>
  )
}