import test from 'node:test'
import assert from 'node:assert/strict'
import QueryHistory from '../src/models/QueryHistory.js'

test('generated history validates schema text and assumption arrays', async () => {
  const document = new QueryHistory({
    user: '507f1f77bcf86cd799439011',
    question: 'List books',
    sql: 'SELECT title FROM books',
    mode: 'generate',
    schemaText: 'books(id, title)',
    assumptions: ['Assume title contains the book title.'],
  })
  await document.validate()
  assert.equal(document.schemaText, 'books(id, title)')
  assert.equal(typeof document.schema.indexedPaths, 'function')
  assert.deepEqual(document.columns.toObject(), [])
  assert.deepEqual(document.rows.toObject(), [])
})

test('database history validates result columns and rows', async () => {
  const document = new QueryHistory({
    user: '507f1f77bcf86cd799439011',
    question: 'List books',
    sql: 'SELECT title FROM books',
    columns: ['title'],
    rows: [{ title: 'Example book' }],
  })
  await document.validate()
  assert.equal(document.mode, 'database')
  assert.equal(document.rows[0].title, 'Example book')
})
