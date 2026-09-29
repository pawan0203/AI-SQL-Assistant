import { useState } from 'react'
import Navbar from '../components/Navbar'
import QueryInput from '../components/QueryInput'
import SqlDisplay from '../components/SqlDisplay'
import ResultsTable from '../components/ResultsTable'
import SchemaPanel from '../components/SchemaPanel'
import HistoryPanel from '../components/HistoryPanel'
import { runQuery } from '../services/queryService'

export default function DashboardPage() {
  const [question, setQuestion] = useState('')
  const [sql, setSql] = useState('')
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyKey, setHistoryKey] = useState(0)

  async function handleSubmit(newQuestion) {
    setQuestion(newQuestion)
    setLoading(true)
    setError('')
    setSql('')
    setColumns([])
    setRows([])

    try {
      const data = await runQuery(newQuestion)
      setSql(data.sql ?? '')
      setColumns(data.columns ?? [])
      setRows(data.rows ?? [])
      setHistoryKey((k) => k + 1)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong while running your query.')
    } finally {
      setLoading(false)
    }
  }

  function handleHistorySelect(item) {
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
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
          <SchemaPanel />
        </aside>

        <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <QueryInput onSubmit={handleSubmit} loading={loading} />

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
              <ResultsTable columns={columns} rows={rows} />
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
