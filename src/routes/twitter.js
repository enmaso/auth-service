require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-twitter'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CLIENT_CALLBACK_URL,
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'twitter'
    service.identity = profile.username
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

router.get('/', passport.authenticate('twitter', {
  session: true,
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('twitter', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
