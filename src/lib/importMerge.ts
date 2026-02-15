import type { Match, Sport, Outcome } from '../types'

const SPORTS: Sport[] = ['Football', 'Hurling']
const OUTCOMES: Outcome[] = ['Result', 'Game Off', 'Conceded', 'Fixture']

function matchKey(m: { date: string; team1: string; team2: string }): string {
  const d = (m.date || '').trim()
  const t1 = (m.team1 || '').trim().toLowerCase()
  const t2 = (m.team2 || '').trim().toLowerCase()
  return `${d}|${t1}|${t2}`
}

function ensureMatch(m: Record<string, unknown>): Match {
  const sport = SPORTS.includes(m.sport as Sport) ? (m.sport as Sport) : 'Football'
  const outcome = OUTCOMES.includes(m.outcome as Outcome) ? (m.outcome as Outcome) : 'Result'
  return {
    id: typeof m.id === 'string' && m.id ? m.id : crypto.randomUUID(),
    sport,
    date: typeof m.date === 'string' ? m.date : '',
    competition: typeof m.competition === 'string' ? m.competition : '',
    team1: typeof m.team1 === 'string' ? m.team1 : '',
    team2: typeof m.team2 === 'string' ? m.team2 : '',
    location: typeof m.location === 'string' ? m.location : undefined,
    score1: typeof m.score1 === 'string' ? m.score1 : '–',
    score2: typeof m.score2 === 'string' ? m.score2 : '–',
    reportSubmitted: Boolean(m.reportSubmitted),
    outcome,
    notes: typeof m.notes === 'string' ? m.notes : undefined,
    createdAt: typeof m.createdAt === 'string' && m.createdAt ? m.createdAt : new Date().toISOString(),
  }
}

function normalizeMatch(raw: unknown): Match | null {
  if (raw == null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const date = o.date != null ? String(o.date) : ''
  const team1 = o.team1 != null ? String(o.team1) : ''
  const team2 = o.team2 != null ? String(o.team2) : ''
  if (!date.trim() || (!team1.trim() && !team2.trim())) return null
  return ensureMatch(o)
}

/** Prefer a over b: true if we should keep a (report submitted wins; else newer createdAt). */
function prefer(a: Match, b: Match): boolean {
  if (a.reportSubmitted && !b.reportSubmitted) return true
  if (!a.reportSubmitted && b.reportSubmitted) return false
  const ta = a.createdAt || ''
  const tb = b.createdAt || ''
  return ta >= tb
}

export interface MergeResult {
  merged: Match[]
  added: number
  skipped: number
}

export function mergeMatches(current: Match[], fromFile: unknown): MergeResult {
  if (!Array.isArray(fromFile)) {
    throw new Error('Invalid backup file')
  }

  const map = new Map<string, Match>()
  for (const m of current) {
    const key = matchKey(m)
    map.set(key, ensureMatch(m as unknown as Record<string, unknown>))
  }

  let added = 0
  let skipped = 0

  for (const raw of fromFile) {
    const m = normalizeMatch(raw)
    if (!m) continue
    const key = matchKey(m)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, m)
      added++
    } else if (prefer(m, existing)) {
      map.set(key, m)
      added++
    } else {
      skipped++
    }
  }

  const merged = [...map.values()]
    .map((m) => ensureMatch(m as unknown as Record<string, unknown>))
    .sort((a, b) => b.date.localeCompare(a.date))

  return { merged, added, skipped }
}
