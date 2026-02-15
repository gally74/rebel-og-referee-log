import { getMatches } from '../lib/storage'

export default function ExportView() {
  const matches = getMatches()

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(matches, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referee-matches-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCsv = () => {
    const headers = ['date', 'sport', 'competition', 'team1', 'team2', 'location', 'score1', 'score2', 'reportSubmitted', 'outcome', 'notes']
    const rows = matches.map((m) =>
      headers.map((h) => {
        const v = m[h as keyof typeof m]
        const s = v === undefined || v === null ? '' : String(v)
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referee-matches-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.wrap}>
      <p style={styles.muted}>Back up your matches. You have {matches.length} match(es) logged.</p>
      <div style={styles.buttons}>
        <button type="button" onClick={downloadJson} style={styles.btn}>Download JSON</button>
        <button type="button" onClick={downloadCsv} style={styles.btn}>Download CSV</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 16, maxWidth: 480, margin: '0 auto' },
  muted: { color: 'var(--text-muted)', marginBottom: 16 },
  buttons: { display: 'flex', flexDirection: 'column', gap: 12 },
  btn: { padding: 12, background: 'var(--bg-card)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, fontWeight: 600 },
}
