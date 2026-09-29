import { useEffect, useState } from 'react'
import { fetchHistory } from '../services/queryService'
import Spinner from './Spinner'

export default function HistoryPanel({ onSelect, refreshKey }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchHistory()
      .then((data) => {
        if (active) setHistory(data.history ?? [])
      })
      .catch(() => {
        if (active) setError('Could not load history')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Query History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && (
          <div className="flex items-center gap-2 px-2 py-4 text-sm text-slate-500">
            <Spinner className="h-4 w-4" /> Loading history…
          </div>
        )}

        {!loading && error && <p className="px-2 py-4 text-sm text-red-400">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p className="px-2 py-4 text-sm text-slate-500">No past queries yet.</p>
        )}

        {!loading &&
          history.map((item) => (
            <button
              key={item._id ?? item.id}
              onClick={() => onSelect?.(item)}
              className="mb-1 flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left transition hover:bg-slate-800"
            >
              <span className="line-clamp-2 text-sm text-slate-200">{item.question}</span>
              <span className="truncate font-mono text-xs text-slate-500">{item.sql}</span>
            </button>
          ))}
      </div>
    </div>
  )
}
