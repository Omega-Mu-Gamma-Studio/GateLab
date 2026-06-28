/**
 * PlotBox.jsx
 *
 * The story engine. Distinct from the floating ADA/COMMAND DialogueBox
 * (which is ambient, mid-task, draggable) — this is a gate you read once
 * per lesson, framed as a phone/PDA screen rather than a dialogue panel,
 * specifically so it reads as "a device the mechanic is holding" instead
 * of more UI chrome.
 *
 * Behaviour:
 *   - Opens automatically the moment a lesson loads.
 *   - "Continue" dismisses it down to a small tab — doesn't actually
 *     block phase progress, just gets out of the way once read.
 *   - The tab persists for the rest of the lesson; tapping it reopens
 *     the same screen any time, so the recap/objective doubles as a
 *     reference instead of a one-shot intro you can't get back.
 *
 * Content comes from narrative.recap (the "previously on" / onboarding
 * text — new field, separate from narrative.briefing which stays ADA's
 * in-task teaching voice) plus the current phase's task line, so the
 * same screen covers both "what happened" and "what to do."
 */
import { useState, useEffect } from 'react'
import { useLessonStore } from '../../store/lessonStore'

export default function PlotBox() {
  const { phase, narrative, meta, activeUnitId, activeLessonIdx } = useLessonStore()
  const [open, setOpen] = useState(true)

  // Fresh lesson → show the recap again automatically.
  useEffect(() => { setOpen(true) }, [activeUnitId, activeLessonIdx])

  if (!activeUnitId || !narrative) return null

  const recap = narrative.recap
  if (!recap) return null

  const task = phase === 'try' ? narrative.dispatch
    : phase === 'break' ? narrative.fault
    : narrative.briefing

  return (
    <>
      {/* Tab handle — always present once a lesson has a recap, regardless of open state */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Reopen briefing"
          style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 60,
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'var(--surface-2)', border: '1px solid #ff4d5e',
            color: '#ff4d5e', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 16px rgba(255,77,94,0.18)',
          }}
        >
          📱
        </button>
      )}

      {/* Phone screen overlay */}
      {open && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)',
        }}>
          <div style={{
            width: 'min(86%, 340px)',
            height: 'min(80%, 560px)',
            background: '#0a0d0a',
            border: '6px solid #1a1f1a',
            borderRadius: '34px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,77,94,0.25)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Notch */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0 0', flexShrink: 0 }}>
              <div style={{ width: '60px', height: '5px', borderRadius: '999px', background: '#1a1f1a' }} />
            </div>

            {/* Contact header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 18px 12px 18px',
              borderBottom: '1px solid rgba(255,77,94,0.2)',
              flexShrink: 0,
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(255,77,94,0.18)', border: '1px solid #ff4d5e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '13px', color: '#ff4d5e',
                flexShrink: 0,
              }}>
                A
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text-h)' }}>
                  ADA
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: '#ff4d5e', letterSpacing: '0.05em' }}>
                  ● online · Deck 7
                </div>
              </div>
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: 'rgba(255,77,94,0.12)', border: '1px solid rgba(255,77,94,0.3)',
                borderRadius: '4px 14px 14px 14px',
                padding: '11px 14px', maxWidth: '90%', alignSelf: 'flex-start',
              }}>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-h)', whiteSpace: 'pre-line' }}>
                  {recap}
                </p>
              </div>

              {task && (
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '14px 4px 14px 14px',
                  padding: '10px 14px', maxWidth: '90%', alignSelf: 'flex-end',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    TASK · {meta?.workOrder || '—'}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.55, color: 'var(--text)' }}>
                    {task}
                  </p>
                </div>
              )}
            </div>

            {/* Continue button */}
            <div style={{ padding: '10px 16px 16px 16px', flexShrink: 0 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: '12px',
                  background: '#ff4d5e', color: '#0a0d0a',
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '12px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}