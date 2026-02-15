import { useState } from 'react'
import type { ComparisonResult } from '../types'
import { parseAdminExcel } from '../lib/excelParser'
import { compareWithAdmin } from '../lib/comparison'
import { getMatches } from '../lib/storage'

export default function ComparisonView() {
  const [results, setResults] = useState<ComparisonResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const adminRows = await parseAdminExcel(file)
      const yourMatches = getMatches()
      setResults(compareWithAdmin(yourMatches, adminRows))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setResults(null)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const onlyYours = results?.filter((r) => r.status === 'only_in_yours') ?? []
  const onlyAdmin = results?.filter((r) => r.status === 'only_in_admin') ?? []
  const reportMismatch = results?.filter((r) => r.status === 'report_mismatch') ?? []
  const inBoth = results?.filter((r) => r.status === 'in_both') ?? []

  return (
    <div style={styles.wrap}>
      <label style={styles.upload}>
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={loading} style={{ display: 'none' }} />
        {loading ? 'Parsing…' : 'Upload admin Excel (.xlsx)'}
      </label>
      {error && <p style={styles.error}>{error}</p>}
      {results && (
        <div style={styles.sections}>
          {onlyYours.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.h3}>In your log but not in admin – chase payment</h3>
              <ul style={styles.ul}>
                {onlyYours.map((r, i) => r.match && (
                  <li key={i} style={styles.li}>
                    {r.match.date} {r.match.sport}: {r.match.team1} v {r.match.team2} – {r.match.outcome}
                    {r.match.outcome !== 'Result' && r.match.notes && ` (${r.match.notes})`}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {onlyAdmin.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.h3}>In admin but not in your log</h3>
              <ul style={styles.ul}>
                {onlyAdmin.map((r, i) => r.adminRow && (
                  <li key={i} style={styles.li}>
                    {r.adminRow.date}: {r.adminRow.team1} v {r.adminRow.team2}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {reportMismatch.length > 0 && (
            <section style={styles.section}>
              <h3 style={styles.h3}>Report status mismatch (played games)</h3>
              <ul style={styles.ul}>
                {reportMismatch.map((r, i) => r.match && (
                  <li key={i} style={styles.li}>
                    {r.match.date} {r.match.team1} v {r.match.team2}: you {r.match.reportSubmitted ? 'submitted' : 'not submitted'}, admin {r.adminReportSubmitted ? 'submitted' : 'not'}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {inBoth.length > 0 && (
            <p style={styles.muted}>{inBoth.length} match(es) in both and report status agree.</p>
          )}
          {onlyYours.length === 0 && onlyAdmin.length === 0 && reportMismatch.length === 0 && inBoth.length === 0 && (
            <p style={styles.muted}>No rows to show.</p>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 16, maxWidth: 640, margin: '0 auto' },
  upload: { display: 'inline-block', padding: '12px 20px', background: 'var(--accent)', color: 'var(--bg)', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  error: { color: 'var(--danger)', marginTop: 12 },
  sections: { marginTop: 24 },
  section: { marginBottom: 24 },
  h3: { fontSize: 16, marginBottom: 8, color: 'var(--text)' },
  ul: { listStyle: 'none', padding: 0, margin: 0 },
  li: { padding: '8px 0', borderBottom: '1px solid var(--bg-card)', fontSize: 14 },
  muted: { color: 'var(--text-muted)', marginTop: 16 },
}
