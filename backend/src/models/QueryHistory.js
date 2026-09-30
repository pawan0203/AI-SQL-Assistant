import mongoose from 'mongoose'

const queryHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true },
    sql: { type: String, required: true },
    columns: { type: [String], default: [] },
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
)

export default mongoose.model('QueryHistory', queryHistorySchema)
