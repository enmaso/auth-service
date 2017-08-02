require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'
import passport from 'passport'
import { Strategy } from 'passport-evernote'

passport.serializeUser(function (user, done) {
  done(null, obj)
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
  callbackURL: process.env.EVERNOTE_CLIENT_CALLBACK_URL
}, function (token, tokenSecret, profile, done) {
  process.nextTick(() => {
    console.log('token: ', token)
    console.log('tokenSecret: ', tokenSecret)
    console.log('profile: ', profile)
    return done(null, profile)
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
