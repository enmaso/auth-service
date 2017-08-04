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
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  // Validate email
  if(!validator.isEmail(email)) {
    return done(null, false)
  }
  // Validate password
  if(!validator.isLength(password, 4)) {
    return done(null, false)
  }
  // Find or Create Account record
  Account.findOne({
    email: email
  }, (err, account) => {
    if(err) {
      // Server error
      return done(err, false)
    } else if(account) {
      // Account already exists, check password
      if(!Account.match(password, account.password)) {
        return done(null, false)
      } else {
        return done(null, account)
      }
    } else {
      // Account does not exist, create one
      let account = new Account()
      account.email = email
      account.password = password
      account.save(err => {
        if(err) {
          logger.error(err.stack)
          return done(err, false)
        } else {
          return done(null, account)
        }
      })
    }
  })
}))

const router = Router()

router.get('/', (req, res, next) => {
  console.log(req.params)
  res.send('OK')
})

router.post('/', passport.authenticate('local'), (req, res) => {
  res.send('OK')
})

export default router
