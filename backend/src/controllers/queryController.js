import pool from '../config/postgres.js'
import QueryHistory from '../models/QueryHistory.js'
import { generateSql, generateGeneralSql } from '../services/geminiService.js'
import { getSchema } from '../services/schemaService.js'
import { assertSelectOnly } from '../services/sqlValidator.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const MAX_RESULT_ROWS = Number(process.env.MAX_RESULT_ROWS) || 100
const QUERY_TIMEOUT_MS = Number(process.env.QUERY_TIMEOUT_MS) || 10000

export const handleGenerate = asyncHandler(async (req, res) => {
  const { question, schema = '' } = req.body ?? {}
  if (typeof question !== 'string' || !question.trim() || question.length > 5000) {
    throw new AppError('Enter a situation between 1 and 5000 characters', 400)
  }
  if (typeof schema !== 'string' || schema.length > 20000) {
    throw new AppError('Schema must be text with at most 20000 characters', 400)
  }
  const generated = await generateGeneralSql({ question: question.trim(), schema: schema.trim() })
  const sql = assertSelectOnly(generated.sql)
  const result = { sql, assumptions: generated.assumptions, mode: 'generate', dialect: 'PostgreSQL' }
  await QueryHistory.create({
    user: req.user.id, question: question.trim(), schemaText: schema.trim(), ...result,
  })
  res.json(result)
})

export const handleQuery = asyncHandler(async (req, res) => {
  const { question } = req.body
  if (!question || !question.trim()) {
    throw new AppError('question is required', 400)
  }

  const tables = await getSchema()
  const rawSql = await generateSql({ question, tables })
  const sql = assertSelectOnly(rawSql)

  const client = await pool.connect()
  let result
  try {
    await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`)
    result = await client.query(sql)
  } catch (err) {
    throw new AppError(`Query execution failed: ${err.message}`, 422)
  } finally {
    client.release()
  }

  const columns = result.fields.map((field) => field.name)
  const rows = result.rows.slice(0, MAX_RESULT_ROWS)

  await QueryHistory.create({ user: req.user.id, question, sql, columns, rows })

  res.json({ sql, columns, rows })
})

export const getHistory = asyncHandler(async (req, res) => {
  const history = await QueryHistory.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  res.json({ history })
})
