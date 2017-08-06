require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-google-oauth2'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'google'
    service.identity = profile.email
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

let scope = [
  'https://www.googleapis.com/auth/plus.me',
	'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/drive',
	'https://mail.google.com/',
	'https://www.google.com/m8/feeds',
	'https://www.googleapis.com/auth/contacts.readonly',
	'https://www.googleapis.com/auth/calendar'
]

router.get('/', passport.authenticate('google', {
  session: true,
  accessType: 'offline',
  approvalPrompt: 'force',
  scope: scope
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('google', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
