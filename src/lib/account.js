import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

mongoose.Promise = global.Promise

const schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  key: {
    type: String,
    default: bcrypt.genSaltSync(8)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

schema.set('toJSON', {virtuals: true})
schema.set('toObject', {virtuals: true})

schema.pre('save', function(next) {
  let account = this
  if (this.isModified('password') || this.isNew) {
    account.password = bcrypt.hashSync(account.password, bcrypt.genSaltSync(10), null)
    return next()
  } else {
    return next()
  }
})

schema.statics = {
  match(password, hash) {
    return bcrypt.compareSync(password, hash)
  }
}

export default mongoose.model('Account', schema)
