import pool from '../config/postgres.js'

const COLUMNS_QUERY = `
  SELECT table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = $1
  ORDER BY table_name, ordinal_position
`

// Fetches the live schema (tables + columns) directly from PostgreSQL on
// every call so the AI prompt and the UI always reflect the current database.
export async function getSchema(schemaName = process.env.PG_SCHEMA || 'public') {
  const { rows } = await pool.query(COLUMNS_QUERY, [schemaName])

  const tables = new Map()
  for (const row of rows) {
    if (!tables.has(row.table_name)) {
      tables.set(row.table_name, { name: row.table_name, columns: [] })
    }
    tables.get(row.table_name).columns.push({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
    })
  }

  return Array.from(tables.values())
}
