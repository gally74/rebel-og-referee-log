import type { Match, AdminRow, ComparisonResult } from '../types'

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function sameMatch(m: Match, a: AdminRow): boolean {
  if (m.date !== a.date) return false
  const t1 = norm(m.team1) === norm(a.team1) && norm(m.team2) === norm(a.team2)
  const t2 = norm(m.team1) === norm(a.team2) && norm(m.team2) === norm(a.team1)
  return t1 || t2
}

export function compareWithAdmin(yourMatches: Match[], adminRows: AdminRow[]): ComparisonResult[] {
  const results: ComparisonResult[] = []
  const usedAdmin = new Set<number>()

  for (const match of yourMatches) {
    const adminIdx = adminRows.findIndex((a, i) => !usedAdmin.has(i) && sameMatch(match, a))
    if (adminIdx === -1) {
      results.push({ match, adminRow: null, status: 'only_in_yours' })
      continue
    }
    usedAdmin.add(adminIdx)
    const adminRow = adminRows[adminIdx]
    const reportMismatch = match.outcome === 'Result' && match.reportSubmitted !== adminRow.reportSubmitted
    results.push({
      match,
      adminRow,
      status: reportMismatch ? 'report_mismatch' : 'in_both',
      adminReportSubmitted: adminRow.reportSubmitted,
    })
  }

  adminRows.forEach((a, i) => {
    if (usedAdmin.has(i)) return
    const yourIdx = yourMatches.findIndex((m) => sameMatch(m, a))
    if (yourIdx === -1) {
      results.push({ match: null, adminRow: a, status: 'only_in_admin' })
    }
  })

  return results
}
