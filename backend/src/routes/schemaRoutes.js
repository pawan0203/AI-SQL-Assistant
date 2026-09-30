import { Router } from 'express'
import { getDatabaseSchema } from '../controllers/schemaController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, getDatabaseSchema)

export default router
