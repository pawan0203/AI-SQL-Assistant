import { useState } from 'react'
import Spinner from './Spinner'

export default function QueryInput({ onSubmit, loading }) {
  const [question, setQuestion] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim() || loading) return
    onSubmit(question.trim())
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="question" className="text-sm font-medium text-slate-300">
        Ask a question about your database
      </label>
      <div className="flex items-end gap-3">
        <textarea
          id="question"
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Show me the top 5 customers by total orders this year"
          className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex h-[46px] items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? 'Generating' : 'Run'}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Only <span className="font-mono text-emerald-400">SELECT</span> queries are executed. Press
        Enter to submit, Shift+Enter for a new line.
      </p>
    </form>
  )
}
