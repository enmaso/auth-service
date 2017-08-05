require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'
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

/* Sample ACCESSTOKEN ZvmO44rXrEAzxHAHRbWVIkLxhBQJnbcv */

/* Sample REFRESHTOKEN At148z5PdYJ7dThphGJbBVjJXnf6liApBkq8PdVdBSnBnJVHN5YRnWLi3C9RT1q5 */

/* Sample PROFILE dataset
{
  provider: 'box',
  id: '198187055',
  name: 'Adam Jones',
  login: 'jones.gabriel@gmail.com',
  _raw: '{"type":"user","id":"198187055","name":"Adam Jones","login":"jones.gabriel@gmail.com","created_at":"2013-06-12T10:57:02-07:00","modified_at":"2017-07-31T21:08:46-07:00","language":"en","timezone":"America\\/Los_Angeles","space_amount":5368709120,"space_used":1128012,"max_upload_size":2147483648,"status":"active","job_title":"","phone":"","address":"","avatar_url":"https:\\/\\/app.box.com\\/api\\/avatar\\/large\\/198187055"}',
  _json: {
    type: 'user',
    id: '198187055',
    name: 'Adam Jones',
    login: 'jones.gabriel@gmail.com',
    created_at: '2013-06-12T10:57:02-07:00',
    modified_at: '2017-07-31T21:08:46-07:00',
    language: 'en',
    timezone: 'America/Los_Angeles',
    space_amount: 5368709120,
    space_used: 1128012,
    max_upload_size: 2147483648,
    status: 'active',
    job_title: '',
    phone: '',
    address: '',
    avatar_url: 'https://app.box.com/api/avatar/large/198187055'
  }
}
 */
