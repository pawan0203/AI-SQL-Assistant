import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401))
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, name: payload.name, email: payload.email }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}
