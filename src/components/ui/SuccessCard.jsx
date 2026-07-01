/**
 * SuccessCard.jsx
 *
 * Overlay shown when the OUTPUT node goes HIGH in try phase.
 * Auto-dismisses after 4 seconds or on button click.
 * Reads narrative.success and narrative.lore from lessonStore.
 *
 * Also triggers the PDA lesson-complete hook so Ada's post-lesson
 * message is queued and the Notes log gets a new entry.
 */
import { useEffect, useState } from 'react'
import { useLessonStore } from '../../store/lessonStore'
import { useCanvasStore } from '../../store/canvasStore'
import usePdaStore from '../../store/pdaStore'

export default function SuccessCard({ onNext, onDismiss, storyMode }) {
  const { narrative, meta } = useLessonStore()
  const [loreVisible, setLoreVisible] = useState(false)

  // Fade in lore text after 500ms
  useEffect(() => {
    const t = setTimeout(() => setLoreVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => onDismiss?.(), 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const successText = narrative?.success || 'Fault resolved. Circuit restored.'
  const loreText    = narrative?.lore || null
  const workOrder   = meta?.workOrder || null

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10,13,10,0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--accent-border)',
        borderRadius: '16px',
        padding: '36px 44px',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 60px var(--accent-glow), 0 24px 64px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline overlay */}
        <div className="scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '16px' }} />

        {/* Check mark */}
        <div style={{
          fontSize: '28px',
          color: 'var(--accent-text)',
          textShadow: '0 0 20px var(--accent-glow)',
        }}>
          ✓
        </div>

        {/* FAULT RESOLVED */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '18px',
          fontWeight: 500,
          color: 'var(--accent-text)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textShadow: '0 0 14px var(--accent-glow)',
        }}>
          Fault Resolved
        </div>

        {workOrder && (
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}>
            {workOrder} CLOSED
          </div>
        )}

        {/* Success narrative */}
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.6,
          margin: '4px 0',
        }}>
          {successText}
        </p>

        {/* Lore text — fades in after 500ms */}
        {loreText && (
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            fontStyle: 'italic',
            opacity: loreVisible ? 0.7 : 0,
            transition: 'opacity 0.6s ease',
            margin: '0 0 4px',
          }}>
            {loreText}
          </p>
        )}

        {/* Next Lesson button */}
        <button
          onClick={onNext}
          style={{
            marginTop: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            padding: '10px 24px',
            borderRadius: '8px',
            border: '1px solid var(--accent)',
            background: 'var(--accent)',
            color: 'var(--bg)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 0 18px var(--accent-glow)',
          }}
        >
          {storyMode ? 'Back to the Ship →' : 'Next Lesson →'}
        </button>
      </div>
    </div>
  )
}