import { useState } from 'react'

export default function SqlDisplay({ sql }) {
  const [copied, setCopied] = useState(false)

  if (!sql) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard access unavailable; ignore
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Generated SQL
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-slate-400 transition hover:text-emerald-400"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code className="font-mono text-emerald-300">{sql}</code>
      </pre>
    </div>
  )
}
