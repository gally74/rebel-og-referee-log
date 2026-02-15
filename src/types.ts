export type Sport = 'Football' | 'Hurling'

export type Outcome = 'Result' | 'Game Off' | 'Conceded' | 'Fixture'

export interface Match {
  id: string
  sport: Sport
  date: string // ISO YYYY-MM-DD
  competition: string
  team1: string
  team2: string
  location?: string
  score1: string
  score2: string
  reportSubmitted: boolean
  outcome: Outcome
  notes?: string
  createdAt: string // ISO
}

/** One row from the admin Excel (columns A–L) */
export interface AdminRow {
  date: string // normalised ISO
  competition: string
  team1: string
  team2: string
  location?: string
  score1: string
  score2: string
  reportSubmitted: boolean
  gameCalledOff?: string
  reasonNotPlayed?: string
  played?: string
}

export type ComparisonStatus = 'in_both' | 'only_in_yours' | 'only_in_admin' | 'report_mismatch'

export interface ComparisonResult {
  match: Match | null
  adminRow: AdminRow | null
  status: ComparisonStatus
  adminReportSubmitted?: boolean
}
