import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import queryRoutes from './routes/queryRoutes.js'
import schemaRoutes from './routes/schemaRoutes.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }))
app.use(express.json())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/schema', schemaRoutes)
app.use('/api/query', queryRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
