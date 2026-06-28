/**
 * KMapWidget.jsx
 *
 * Interactive K-Map panel for GateLab lessons 07–09.
 * Powered by kmapEngine.js (extracted from KMapX).
 *
 * Props:
 *   config   {object}  Lesson kmap config (see below)
 *   onSolve  {fn}      Called with { simplified } when the player's
 *                      answer matches the expected simplified expression.
 *   theme    {object}  GateLab theme tokens from useGateTheme()
 *
 * Config shape (from lesson file):
 * {
 *   variables:  2 | 3 | 4           — how many variables (controls grid size)
 *   expression: 'AB + A\'B\' + ...' — the pre-loaded expression string
 *   answer:     'A'                  — expected simplified SOP (canonical form)
 *   dontCares:  [3, 5]              — optional don't-care minterms
 *   mode:  'read'  | 'simplify'     — 'read' shows work phase, 'simplify' is try
 * }
 *
 * Modes:
 *   read       → shows pre-computed grid (work/break phase)
 *   simplify   → player enters expression, engine verifies (try phase)
 */

import { useState, useMemo } from 'react'
import {
  simplifyExpression,
  KMAP_COORDS,
  REVERSE_COORDS,
  CD_LABELS,
  AB_LABELS,
  GROUP_COLORS,
} from '../../utils/kmapEngine'

// ── Sub-components ─────────────────────────────────────────────────────────────

