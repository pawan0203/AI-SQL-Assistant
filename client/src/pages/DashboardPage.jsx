import { useState } from 'react'
import Navbar from '../components/Navbar'
import QueryInput from '../components/QueryInput'
import SqlDisplay from '../components/SqlDisplay'
import ResultsTable from '../components/ResultsTable'
import SchemaPanel from '../components/SchemaPanel'
import HistoryPanel from '../components/HistoryPanel'
import { runQuery, generateQuery } from '../services/queryService'

export default function DashboardPage() {
  const [mode, setMode] = useState('generate')
  const [resultMode, setResultMode] = useState('generate')
  const [assumptions, setAssumptions] = useState([])
  const [question, setQuestion] = useState('')
  const [sql, setSql] = useState('')
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyKey, setHistoryKey] = useState(0)

  async function handleSubmit(newQuestion, schema) {
    setQuestion(newQuestion)
    setLoading(true)
    setError('')
    setSql('')
    setColumns([])
    setRows([])
    setAssumptions([])
    setResultMode(mode)

    try {
      const data = mode === 'generate'
        ? await generateQuery(newQuestion, schema)
        : await runQuery(newQuestion)
      setSql(data.sql ?? '')
      setColumns(data.columns ?? [])
      setRows(data.rows ?? [])
      setAssumptions(data.assumptions ?? [])
      setHistoryKey((k) => k + 1)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong while running your query.')
    } finally {
      setLoading(false)
    }
  }

  function handleHistorySelect(item) {
    if (loading) return
    setResultMode(item.mode ?? 'database')
    setAssumptions(item.assumptions ?? [])
    setQuestion(item.question)
    setSql(item.sql ?? '')
    setColumns(item.columns ?? [])
    setRows(item.rows ?? [])
    setError('')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {mode === 'database' && <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
          <SchemaPanel />
        </aside>}

        <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold text-slate-100">Turn your situation into SQL</h1>
            <div className="flex gap-2" aria-label="Query mode">
              {[
                ['generate', 'Generate SQL'],
                ['database', 'Query connected database'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={loading}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-50 ${mode === value ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >{label}</button>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              {mode === 'generate'
                ? 'Describe any scenario and optionally supply your schema. Get SQL without connecting a database.'
                : 'Ask questions about the PostgreSQL database configured on this server and view results.'}
            </p>
          </div>
          <QueryInput onSubmit={handleSubmit} loading={loading} mode={mode} />

          {question && !loading && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-500">Question:</span> {question}
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-8 text-center text-sm text-slate-500">
              Generating and validating your query…
            </div>
          )}

          {!loading && sql && (
            <div className="flex flex-col gap-4">
              <SqlDisplay sql={sql} />
              {resultMode === 'generate' && (
                <p className="text-sm text-slate-400">PostgreSQL query generated. This query has not been executed.</p>
              )}
              {assumptions.length > 0 && (
                <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-4 text-sm text-amber-200">
                  <h2 className="mb-2 font-semibold">Schema and business assumptions</h2>
                  <ul className="list-disc space-y-1 pl-5">
                    {assumptions.map((assumption, index) => <li key={index}>{assumption}</li>)}
                  </ul>
                </div>
              )}
              {resultMode === 'database' && <ResultsTable columns={columns} rows={rows} />}
            </div>
          )}
        </main>

        <aside className="hidden w-72 shrink-0 border-l border-slate-800 xl:block">
          <HistoryPanel onSelect={handleHistorySelect} refreshKey={historyKey} />
        </aside>
      </div>
    </div>
  )
}
