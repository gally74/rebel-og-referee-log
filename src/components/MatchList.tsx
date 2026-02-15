import { useState, useMemo } from 'react'
import type { Match, Sport } from '../types'
import { updateMatch, deleteMatch } from '../lib/storage'

type FilterReport = 'all' | 'pending' | 'submitted'

interface MatchListProps {
  matches: Match[]
  onRefresh: () => void
  showPendingOnly?: boolean
}

export default function MatchList({ matches, onRefresh, showPendingOnly }: MatchListProps) {
  const [sportFilter, setSportFilter] = useState<Sport | ''>('')
  const [reportFilter, setReportFilter] = useState<FilterReport>(showPendingOnly ? 'pending' : 'all')

  const filtered = useMemo(() => {
    let list = matches
    if (sportFilter) list = list.filter((m) => m.sport === sportFilter)
    if (reportFilter === 'pending') list = list.filter((m) => m.outcome === 'Result' && !m.reportSubmitted)
    if (reportFilter === 'submitted') list = list.filter((m) => m.reportSubmitted)
    return list
  }, [matches, sportFilter, reportFilter])

  const toggleReport = (m: Match) => {
    if (m.outcome !== 'Result') return
    updateMatch(m.id, { reportSubmitted: !m.reportSubmitted })
    onRefresh()
  }

  const handleDelete = (m: Match) => {
    if (!window.confirm(`Delete ${m.date} ${m.team1} v ${m.team2}?`)) return
    deleteMatch(m.id)
    onRefresh()
  }

  const pendingCount = matches.filter((m) => m.outcome === 'Result' && !m.reportSubmitted).length

  return (
    <div style={styles.wrap}>
      {!showPendingOnly && (
        <div style={styles.filters}>
          <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value as Sport | '')} style={styles.select}>
            <option value="">All sports</option>
            <option value="Football">Football</option>
            <option value="Hurling">Hurling</option>
          </select>
          <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value as FilterReport)} style={styles.select}>
            <option value="all">All</option>
            <option value="pending">Pending report ({pendingCount})</option>
            <option value="submitted">Report submitted</option>
          </select>
        </div>
      )}
      {showPendingOnly && pendingCount === 0 && (
        <p style={styles.muted}>No matches with report pending.</p>
      )}
      <ul style={styles.list}>
        {filtered.map((m) => (
          <li key={m.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.date}>{m.date}</span>
              <span style={styles.sport}>{m.sport}</span>
            </div>
            <div style={styles.teams}>{m.team1} v {m.team2}</div>
            <div style={styles.meta}>{m.competition}</div>
            {m.outcome === 'Result' && (
              <div style={styles.scores}>{m.score1} – {m.score2}</div>
            )}
            {m.outcome !== 'Result' && m.notes && (
              <div style={styles.notes}>{m.outcome}: {m.notes}</div>
            )}
            <div style={styles.cardActions}>
              {m.outcome === 'Result' && (
                <button
                  type="button"
                  onClick={() => toggleReport(m)}
                  style={{ ...styles.reportBtn, ...(m.reportSubmitted ? styles.reportSubmitted : {}) }}
                >
                  {m.reportSubmitted ? 'Report submitted' : 'Mark report submitted'}
                </button>
              )}
              <button type="button" onClick={() => handleDelete(m)} style={styles.deleteBtn} aria-label="Delete match">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 16, paddingBottom: 32 },
  filters: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  select: { padding: 8, borderRadius: 8, border: '1px solid var(--bg-card)', background: 'var(--bg)', color: 'var(--text)' },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  card: { background: 'var(--bg-card)', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  date: { fontWeight: 600 },
  sport: { fontSize: 12, color: 'var(--text-muted)' },
  teams: { fontWeight: 600, marginBottom: 4 },
  meta: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 },
  scores: { fontSize: 14, marginBottom: 8 },
  notes: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 },
  cardActions: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 },
  reportBtn: { padding: '6px 12px', borderRadius: 8, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontSize: 13 },
  reportSubmitted: { borderColor: 'var(--success)', color: 'var(--success)' },
  deleteBtn: { padding: '6px 12px', borderRadius: 8, border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontSize: 13 },
  muted: { color: 'var(--text-muted)', padding: 16, margin: 0 },
}
