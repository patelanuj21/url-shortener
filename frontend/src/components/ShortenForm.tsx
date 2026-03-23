import { useState } from 'react'

type Result = {
  short_code: string
  short_url: string
  original_url: string
}

export default function ShortenForm() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const trimmedCode = customCode.trim()
    if (trimmedCode && !/^[a-zA-Z0-9_-]{3,20}$/.test(trimmedCode)) {
      setError('Custom code must be 3–20 characters: letters, numbers, hyphens, underscores only')
      setLoading(false)
      return
    }

    const body: Record<string, string> = { url }
    if (trimmedCode) body.custom_code = trimmedCode

    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setResult(data as Result)
    setUrl('')
    setCustomCode('')
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.short_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Main input row */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center rounded-xl px-4 gap-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <input
              type="url"
              required
              placeholder="https://your-very-long-url.com/path..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#2dd4bf' }}
          >
            {loading ? 'Shortening…' : (
              <>
                Shorten
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Custom code toggle */}
        <div className="text-left">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {showCustom ? '− Hide' : '+ Add'} custom code
          </button>
          {showCustom && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center rounded-xl px-4 gap-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <span className="text-xs text-gray-600 shrink-0">code/</span>
                <input
                  type="text"
                  placeholder="my-link"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="flex-1 py-2.5 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-600 pl-1">
                3–20 characters · letters, numbers, hyphens and underscores only
              </p>
            </div>
          )}
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-400 text-left">{error}</p>
      )}

      {result && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#0f2a28', border: '1px solid #1a4a45' }}>
          <a
            href={result.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm font-mono text-cyan-400 hover:text-cyan-300 truncate text-left"
          >
            {result.short_url}
          </a>
          <button
            onClick={handleCopy}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              copied
                ? 'text-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
