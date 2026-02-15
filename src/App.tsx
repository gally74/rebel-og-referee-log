import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import MatchForm from './components/MatchForm'
import MatchList from './components/MatchList'
import ComparisonView from './components/ComparisonView'
import ExportView from './components/ExportView'
import { getMatches } from './lib/storage'

function Layout() {
  const location = useLocation()
  const [refreshKey, setRefreshKey] = useState(0)
  const matches = getMatches()
  const pendingCount = matches.filter((m) => m.outcome === 'Result' && !m.reportSubmitted).length

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const nav = [
    { path: '/', label: 'Log' },
    { path: '/matches', label: 'My matches' },
    { path: '/pending', label: `Pending (${pendingCount})` },
    { path: '/compare', label: 'Compare' },
    { path: '/export', label: 'Export' },
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <nav style={navStyle}>
        {nav.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            style={{
              ...navLinkStyle,
              ...(location.pathname === path ? navLinkActive : {}),
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
      {pendingCount > 0 && location.pathname !== '/pending' && (
        <div style={reminderBannerStyle}>
          You have {pendingCount} match{pendingCount !== 1 ? 'es' : ''} with report not yet submitted.{' '}
          <Link to="/pending" style={reminderLinkStyle}>View and mark submitted</Link>
        </div>
      )}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MatchForm onSaved={refresh} />} />
          <Route path="/matches" element={<MatchList key={refreshKey} matches={getMatches()} onRefresh={refresh} />} />
          <Route path="/pending" element={<MatchList key={refreshKey} matches={getMatches()} onRefresh={refresh} showPendingOnly />} />
          <Route path="/compare" element={<ComparisonView />} />
          <Route path="/export" element={<ExportView />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  padding: 12,
  background: 'var(--bg-card)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}

const navLinkStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  color: 'var(--text-muted)',
  textDecoration: 'none',
  fontSize: 14,
}

const navLinkActive: React.CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--bg)',
}

const reminderBannerStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'rgba(86, 156, 214, 0.12)',
  borderBottom: '1px solid var(--accent)',
  fontSize: 14,
  color: 'var(--text)',
}

const reminderLinkStyle: React.CSSProperties = {
  color: 'var(--accent)',
  fontWeight: 600,
  textDecoration: 'underline',
}
