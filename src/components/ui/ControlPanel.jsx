/**
 * ControlPanel.jsx
 *
 * The horizontal strip below the TopBar containing the phase stepper.
 * The "open panels" button is removed — InfoPanel is now always visible.
 */
import PhaseIndicator from './PhaseIndicator'

export default function ControlPanel() {
  return (
    <div style={{
      height: '44px',
      background: 'var(--surface-2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <PhaseIndicator />
    </div>
  )
}
