import { AppError } from '../utils/AppError.js'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function formatSchema(tables) {
  return tables
    .map((table) => {
      const columns = table.columns.map((c) => `${c.name} (${c.type})`).join(', ')
      return `- ${table.name}: ${columns}`
    })
    .join('\n')
}

function buildPrompt(question, tables) {
  return `You are a PostgreSQL expert. Given the database schema below, write a single PostgreSQL query that answers the user's question.

Schema:
${formatSchema(tables)}

Rules:
- Output ONLY a single SELECT statement (a WITH ... SELECT CTE is allowed). No other statement type is allowed.
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, or any statement that writes or changes data/schema.
- Use only the tables and columns listed above.
- Do not include comments, explanations, or markdown code fences — output raw SQL only.
- Do not end the query with a semicolon.

Question: ${question}

SQL:`
}

function extractSql(text) {
  let sql = text.trim()
  const fenced = sql.match(/```(?:sql)?\s*([\s\S]*?)```/i)
  if (fenced) sql = fenced[1].trim()
  return sql.replace(/;+\s*$/, '').trim()
}

export async function generateSql({ question, tables }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured on the server', 500)
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const prompt = buildPrompt(question, tables)

  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 1024 },
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new AppError(`Gemini API request failed: ${errBody}`, 502)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new AppError('Gemini did not return a SQL query', 502)
  }

  return extractSql(text)
}
