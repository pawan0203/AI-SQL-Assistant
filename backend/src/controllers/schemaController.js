import { getSchema } from '../services/schemaService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getDatabaseSchema = asyncHandler(async (req, res) => {
  const tables = await getSchema()
  res.json({ tables })
})
