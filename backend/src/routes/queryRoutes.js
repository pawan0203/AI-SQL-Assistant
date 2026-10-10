import { Router } from 'express'
import { getHistory, handleQuery, handleGenerate } from '../controllers/queryController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth, handleQuery)
router.post('/generate', requireAuth, handleGenerate)
router.get('/history', requireAuth, getHistory)

export default router
