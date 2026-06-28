/**
 * kmapEngine.js
 *
 * Pure Boolean/K-Map logic engine — extracted from KMapX (Omega Mu Gamma Studio).
 * No DOM, no side effects. Safe to import anywhere in GateLab.
 *
 * Exports:
 *   parseExpression(expr)           → string[] of canonical SOP terms
 *   toSOP(terms)                    → string[] of fully-expanded minterm strings
 *   getMinterms(sopTerms)           → number[] of minterm indices
 *   parseDontCareList(expr)         → number[] of don't-care indices
 *   analyzeKMap(minterms, dcList)   → Group[]
 *   groupsToSOP(groups)             → simplified SOP string
 *   groupToExpression(mintsArr)     → term string like "AB'" or "CD"
 *   KMAP_COORDS                     → minterm → [row, col]
 *   REVERSE_COORDS                  → "row,col" → minterm
 *   GROUP_COLORS                    → color palette array
 */

// ── Constants ──────────────────────────────────────────────────────────────────

export const MINTERM_MAP = {
  "A'B'C'D'":0, "A'B'C'D":1,  "A'B'CD'":2,  "A'B'CD":3,
  "A'BC'D'":4,  "A'BC'D":5,   "A'BCD'":6,   "A'BCD":7,
  "AB'C'D'":8,  "AB'C'D":9,   "AB'CD'":10,  "AB'CD":11,
  "ABC'D'":12,  "ABC'D":13,   "ABCD'":14,   "ABCD":15,
}

// Gray-code layout: minterm → [row, col]
export const KMAP_COORDS = {
   0:[0,0], 1:[0,1], 3:[0,2], 2:[0,3],
   4:[1,0], 5:[1,1], 7:[1,2], 6:[1,3],
  12:[2,0],13:[2,1],15:[2,2],14:[2,3],
   8:[3,0], 9:[3,1],11:[3,2],10:[3,3],
}

export const REVERSE_COORDS = {}
for (const [m, rc] of Object.entries(KMAP_COORDS)) {
  REVERSE_COORDS[`${rc[0]},${rc[1]}`] = parseInt(m)
}

export const CD_LABELS = ['00','01','11','10']
export const AB_LABELS = ['00','01','11','10']

export const GROUP_COLORS = [
  '#00FFB2','#FF4060','#00C8FF','#FFD060',
  '#9B70FF','#FF9040','#40FFE0','#FF60B0',
]

// ── Parser ─────────────────────────────────────────────────────────────────────

export function parseDontCareList(expr) {
  const dcNums = []
  const re = /d\(([^)]*)\)/gi
  let m
  while ((m = re.exec(expr)) !== null) {
    m[1].split(',').forEach(s => {
      const n = parseInt(s.trim(), 10)
      if (!isNaN(n) && n >= 0 && n <= 15) dcNums.push(n)
    })
  }
  return [...new Set(dcNums)]
}

export function stripDontCares(expr) {
  return expr.replace(/\+?\s*d\([^)]*\)/gi, '').replace(/^\s*\+/, '').trim()
}

export function parseExpression(expr) {
  expr = expr.replace(/\s+/g, '')
  const cleanExpr = stripDontCares(expr)
  const terms = cleanExpr.split('+').filter(Boolean)
  const result = []
  for (const term of terms) {
    let A = '', B = '', C = '', D = ''
    let i = 0
    while (i < term.length) {
      const c = term[i]
      if ('ABCD'.includes(c)) {
        const val = (i + 1 < term.length && term[i + 1] === "'")
          ? (i += 2, c + "'") : (i++, c)
        if (c === 'A') A = val
        else if (c === 'B') B = val
        else if (c === 'C') C = val
        else if (c === 'D') D = val
      } else { i++ }
    }
    const t = A + B + C + D
    if (t) result.push(t)
  }
  return result
}

export function expandTerm(term) {
  const vars = ['A','B','C','D']
  const present = {}
  let i = 0
  while (i < term.length) {
    const c = term[i]
    if ('ABCD'.includes(c)) {
      if (i + 1 < term.length && term[i + 1] === "'") { present[c] = 0; i += 2 }
      else { present[c] = 1; i++ }
    } else { i++ }
  }
  const missing = vars.filter(v => !(v in present))
  const results = []
  function recurse(idx, cur) {
    if (idx === missing.length) {
      const parts = vars.map(v => {
        const val = (v in cur) ? cur[v] : present[v]
        return val === 1 ? v : v + "'"
      })
      results.push(parts.join(''))
      return
    }
    const v = missing[idx]
    recurse(idx + 1, { ...cur, [v]: 1 })
    recurse(idx + 1, { ...cur, [v]: 0 })
  }
  recurse(0, {})
  return results
}

