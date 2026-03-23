import { useState } from 'react'

type Stats = {
  short_code: string
  original_url: string
  click_count: number
  created_at: string
}

export default function StatsPanel() {
  const [code, setCode] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStats(null)

    const input = code.trim()
    // Accept either a full short URL or just the code
    const shortCode = input.startsWith('http') ? input.split('/').pop()! : input

    try {
      const res = await fetch(`/api/stats/${shortCode}`)
      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.error ?? 'Not found')
        return
      }

      setStats(data as Stats)
    } catch {
      setLoading(false)
      setError('Failed to load stats: Failed to fetch')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 text-left">
        Enter a short code or full short URL to view its analytics.
      </p>

      <form onSubmit={handleLookup} className="flex gap-2">
        <div className="flex-1 flex items-center rounded-xl px-4 gap-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <input
            type="text"
            required
            placeholder={`abc or ${window.location.origin}/abc`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 py-3 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#2dd4bf' }}
        >
          {loading ? '…' : (
            <>
              View Stats
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400 text-left">{error}</p>
      )}

      {stats && (
        <div className="rounded-xl overflow-hidden text-left" style={{ border: '1px solid #2a2a2a' }}>
          <div className="px-5 py-5 text-center" style={{ backgroundColor: '#0f1f1e' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total clicks</p>
            <p className="text-5xl font-bold text-cyan-400">{stats.click_count}</p>
          </div>
          <div className="px-5 py-4 space-y-3" style={{ backgroundColor: '#111' }}>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Short code</p>
              <p className="text-sm font-mono text-gray-200">{stats.short_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Original URL</p>
              <a href={stats.original_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 truncate block">
                {stats.original_url}
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Created</p>
              <p className="text-sm text-gray-300">{new Date(stats.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
