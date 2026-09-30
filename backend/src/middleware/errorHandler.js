import { AppError } from '../utils/AppError.js'

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404))
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500

  if (!(err instanceof AppError)) {
    console.error(err)
  }

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  })
}
