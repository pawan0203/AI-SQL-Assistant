import 'dotenv/config'
import app from './app.js'
import { connectMongo } from './config/mongo.js'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await connectMongo()
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('[server] failed to start:', err.message)
    process.exit(1)
  }
}

start()
