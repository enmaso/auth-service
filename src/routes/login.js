import { Router } from 'express'
import logger from '../lib/logger'
import Account from '../lib/account'
import passport from 'passport'
import { Strategy } from 'passport-local'
import validator from 'validator'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  if(!validator.isEmail(email)) {
    return done(null, false)
  }
  Account.findOne({
    email: email,
    password: Account.hash(password)
  })
  .then(account => {
    if(!account) {
      console.log('THE ACCOUNT IS NULL')
    }
    return done(null, account)
  })
  .catch(err => {
    return done(err)
  })
}))

const router = Router()

router.post('/', passport.authenticate('local'), (req, res) => {
  console.log(req.user)
  res.send('OK')
})

export default router
