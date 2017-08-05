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

/* Sample ACCESSTOKEN FuZB-tXMAGAAAAAAAAAAWsUtLc_9Jouw96F2P0eQhVzNR5Dh-WM8vvdsMRazvy4i */

/* Sample REFRESHTOKEN undefined */

/* Sample PROFILE dataset
profile:  { provider: 'dropbox',
  id: 576540315,
  displayName: 'Adam Jones',
  name: { familyName: 'Jones', givenName: 'Adam', middleName: '' },
  emails: [ { value: 'a.jones@kollabria.com' } ],
  _raw: '{"referral_link": "https://db.tt/PXzZvSYD", "display_name": "Adam Jones", "uid": 576540315, "locale": "en", "email_verified": true, "team": null, "quota_info": {"datastores": 0, "shared": 0, "quota": 2147483648, "normal": 4498711}, "is_paired": false, "country": "US", "name_details": {"familiar_name": "Adam", "surname": "Jones", "given_name": "Adam"}, "email": "a.jones@kollabria.com"}',
  _json:
   { referral_link: 'https://db.tt/PXzZvSYD',
     display_name: 'Adam Jones',
     uid: 576540315,
     locale: 'en',
     email_verified: true,
     team: null,
     quota_info: { datastores: 0, shared: 0, quota: 2147483648, normal: 4498711 },
     is_paired: false,
     country: 'US',
     name_details: { familiar_name: 'Adam', surname: 'Jones', given_name: 'Adam' },
     email: 'a.jones@kollabria.com' } }
 */
