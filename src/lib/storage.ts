import type { Match } from '../types'

const STORAGE_KEY = 'gaa-referee-matches'

export function getMatches(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Match[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveMatches(matches: Match[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
}

export function addMatch(match: Omit<Match, 'id' | 'createdAt'>): Match {
  const matches = getMatches()
  const newMatch: Match = {
    ...match,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  matches.push(newMatch)
  matches.sort((a, b) => b.date.localeCompare(a.date))
  saveMatches(matches)
  return newMatch
}

export function updateMatch(id: string, updates: Partial<Match>): Match | null {
  const matches = getMatches()
  const i = matches.findIndex((m) => m.id === id)
  if (i === -1) return null
  matches[i] = { ...matches[i], ...updates }
  saveMatches(matches)
  return matches[i]
}

export function deleteMatch(id: string): boolean {
  const matches = getMatches().filter((m) => m.id !== id)
  if (matches.length === getMatches().length) return false
  saveMatches(matches)
  return true
}

export function getCompetitions(): string[] {
  const matches = getMatches()
  const set = new Set(matches.map((m) => m.competition).filter(Boolean))
  return [...set].sort()
}
