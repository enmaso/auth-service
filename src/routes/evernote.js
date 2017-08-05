require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-evernote'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

passport.use(new Strategy({
  requestTokenURL: 'https://sandbox.evernote.com/oauth',
  accessTokenURL: 'https://sandbox.evernote.com/oauth',
  userAuthorizationURL: 'https://sandbox.evernote.com/OAuth.action',
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET,
  callbackURL: process.env.EVERNOTE_CLIENT_CALLBACK_URL,
  passReqToCallback: true
}, function (req, token, tokenSecret, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'evernote'
    service.identity = profile.id
    service.accountId = req.session.passport.user
    service.accessToken = token
    //service.refreshToken = tokenSecret
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

router.get('/', passport.authenticate('evernote', {
  session: true,
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('evernote', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router

/* Sample TOKEN S=s1:U=93e78:E=15da5d0a8d0:C=15da0aa4a48:P=185:A=jonesg:V=2:H=bc39e09917dbc15514bba5279b36125c */

/* Sample TOKENSECRET undefined */

/* Sample PROFILE dataset
{ provider: 'evernote', id: '605816', shard: 's1' }
 */
