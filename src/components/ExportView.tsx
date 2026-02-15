import { useState, useCallback } from 'react'
import { getMatches, saveMatches } from '../lib/storage'
import { mergeMatches } from '../lib/importMerge'

export default function ExportView() {
  const [restoreResult, setRestoreResult] = useState<{ added: number; skipped: number; total: number } | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const matches = getMatches()

  const handleRestore = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setRestoreError(null)
    setRestoreResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = reader.result
        if (typeof raw !== 'string') {
          setRestoreError('Invalid backup file. Use a JSON file exported from this app.')
          return
        }
        const parsed = JSON.parse(raw) as unknown
        const current = getMatches()
        const { merged, added, skipped } = mergeMatches(current, parsed)
        saveMatches(merged)
        setRestoreResult({ added, skipped, total: merged.length })
      } catch {
        setRestoreError('Invalid backup file. Use a JSON file exported from this app.')
      }
    }
    reader.onerror = () => setRestoreError('Could not read file.')
    reader.readAsText(file)
    e.target.value = ''
  }, [])

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
    <div style={styles.wrap} key={restoreResult ? `${restoreResult.total}` : 'export'}>
      <p style={styles.muted}>Back up your matches. You have {matches.length} match(es) logged.</p>
      <div style={styles.buttons}>
        <button type="button" onClick={downloadJson} style={styles.btn}>Download JSON</button>
        <button type="button" onClick={downloadCsv} style={styles.btn}>Download CSV</button>
      </div>

      <h3 style={styles.h3}>Restore from backup</h3>
      <p style={styles.muted}>Upload a JSON file previously exported from this app. Matches are merged with existing data; duplicates (same date and teams) are kept once, preferring the version with report submitted.</p>
      <label style={styles.uploadLabel}>
        <input type="file" accept=".json,application/json" onChange={handleRestore} style={styles.fileInput} />
        Choose JSON file
      </label>
      {restoreError && <p style={styles.error}>{restoreError}</p>}
      {restoreResult && (
        <p style={styles.success}>
          Restored. Added {restoreResult.added} from backup, {restoreResult.skipped} duplicate(s) skipped. Total: {restoreResult.total} match(es).
        </p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: 16, maxWidth: 480, margin: '0 auto' },
  muted: { color: 'var(--text-muted)', marginBottom: 16 },
  buttons: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  btn: { padding: 12, background: 'var(--bg-card)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, fontWeight: 600 },
  h3: { fontSize: 16, marginTop: 8, marginBottom: 8 },
  uploadLabel: { display: 'inline-block', padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', marginBottom: 12 },
  fileInput: { display: 'none' },
  error: { color: 'var(--danger)', marginTop: 8, marginBottom: 0 },
  success: { color: 'var(--success)', marginTop: 8, marginBottom: 0 },
}
