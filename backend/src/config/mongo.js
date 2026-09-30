import mongoose from 'mongoose'

export async function connectMongo() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('[mongo] connected')
}
