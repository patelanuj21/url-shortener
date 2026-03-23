import { useState } from 'react'
import ShortenForm from './components/ShortenForm'
import StatsPanel from './components/StatsPanel'

type Tab = 'shorten' | 'stats'

export default function App() {
  const [tab, setTab] = useState<Tab>('shorten')

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a', color: '#fff' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <span className="font-mono text-sm font-semibold tracking-tight">
          <span className="text-cyan-400">&gt;_</span> url.short
        </span>
        <div className="flex items-center gap-6">
          <a
            href="/api/docs"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            API Docs
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            id="postman-link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Postman
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center" style={{ paddingBottom: '8vh' }}>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Shorten any <span className="text-cyan-400">URL</span> instantly
        </h1>
        <p className="text-gray-400 text-base max-w-md mb-10">
          Paste a long URL below and get a short, shareable link. Track clicks and analytics in real time.
        </p>

        {/* Tab switcher */}
        <div className="flex rounded-xl p-1 mb-6 w-full max-w-lg" style={{ backgroundColor: '#1a1a1a' }}>
          {(['shorten', 'stats'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'shorten' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Shorten
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Stats
                </>
              )}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="w-full max-w-lg">
          {tab === 'shorten' ? <ShortenForm /> : <StatsPanel />}
        </div>
      </div>
    </div>
  )
}
