import { useState } from 'react'
import type { Sport, Outcome } from '../types'
import { addMatch, getCompetitions } from '../lib/storage'

const SPORTS: Sport[] = ['Football', 'Hurling']
const OUTCOMES: Outcome[] = ['Result', 'Game Off', 'Conceded', 'Fixture']

const today = () => new Date().toISOString().slice(0, 10)

interface MatchFormProps {
  onSaved?: () => void
  competitions?: string[]
}

export default function MatchForm({ onSaved, competitions: propCompetitions }: MatchFormProps) {
  const [sport, setSport] = useState<Sport>('Football')
  const [date, setDate] = useState(today())
  const [competition, setCompetition] = useState('')
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [location, setLocation] = useState('')
  const [goals1, setGoals1] = useState('')
  const [points1, setPoints1] = useState('')
  const [goals2, setGoals2] = useState('')
  const [points2, setPoints2] = useState('')
  const [outcome, setOutcome] = useState<Outcome>('Result')
  const [notes, setNotes] = useState('')
  const compList = propCompetitions ?? getCompetitions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const g1 = goals1.trim()
    const p1 = points1.trim()
    const g2 = goals2.trim()
    const p2 = points2.trim()
    const score1Str = !g1 && !p1 ? '–' : `${Number(g1) || 0}(${Number(p1) || 0})`
    const score2Str = !g2 && !p2 ? '–' : `${Number(g2) || 0}(${Number(p2) || 0})`
    addMatch({
      sport,
      date,
      competition: competition.trim(),
      team1: team1.trim(),
      team2: team2.trim(),
      location: location.trim() || undefined,
      score1: score1Str,
      score2: score2Str,
      reportSubmitted: false,
      outcome,
      notes: notes.trim() || undefined,
    })
    setDate(today())
    setCompetition('')
    setTeam1('')
    setTeam2('')
    setLocation('')
    setGoals1('')
    setPoints1('')
    setGoals2('')
    setPoints2('')
    setOutcome('Result')
    setNotes('')
    onSaved?.()
  }

  const isCallOff = outcome !== 'Result'

  const total1 = 3 * (Number(goals1) || 0) + (Number(points1) || 0)
  const total2 = 3 * (Number(goals2) || 0) + (Number(points2) || 0)
  const diff = Math.abs(total1 - total2)
  const resultLine =
    total1 === total2
      ? `Draw (${total1}–${total2})`
      : total1 > total2
        ? `${team1 || 'Team 1'} won by ${diff} pt${diff !== 1 ? 's' : ''}`
        : `${team2 || 'Team 2'} won by ${diff} pt${diff !== 1 ? 's' : ''}`

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <label style={styles.label}>Sport</label>
        <select value={sport} onChange={(e) => setSport(e.target.value as Sport)} style={styles.input}>
          {SPORTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} required />
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Competition</label>
        <input
          list="competitions"
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          style={styles.input}
          placeholder="e.g. Rebel Og East Fe16 Division 3"
        />
        <datalist id="competitions">
          {compList.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Team 1</label>
        <input value={team1} onChange={(e) => setTeam1(e.target.value)} style={styles.input} required />
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Team 2</label>
        <input value={team2} onChange={(e) => setTeam2(e.target.value)} style={styles.input} required />
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Location (optional)</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} style={styles.input} placeholder="Venue" />
      </div>
      <div style={styles.row}>
        <label style={styles.label}>Outcome</label>
        <select value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} style={styles.input}>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      {!isCallOff && (
        <div style={styles.row}>
          <p style={styles.hint}>1 goal = 3 points, 1 point = 1. Leave blank if no score.</p>
          <div style={styles.scoreGrid}>
            <div style={styles.scoreBlock}>
              <div style={styles.scoreBlockLabel}>{team1 || 'Team 1'}</div>
              <div style={styles.scoreInputRow}>
                <label style={styles.smallLabel}>Goals</label>
                <input type="number" min={0} value={goals1} onChange={(e) => setGoals1(e.target.value)} style={styles.scoreInput} placeholder="0" />
              </div>
              <div style={styles.scoreInputRow}>
                <label style={styles.smallLabel}>Points</label>
                <input type="number" min={0} value={points1} onChange={(e) => setPoints1(e.target.value)} style={styles.scoreInput} placeholder="0" />
              </div>
              <div style={styles.totalLine}>Total: {total1} pts</div>
            </div>
            <div style={styles.scoreBlock}>
              <div style={styles.scoreBlockLabel}>{team2 || 'Team 2'}</div>
              <div style={styles.scoreInputRow}>
                <label style={styles.smallLabel}>Goals</label>
                <input type="number" min={0} value={goals2} onChange={(e) => setGoals2(e.target.value)} style={styles.scoreInput} placeholder="0" />
              </div>
              <div style={styles.scoreInputRow}>
                <label style={styles.smallLabel}>Points</label>
                <input type="number" min={0} value={points2} onChange={(e) => setPoints2(e.target.value)} style={styles.scoreInput} placeholder="0" />
              </div>
              <div style={styles.totalLine}>Total: {total2} pts</div>
            </div>
          </div>
          <div style={styles.resultLine}>{resultLine}</div>
        </div>
      )}
      {isCallOff && (
        <div style={styles.row}>
          <label style={styles.label}>Reason not played</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.input}
            placeholder="e.g. Pitches Unplayable, Team Conceded"
          />
        </div>
      )}
      {!isCallOff && notes !== '' && (
        <div style={styles.row}>
          <label style={styles.label}>Notes</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} style={styles.input} />
        </div>
      )}
      <button type="submit" style={styles.button}>Add match</button>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: { padding: 16, maxWidth: 480, margin: '0 auto' },
  row: { marginBottom: 12 },
  label: { display: 'block', marginBottom: 4, fontSize: 14, color: 'var(--text-muted)' },
  hint: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, marginTop: 0 },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--bg-card)', background: 'var(--bg)', color: 'var(--text)' },
  scoreGrid: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  scoreBlock: { flex: 1, minWidth: 120 },
  scoreBlockLabel: { fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text)' },
  scoreInputRow: { marginBottom: 8 },
  smallLabel: { display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 },
  scoreInput: { width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--bg-card)', background: 'var(--bg)', color: 'var(--text)' },
  totalLine: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 6 },
  resultLine: { marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  button: { marginTop: 16, width: '100%', padding: 12, background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 600 },
}
