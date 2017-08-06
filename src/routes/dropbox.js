require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Service from '../lib/service'
import passport from 'passport'
import { Strategy } from 'passport-dropbox-oauth2'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.DROPBOX_CLIENT_ID,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
  callbackURL: process.env.DROPBOX_CLIENT_CALLBACK_URL,
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'dropbox'
    service.identity = profile.emails[0].value
    service.accountId = req.session.passport.user
    service.accessToken = accessToken
    //service.refreshToken = refreshToken // Doesn't seem to be defined by dropbox
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

router.get('/', passport.authenticate('dropbox-oauth2', {
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('dropbox-oauth2', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