function KMapCell({ value, groupIdx, minterm, theme, onClick, isClickable }) {
  const isOne  = value === 1
  const isDC   = value === 'x'
  const inGrp  = groupIdx !== undefined

  const bg = inGrp
    ? `${GROUP_COLORS[groupIdx % GROUP_COLORS.length]}22`
    : 'transparent'

  const borderColor = inGrp
    ? GROUP_COLORS[groupIdx % GROUP_COLORS.length]
    : (theme?.border || 'rgba(255,255,255,0.12)')

  const valColor = isOne
    ? (theme?.accent || '#00FFB2')
    : isDC
    ? (theme?.textMuted || '#4a5248')
    : (theme?.textMuted || '#4a5248')

  return (
    <td
      onClick={isClickable ? onClick : undefined}
      style={{
        width: 64,
        height: 56,
        textAlign: 'center',
        position: 'relative',
        background: bg,
        border: `1px solid ${borderColor}`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
    >
      <span style={{
        display: 'block',
        fontSize: 20,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        color: valColor,
        lineHeight: 1,
        marginBottom: 2,
      }}>
        {isDC ? 'X' : value}
      </span>
      <span style={{
        display: 'block',
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        color: theme?.textMuted || '#4a5248',
        opacity: 0.7,
      }}>
        m{minterm}
      </span>
    </td>
  )
}

function KMapGrid({ minterms, dcMinterms, groups, onCellClick, clickable, theme }) {
  const mintermSet = new Set(minterms)
  const dcSet = new Set(dcMinterms || [])

  // cell → group index
  const cellGroup = {}
  groups.forEach((g, gi) => {
    g.cells.forEach(([r, c]) => { cellGroup[`${r},${c}`] = gi })
  })

  const grid = Array.from({ length: 4 }, () => Array(4).fill(0))
  minterms.forEach(m => {
    const [r, c] = KMAP_COORDS[m]
    grid[r][c] = 1
  })
  dcMinterms?.forEach(m => {
    const coord = KMAP_COORDS[m]
    if (coord) grid[coord[0]][coord[1]] = 'x'
  })

  const headerStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: theme?.textMuted || '#4a5248',
    padding: '4px 8px',
    fontWeight: 400,
    border: `1px solid ${theme?.border || 'rgba(255,255,255,0.08)'}`,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
      {/* CD axis label */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: theme?.textMuted || '#4a5248',
        letterSpacing: 2,
        marginLeft: 56,
      }}>
        CD →
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {/* AB label */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: theme?.textMuted || '#4a5248',
          letterSpacing: 2,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          marginTop: 24,
        }}>
          AB ↓
        </div>

        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerStyle}> </th>
              {CD_LABELS.map(l => (
                <th key={l} style={{ ...headerStyle, width: 64 }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0,1,2,3].map(r => (
              <tr key={r}>
                <th style={headerStyle}>{AB_LABELS[r]}</th>
                {[0,1,2,3].map(c => {
                  const m = REVERSE_COORDS[`${r},${c}`]
                  const gIdx = cellGroup[`${r},${c}`]
                  return (
                    <KMapCell
                      key={c}
                      value={grid[r][c]}
                      groupIdx={gIdx}
                      minterm={m}
                      theme={theme}
                      isClickable={clickable}
                      onClick={() => onCellClick?.(m, grid[r][c])}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group legend */}
      {groups.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, marginLeft: 56 }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: GROUP_COLORS[gi % GROUP_COLORS.length],
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: theme?.accent || '#00FFB2',
              }}>
                {g.expression}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: theme?.textMuted || '#4a5248',
              }}>
                ({g.minterms.join(',')})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Widget ─────────────────────────────────────────────────────────────────

export default function KMapWidget({ config, onSolve, theme }) {
  const { expression, answer, dontCares = [], mode = 'read' } = config || {}

  const [playerExpr, setPlayerExpr] = useState('')
  const [result, setResult]         = useState(null)  // null | 'correct' | 'wrong'
  const [playerGroups, setPlayerGroups] = useState(null)

  // Pre-compute the "work" display from the lesson expression
  const precomputed = useMemo(() => {
    if (!expression) return { minterms: [], dcMinterms: [], groups: [], simplified: '' }
    try {
      return simplifyExpression(expression + (dontCares.length ? `+d(${dontCares.join(',')})` : ''))
    } catch {
      return { minterms: [], dcMinterms: [], groups: [], simplified: '' }
    }
  }, [expression, dontCares])

  function handleSimplify() {
    if (!playerExpr.trim()) return
    try {
      const res = simplifyExpression(playerExpr)
      setPlayerGroups(res)
      // Normalize answer comparison: strip spaces, sort terms
      const normalize = s => s.replace(/\s/g,'').split('+').sort().join('+')
      const correct = normalize(res.simplified) === normalize(answer || precomputed.simplified)
      setResult(correct ? 'correct' : 'wrong')
      if (correct) onSolve?.({ simplified: res.simplified })
    } catch {
      setResult('wrong')
    }
  }

  const isTry = mode === 'simplify'
  const displayData = (isTry && playerGroups) ? playerGroups : precomputed

  const t = theme || {}
  const surface  = t.surface  || '#0d120d'
  const border   = t.border   || 'rgba(255,255,255,0.1)'
  const accent   = t.accent   || '#00FFB2'
  const textH    = t.textH    || '#eef2ee'
  const textMuted = t.textMuted || '#4a5248'
  const accentDim = t.accentDim || 'rgba(0,255,136,0.1)'

  return (
    <div style={{
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>

      {/* Expression display */}
      <div style={{
        background: accentDim,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: '10px 16px',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: textMuted,
          letterSpacing: 2,
          marginBottom: 6,
        }}>
          EXPRESSION
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15,
          color: textH,
        }}>
          f = {expression}
          {dontCares.length > 0 && (
            <span style={{ color: textMuted }}> + d({dontCares.join(',')})</span>
          )}
        </div>
        {precomputed.minterms.length > 0 && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: textMuted,
            marginTop: 4,
          }}>
            minterms: Σ({precomputed.minterms.sort((a,b)=>a-b).join(', ')})
          </div>
        )}
      </div>

      {/* K-Map grid */}
      <KMapGrid
        minterms={displayData.minterms}
        dcMinterms={displayData.dcMinterms}
        groups={displayData.groups}
        theme={theme}
        clickable={false}
      />

      {/* Simplified result */}
      {!isTry && (
        <div style={{
          background: accentDim,
          border: `1px solid ${accent}44`,
          borderRadius: 8,
          padding: '10px 16px',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: textMuted,
            letterSpacing: 2,
            marginBottom: 6,
          }}>
            SIMPLIFIED
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            color: accent,
            fontWeight: 600,
          }}>
            f = {precomputed.simplified}
          </div>
        </div>
      )}

      {/* Try mode — player input */}
      {isTry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: textMuted,
            letterSpacing: 2,
          }}>
            SIMPLIFY THE EXPRESSION
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              color: textH,
              alignSelf: 'center',
              flexShrink: 0,
            }}>
              f =
            </span>
            <input
              value={playerExpr}
              onChange={e => { setPlayerExpr(e.target.value); setResult(null); setPlayerGroups(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSimplify()}
              placeholder="AB + C'D + ..."
              style={{
                flex: 1,
                background: surface,
                border: `1px solid ${result === 'correct' ? accent : result === 'wrong' ? '#ff4060' : border}`,
                borderRadius: 6,
                padding: '8px 12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: textH,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
            />
            <button
              onClick={handleSimplify}
              style={{
                background: accentDim,
                border: `1px solid ${accent}`,
                borderRadius: 6,
                padding: '8px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: accent,
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              CHECK
            </button>
          </div>

          {result === 'correct' && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: accent,
              padding: '8px 12px',
              background: `${accent}11`,
              border: `1px solid ${accent}44`,
              borderRadius: 6,
            }}>
              ✓ Correct — simplified form: f = {playerGroups?.simplified}
            </div>
          )}
          {result === 'wrong' && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: '#ff4060',
              padding: '8px 12px',
              background: 'rgba(255,64,96,0.08)',
              border: '1px solid rgba(255,64,96,0.3)',
              borderRadius: 6,
            }}>
              ✗ Not quite. Check your groupings above and try again.
            </div>
          )}

          {playerGroups && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: textMuted,
            }}>
              Engine got: <span style={{ color: textH }}>{playerGroups.simplified}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}