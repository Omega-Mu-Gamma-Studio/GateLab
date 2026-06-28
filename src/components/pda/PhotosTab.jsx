/**
 * PhotosTab.jsx
 *
 * Chronological gallery of every image Ada (and eventually other
 * contacts) have sent. Grid layout, tap to open lightbox.
 *
 * Placeholder-aware: until real image assets exist, renders a styled
 * card with the alt text and slug. Once src is a real path, renders
 * <img>. No code changes needed when assets drop in.
 *
 * Empty state is intentional — players who haven't unlocked any photos
 * see a message nudging them to keep working with Ada.
 */
import { useState } from 'react'
import usePdaStore from '../../store/pdaStore'

function isPlaceholder(src) {
  return !src || src.startsWith('ada:') || src.startsWith('photo:')
}

// ── Single grid cell ─────────────────────────────────────────────────────
function PhotoCell({ photo, onClick }) {
  const placeholder = isPlaceholder(photo.src)

  return (
    <div
      onClick={() => onClick(photo)}
      style={{
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,77,94,0.2)',
        background: placeholder
          ? 'linear-gradient(135deg, rgba(255,77,94,0.1) 0%, rgba(255,77,94,0.03) 100%)'
          : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.04)'
        e.currentTarget.style.borderColor = 'rgba(255,77,94,0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = 'rgba(255,77,94,0.2)'
      }}
    >
      {placeholder ? (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '6px', padding: '8px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,77,94,0.4)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '8px',
            color: 'rgba(255,77,94,0.35)',
            letterSpacing: '0.04em', textAlign: 'center',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {photo.alt || photo.src}
          </span>
        </div>
      ) : (
        <img
          src={photo.src} alt={photo.alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Sender badge for non-Ada photos */}
      {photo.senderId !== 'ada' && (
        <div style={{
          position: 'absolute', top: '4px', right: '4px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '4px', padding: '2px 5px',
          fontFamily: 'var(--mono)', fontSize: '8px',
          color: 'rgba(255,255,255,0.5)',
        }}>
          {photo.senderId}
        </div>
      )}
    </div>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({ photo, total, onClose, onPrev, onNext }) {
  const placeholder = isPlaceholder(photo.src)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Navigation row */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0 4px', marginBottom: '12px', flexShrink: 0,
        }}
      >
        <button
          onClick={onPrev}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--mono)', fontSize: '12px',
          }}
        >
          ‹
        </button>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '9px',
          color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em',
        }}>
          {photo.senderId?.toUpperCase()} · {photo.ts}
        </span>
        <button
          onClick={onNext}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--mono)', fontSize: '12px',
          }}
        >
          ›
        </button>
      </div>

      {/* Image / placeholder */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 0,
        }}
      >
        {placeholder ? (
          <div style={{
            width: '100%', maxWidth: '320px',
            aspectRatio: '4/3',
            background: 'linear-gradient(135deg, rgba(255,77,94,0.12) 0%, rgba(255,77,94,0.04) 100%)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,77,94,0.2)',
            flexDirection: 'column', gap: '12px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,77,94,0.4)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '10px',
              color: 'rgba(255,77,94,0.4)', letterSpacing: '0.05em',
              textTransform: 'uppercase', textAlign: 'center', padding: '0 20px',
            }}>
              {photo.alt || photo.src}
            </span>
          </div>
        ) : (
          <img
            src={photo.src} alt={photo.alt}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain', borderRadius: '8px',
            }}
          />
        )}
      </div>

      {/* Caption */}
      {photo.caption && (
        <p
          onClick={e => e.stopPropagation()}
          style={{
            margin: '12px 0 0 0',
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'rgba(255,255,255,0.4)', textAlign: 'center',
            lineHeight: 1.6, fontStyle: 'italic', maxWidth: '280px',
          }}
        >
          {photo.caption}
        </p>
      )}

      <span style={{
        marginTop: '10px',
        fontFamily: 'var(--mono)', fontSize: '9px',
        color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        tap backdrop to close
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function PhotosTab() {
  const gallery = usePdaStore(s => s.gallery)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  if (gallery.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: '12px',
      }}>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'rgba(255,255,255,0.2)', textAlign: 'center',
          lineHeight: 1.6,
        }}>
          No photos yet.
        </p>
        <p style={{
          margin: 0, fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.12)', textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Complete lessons and reply to Ada's messages — she'll share things when she feels like it.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
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
          Gallery
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10px',
          color: 'rgba(255,255,255,0.2)',
        }}>
          {gallery.length} photo{gallery.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3px', padding: '3px',
      }}>
        {gallery.map((photo, i) => (
          <PhotoCell key={photo.id} photo={photo} onClick={() => setLightboxIdx(i)} />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photo={gallery[lightboxIdx]}
          total={gallery.length}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i - 1 + gallery.length) % gallery.length)}
          onNext={() => setLightboxIdx(i => (i + 1) % gallery.length)}
        />
      )}
    </div>
  )
}