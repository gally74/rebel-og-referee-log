import * as XLSX from 'xlsx'
import type { AdminRow } from '../types'

/** Parse "Monday 18th March, 2024" or similar to YYYY-MM-DD */
function parseDate(value: unknown): string {
  if (value == null) return ''
  let s = String(value).trim()
  if (!s) return ''
  s = s.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1')
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function cell(sheet: XLSX.WorkSheet, row: number, col: number): string {
  const ref = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = sheet[ref]
  const v = cell?.v
  if (v == null) return ''
  return String(v).trim()
}

/**
 * Admin columns: A=0 Date, B=1 Competition, C=2 Team1, D=3 Team2, E=4 Location,
 * F=5 Score1, G=6 Score2, H=7 Report, I=8 skip, J=9 Game called off?, K=10 Reason, L=11
 */
export function parseAdminExcel(file: File): Promise<AdminRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          resolve([])
          return
        }
        const wb = XLSX.read(data, { type: 'binary' })
        const firstSheet = wb.SheetNames[0]
        if (!firstSheet) {
          resolve([])
          return
        }
        const sheet = wb.Sheets[firstSheet]
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
        const rows: AdminRow[] = []
        for (let r = range.s.r; r <= range.e.r; r++) {
          const dateVal = cell(sheet, r, 0)
          const date = parseDate(dateVal)
          const competition = cell(sheet, r, 1)
          const team1 = cell(sheet, r, 2)
          const team2 = cell(sheet, r, 3)
          if (!team1 && !team2 && !competition) continue
          if (/^(dates?|competition|team|report|played)/i.test(dateVal || competition)) continue
          rows.push({
            date: date || '',
            competition,
            team1,
            team2,
            location: cell(sheet, r, 4) || undefined,
            score1: cell(sheet, r, 5),
            score2: cell(sheet, r, 6),
            reportSubmitted: /submitted/i.test(cell(sheet, r, 7)),
            gameCalledOff: cell(sheet, r, 9) || undefined,
            reasonNotPlayed: cell(sheet, r, 10) || undefined,
            played: cell(sheet, r, 11) || undefined,
          })
        }
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsBinaryString(file)
  })
}
