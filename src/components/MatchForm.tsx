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
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [outcome, setOutcome] = useState<Outcome>('Result')
  const [notes, setNotes] = useState('')
  const compList = propCompetitions ?? getCompetitions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMatch({
      sport,
      date,
      competition: competition.trim(),
      team1: team1.trim(),
      team2: team2.trim(),
      location: location.trim() || undefined,
      score1: score1.trim() || '–',
      score2: score2.trim() || '–',
      reportSubmitted: false,
      outcome,
      notes: notes.trim() || undefined,
    })
    setDate(today())
    setCompetition('')
    setTeam1('')
    setTeam2('')
    setLocation('')
    setScore1('')
    setScore2('')
    setOutcome('Result')
    setNotes('')
    onSaved?.()
  }

  const isCallOff = outcome !== 'Result'

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
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Team 1 score (goals and points)</label>
              <input value={score1} onChange={(e) => setScore1(e.target.value)} style={styles.input} placeholder="e.g. 1(5)" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Team 2 score (goals and points)</label>
              <input value={score2} onChange={(e) => setScore2(e.target.value)} style={styles.input} placeholder="e.g. 5(11)" />
            </div>
          </div>
          <p style={styles.hint}>Format: goals(points). 1 goal = 3 points, 1 point = 1. e.g. 1(5) = 1 goal, 5 points = 8 total.</p>
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
  hint: { fontSize: 12, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--bg-card)', background: 'var(--bg)', color: 'var(--text)' },
  button: { marginTop: 16, width: '100%', padding: 12, background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 600 },
}
