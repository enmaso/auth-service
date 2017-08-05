import { Router } from 'express'
import _ from 'lodash'
import validator from 'validator'
import logger from '../lib/logger'
import Account from '../lib/account'

const router = Router()

router.post('/', (req, res) => {
  let params = _.pick(req.body, 'email', 'password')
  if(!params.email || !params.password) {
    logger.warn(new Error('Missing parameters'))
    res.status(400).send({
      success: false,
      error: 'Missing parameters'
    })
  } else if(!validator.isEmail(params.email) || !validator.isLength(params.password, 4)) {
    logger.warn(new Error('Invalid credentials'))
    res.status(400).send({
      success: false,
      error: 'Invalid credentials'
    })
  } else {
    Account.findOne({
      email: params.email
    })
    .then(account => {
      if(account) {
        logger.warn(new Error('Account already exists'))
        res.status(400).send({
          success: false,
          error: 'Account already exists'
        })
      } else {
        let account = new Account()
        account.email = params.email
        account.password = params.password
        account.save(err => {
          if(err) {
            logger.error(err)
            res.status(500).send({
              success: false,
              error: err
            })
          } else {
            res.status(201).send({
              success: true,
              account: account
            })
          }
        })
      }
    })
    .catch(err => {
      logger.error(err)
      res.status(500).send({
        success: false,
        error: err
      })
    })
  }
})
/*
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
*/

export default router
