import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'generation-test-secret'
process.env.GEMINI_API_KEY = 'test-key'

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/postgres.js')
const { default: QueryHistory } = await import('../src/models/QueryHistory.js')

test('general generation uses user context, validates SQL, and never accesses PostgreSQL', async (t) => {
  const originalFetch = globalThis.fetch
  const originalCreate = QueryHistory.create
  const originalQuery = pool.query
  const originalConnect = pool.connect
  let pgCalls = 0
  let aiCalls = 0
  let aiText
  let prompt
  let saved
  pool.query = pool.connect = async () => { pgCalls++; throw new Error('Unexpected PostgreSQL access') }
  QueryHistory.create = async (value) => {
    const document = new QueryHistory(value)
    await document.validate()
    saved = value
    return document
  }
  globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('https://generativelanguage.googleapis.com/')) {
      aiCalls++
      prompt = JSON.parse(options.body).contents[0].parts[0].text
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: aiText }] } }] }))
    }
    return originalFetch(url, options)
  }
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  t.after(async () => {
    globalThis.fetch = originalFetch
    QueryHistory.create = originalCreate
    pool.query = originalQuery
    pool.connect = originalConnect
    await new Promise((resolve) => server.close(resolve))
    await pool.end()
  })
  const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET)
  const request = async (body, authenticated = true) => {
    const response = await originalFetch(`http://127.0.0.1:${server.address().port}/api/query/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    return { status: response.status, data: await response.json() }
  }

  aiText = JSON.stringify({ sql: 'SELECT name FROM customers', assumptions: ['Assumed customers(name).'] })
  const generated = await request({ question: 'List customers' })
  assert.equal(generated.status, 200)
  assert.equal(generated.data.mode, 'generate')
  assert.deepEqual(generated.data.assumptions, ['Assumed customers(name).'])
  assert.equal(saved.user, '507f1f77bcf86cd799439011')
  assert.equal(saved.schemaText, '')
  assert.match(prompt, /"schema":null/)

  aiText = JSON.stringify({ sql: 'SELECT title FROM books', assumptions: [] })
  assert.equal((await request({ question: 'List books', schema: 'books(id, title)' })).status, 200)
  assert.match(prompt, /books\(id, title\)/)
  assert.equal(saved.schemaText, 'books(id, title)')

  const callsBeforeValidation = aiCalls
  for (const body of [{ question: '' }, { question: 42 }, { question: 'x', schema: [] }, { question: 'x'.repeat(5001) }, { question: 'x', schema: 'x'.repeat(20001) }]) {
    assert.equal((await request(body)).status, 400)
  }
  assert.equal((await request({ question: 'List books' }, false)).status, 401)
  assert.equal(aiCalls, callsBeforeValidation)

  const lastSaved = saved
  aiText = JSON.stringify({ sql: 'DROP TABLE books', assumptions: [] })
  assert.equal((await request({ question: 'List books' })).status, 422)
  assert.equal(saved, lastSaved)
  aiText = 'not JSON'
  assert.equal((await request({ question: 'List books' })).status, 502)
  aiText = JSON.stringify({ sql: 'SELECT 1', assumptions: [42] })
  assert.equal((await request({ question: 'List books' })).status, 502)
  assert.equal(pgCalls, 0)
})
