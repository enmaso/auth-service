import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const schema = new mongoose.Schema({
  provider: {
    type: String,
    required: true
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

/*
let s = new Service()
s.provider = 'google'
s.accountId = '597fc73a0df2522de9da4f2e'
s.accessToken = 'ya29.GluaBPxikF3jys28Dxv_yNxbuf-CzkGc24NK6Rq8tK7WEL0UG7g7Q0bHDyYko8AQymCKszOo67PEj1afLvoKPHq4sn00pGOGGjQ5oc8Yp3uGH5g8DodBMzsp5XmT'
s.refreshToken = '1/aVLFxf9mD6m6j3QB_V99PXEESoJqcuxaPU0NltK3dA10OGotbDG63w_X2OYXcO6U'
s.profile = {
  ...
}
s.createdAt = ISODate("2017-08-01T02:10:24.501Z")
*/
