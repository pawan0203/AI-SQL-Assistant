import { useState } from 'react'
import Spinner from './Spinner'

export default function QueryInput({ onSubmit, loading, mode }) {
  const [question, setQuestion] = useState('')
  const [schema, setSchema] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [readingFile, setReadingFile] = useState(false)
  const isGeneral = mode === 'generate'
  const busy = loading || readingFile

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileError('')
    if (!/\.(sql|txt)$/i.test(file.name)) {
      setFileError('Choose a .sql or .txt file containing your PostgreSQL tables and columns.')
      return
    }
    if (file.size > 20000) {
      setFileError('The schema file must be 20 KB or smaller. Export only the table definitions, without row data.')
      return
    }
    setReadingFile(true)
    try {
      const text = await file.text()
      if (!text.trim() || text.includes('\u0000') || text.includes('\uFFFD')) {
        throw new Error('Choose a non-empty UTF-8 text schema file.')
      }
      setSchema(text)
      setFileName(file.name)
    } catch (err) {
      setFileError(err.message || 'Could not read this file. Please try another schema file.')
    } finally {
      setReadingFile(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim() || busy) return
    onSubmit(question.trim(), schema.trim())
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="question" className="text-sm font-medium text-slate-300">
        {isGeneral ? 'Describe your situation' : 'Ask a question about your database'}
      </label>
      <div className="flex items-end gap-3">
        <textarea
          id="question"
          rows={2}
          maxLength={5000}
          disabled={busy}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Show me the top 5 customers by total orders this year"
          className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="flex h-[46px] items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? 'Generating' : isGeneral ? 'Generate SQL' : 'Run'}
        </button>
      </div>
      {isGeneral && (
        <div className="flex flex-col gap-2">
          <label htmlFor="schema-file" className="text-sm font-medium text-slate-300">
            Upload your database schema
          </label>
          <input
            id="schema-file"
            type="file"
            accept=".sql,.txt"
            disabled={busy}
            onChange={handleFileUpload}
            aria-describedby="schema-file-help"
            className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500/10 file:px-3 file:py-2 file:text-emerald-300 disabled:opacity-50"
          />
          <p id="schema-file-help" className="text-xs text-slate-400">
            Upload a PostgreSQL .sql or .txt schema file, up to 20 KB. Include table definitions and relationships. File contents are sent to the AI when you generate SQL.
          </p>
          {readingFile && <p role="status" className="text-xs text-slate-400">Reading schema file…</p>}
          {fileError && <p role="alert" className="text-sm text-red-300">{fileError}</p>}
          {fileName && (
            <div className="flex items-center gap-3 text-xs text-emerald-300">
              <span>Loaded: {fileName}. Review or edit the schema below.</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => { setSchema(''); setFileName(''); setFileError('') }}
                className="shrink-0 rounded border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800"
              >Remove file</button>
            </div>
          )}
          <label htmlFor="schema" className="text-sm font-medium text-slate-300">
            Tables and columns (optional)
          </label>
          <textarea
            id="schema"
            rows={4}
            maxLength={20000}
            disabled={busy}
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder={'Paste CREATE TABLE statements or describe your schema, for example:\ncustomers(id, name)\norders(id, customer_id, total, ordered_at)\norders.customer_id references customers.id'}
            className="resize-y rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          <p className="text-xs text-slate-400">
            Without a schema, the AI proposes table and column names and lists its assumptions.
          </p>
        </div>
      )}
      <p className="text-xs text-slate-500">
        {isGeneral ? 'Generates PostgreSQL SELECT queries only. Queries are not executed.' : 'Only SELECT queries are executed against the connected database.'}
        {' '}Press Enter to submit, Shift+Enter for a new line.
      </p>
    </form>
  )
}
