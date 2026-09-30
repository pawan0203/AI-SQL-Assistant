import pkg from 'node-sql-parser'
import { AppError } from '../utils/AppError.js'

const { Parser } = pkg

const parser = new Parser()

const FORBIDDEN_KEYWORDS = [
  'insert',
  'update',
  'delete',
  'drop',
  'alter',
  'truncate',
  'grant',
  'revoke',
  'create',
  'replace',
  'call',
  'merge',
  'copy',
  'vacuum',
  'execute',
]

// Defense in depth: an AST-level check (must parse as a single SELECT) plus a
// keyword denylist backstop, since a malformed/edge-case query could fail to
// parse into an AST but still reach the database driver.
export function assertSelectOnly(sql) {
  const cleaned = sql.trim().replace(/;+\s*$/, '')

  if (!cleaned) {
    throw new AppError('Generated SQL is empty', 422)
  }

  if (cleaned.includes(';')) {
    throw new AppError('Multiple SQL statements are not allowed', 422)
  }

  let ast
  try {
    ast = parser.astify(cleaned, { database: 'postgresql' })
  } catch (err) {
    throw new AppError(`Generated SQL is not valid PostgreSQL: ${err.message}`, 422)
  }

  const statements = Array.isArray(ast) ? ast : [ast]
  if (statements.length !== 1) {
    throw new AppError('Only a single SELECT statement is allowed', 422)
  }

  const [statement] = statements
  if (statement.type !== 'select') {
    throw new AppError(`Only SELECT queries are allowed (received "${statement.type}")`, 422)
  }

  if (statement.into?.position) {
    throw new AppError('SELECT INTO is not allowed', 422)
  }

  const upperSql = cleaned.toUpperCase()
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (new RegExp(`\\b${keyword.toUpperCase()}\\b`).test(upperSql)) {
      throw new AppError(`Query contains a forbidden keyword: ${keyword.toUpperCase()}`, 422)
    }
  }

  return cleaned
}