export function toSOP(terms) {
  const expanded = []
  for (const t of terms) {
    if (t in MINTERM_MAP) expanded.push(t)
    else expanded.push(...expandTerm(t))
  }
  return [...new Set(expanded)]
}

export function getMinterms(sopTerms) {
  return [...new Set(
    sopTerms.filter(t => t in MINTERM_MAP).map(t => MINTERM_MAP[t])
  )]
}

// ── Quine-McCluskey Engine ─────────────────────────────────────────────────────

export function mintermToBinary(m) {
  return [(m >> 3) & 1, (m >> 2) & 1, (m >> 1) & 1, m & 1]
}

export function findPrimeImplicants(minterms) {
  if (!minterms.length) return []
  let current = new Set(minterms.map(m => JSON.stringify([m])))
  const primeImplicants = new Set()

  while (true) {
    const nextGen = new Set()
    const used = new Set()
    const groups = [...current].map(s => JSON.parse(s))

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const g1 = groups[i], g2 = groups[j]
        if (g1.length !== g2.length) continue
        const s1 = [...g1].sort((a, b) => a - b)
        const s2 = [...g2].sort((a, b) => a - b)
        const xors = s1.map((a, k) => a ^ s2[k])
        if (new Set(xors).size === 1 && xors[0] !== 0 && (xors[0] & (xors[0] - 1)) === 0) {
          const combined = [...new Set([...g1, ...g2])].sort((a, b) => a - b)
          nextGen.add(JSON.stringify(combined))
          used.add(JSON.stringify(s1))
          used.add(JSON.stringify(s2))
        }
      }
    }

    for (const g of groups) {
      const key = JSON.stringify([...g].sort((a, b) => a - b))
      if (!used.has(key)) primeImplicants.add(JSON.stringify(g))
    }

    if (!nextGen.size) break
    current = nextGen
  }

  return [...primeImplicants].map(s => JSON.parse(s))
}

export function findEssentialPIs(pis, onMinterms, dcMinterms = []) {
  if (!onMinterms.length) return []
  let remaining = new Set(onMinterms)
  let available = pis.map(pi => new Set(pi))
  const selected = []

  while (remaining.size > 0) {
    let essential = null
    for (const m of remaining) {
      const covers = available.filter(pi => pi.has(m))
      if (covers.length === 1) { essential = covers[0]; break }
    }
    if (essential) {
      selected.push(essential)
      available = available.filter(pi => pi !== essential)
      for (const m of essential) remaining.delete(m)
    } else {
      const best = available.reduce((a, b) =>
        [...b].filter(m => remaining.has(m)).length >
        [...a].filter(m => remaining.has(m)).length ? b : a
      )
      selected.push(best)
      available = available.filter(pi => pi !== best)
      for (const m of best) remaining.delete(m)
    }
  }
  return selected
}

export function groupToExpression(mintermsArr) {
  if (!mintermsArr.length) return ''
  const bins = mintermsArr.map(mintermToBinary)
  const vars = ['A','B','C','D']
  const terms = []
  for (let i = 0; i < 4; i++) {
    const vals = bins.map(b => b[i])
    if (vals.every(v => v === 1)) terms.push(vars[i])
    else if (vals.every(v => v === 0)) terms.push(vars[i] + "'")
  }
  return terms.join('') || '1'
}

export function analyzeKMap(minterms, dcMinterms = []) {
  if (!minterms.length) return []
  const allForGrouping = [...new Set([...minterms, ...dcMinterms])]
  const pis = findPrimeImplicants(allForGrouping)
  const cover = findEssentialPIs(pis, minterms, dcMinterms)
  return cover.map(piSet => {
    const mList = [...piSet].sort((a, b) => a - b)
    return {
      minterms: mList,
      cells: mList.map(m => KMAP_COORDS[m]).filter(Boolean),
      expression: groupToExpression(mList),
      size: mList.length,
    }
  })
}

export function groupsToSOP(groups) {
  if (!groups.length) return '0'
  const exprs = []
  for (const g of groups) {
    if (g.expression === '1') return '1'
    if (g.expression && !exprs.includes(g.expression)) exprs.push(g.expression)
  }
  return exprs.join(' + ') || '0'
}

/**
 * Convenience: parse a full expression string end-to-end and return
 * { minterms, dcMinterms, groups, simplified }
 */
export function simplifyExpression(expr) {
  const dcMinterms = parseDontCareList(expr)
  const parsed     = parseExpression(expr)
  const sopTerms   = toSOP(parsed)
  const minterms   = getMinterms(sopTerms)
  const dcFiltered = dcMinterms.filter(m => !minterms.includes(m))
  const groups     = analyzeKMap(minterms, dcFiltered)
  const simplified = groupsToSOP(groups)
  return { minterms, dcMinterms: dcFiltered, groups, simplified }
}