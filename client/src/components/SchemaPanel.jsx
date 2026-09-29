import { useEffect, useState } from 'react'
import { fetchSchema } from '../services/queryService'
import Spinner from './Spinner'

export default function SchemaPanel() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openTable, setOpenTable] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchSchema()
      .then((data) => {
        if (active) setTables(data.tables ?? [])
      })
      .catch(() => {
        if (active) setError('Could not load schema')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Database Schema
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && (
          <div className="flex items-center gap-2 px-2 py-4 text-sm text-slate-500">
            <Spinner className="h-4 w-4" /> Loading schema…
          </div>
        )}

        {!loading && error && <p className="px-2 py-4 text-sm text-red-400">{error}</p>}

        {!loading && !error && tables.length === 0 && (
          <p className="px-2 py-4 text-sm text-slate-500">No tables found.</p>
        )}

        {!loading &&
          tables.map((table) => {
            const isOpen = openTable === table.name
            return (
              <div key={table.name} className="mb-1">
                <button
                  onClick={() => setOpenTable(isOpen ? null : table.name)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {table.name}
                  </span>
                  <span className="text-xs text-slate-500">{table.columns?.length ?? 0}</span>
                </button>

                {isOpen && (
                  <ul className="ml-6 border-l border-slate-800 pl-3">
                    {table.columns?.map((col) => (
                      <li
                        key={col.name}
                        className="flex items-center justify-between py-1 text-xs"
                      >
                        <span className="text-slate-300">{col.name}</span>
                        <span className="font-mono text-slate-500">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
