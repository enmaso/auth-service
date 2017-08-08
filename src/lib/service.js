import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const schema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    lowercase: true
  },
  identity: {
    type: String,
    required: true,
    unique: true
  },
  accountId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  profile: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

schema.set('toJSON', {virtuals: true})
schema.set('toObject', {virtuals: true})

export default mongoose.model('Service', schema)
