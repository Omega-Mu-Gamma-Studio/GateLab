/**
 * useGateTheme
 * Reads the active CSS custom properties from :root so Konva shapes
 * (which can't use CSS vars) always match the UI theme.
 * Re-reads whenever the data-theme attribute changes on <html>.
 */
import { useState, useEffect } from 'react'

function readTokens() {
  const style = getComputedStyle(document.documentElement)
  const get = (v) => style.getPropertyValue(v).trim()
  return {
    accent:       get('--accent')       || '#00ff88',
    accentDim:    get('--accent-dim')   || 'rgba(0,255,136,0.08)',
    accentBorder: get('--accent-border')|| 'rgba(0,255,136,0.30)',
    accentGlow:   get('--accent-glow')  || 'rgba(0,255,136,0.18)',
    accentText:   get('--accent-text')  || '#4dffac',
    surface:      get('--surface')      || '#111411',
    surface2:     get('--surface-2')    || '#161916',
    border:       get('--border-strong')|| 'rgba(255,255,255,0.12)',
    textMuted:    get('--text-muted')   || '#4a5248',
    textH:        get('--text-h')       || '#eef2ee',
    bg:           get('--bg')           || '#0a0d0a',
    accentRgb:    get('--accent-rgb')   || '0, 255, 136',
  }
}

export function useGateTheme() {
  const [tokens, setTokens] = useState(readTokens)

  useEffect(() => {
    const observer = new MutationObserver(() => setTokens(readTokens()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return tokens
}