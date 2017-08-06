require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Service from '../lib/service'
import passport from 'passport'
import { Strategy } from 'passport-box'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.BOX_CLIENT_ID,
  clientSecret: process.env.BOX_CLIENT_SECRET,
  callbackURL: process.env.BOX_CLIENT_CALLBACK_URL,
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'box'
    service.identity = profile.login
    service.accountId = req.session.passport.user
    service.accessToken = accessToken
    service.refreshToken = refreshToken
    service.profile = profile
    service.save(err => {
      if(err) {
        logger.warn(err)
      }
      return done(null, profile)
    })
  })
}))

const router = Router()

router.get('/', passport.authenticate('box', {
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('box', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
