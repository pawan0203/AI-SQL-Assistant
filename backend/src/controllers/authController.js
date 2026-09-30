import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email }
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new AppError('name, email and password are required', 400)
  }
  if (password.length < 8) {
    throw new AppError('password must be at least 8 characters', 400)
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    throw new AppError('An account with this email already exists', 409)
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, password: hashed })

  res.status(201).json({ token: signToken(user), user: toPublicUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError('email and password are required', 400)
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401)
  }

  res.json({ token: signToken(user), user: toPublicUser(user) })
})
