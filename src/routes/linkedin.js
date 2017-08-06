require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-linkedin-oauth2'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CLIENT_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_basicprofile', 'w_share', 'rw_company_admin'],
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'linkedin'
    service.identity = profile.emails[0].value
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

router.get('/', passport.authenticate('linkedin', {
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('linkedin', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
