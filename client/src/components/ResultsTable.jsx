export default function ResultsTable({ columns, rows }) {
  if (!columns?.length) return null

  if (!rows?.length) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-8 text-center text-sm text-slate-500">
        Query ran successfully but returned no rows.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-800 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-2.5 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {rows.map((row, i) => (
              <tr key={i} className="transition hover:bg-slate-800/60">
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-4 py-2.5 text-slate-200">
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-slate-500">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-500">
        {rows.length} row{rows.length === 1 ? '' : 's'}
      </div>
    </div>
  )
}
