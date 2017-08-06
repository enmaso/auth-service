require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-azure-ad-oauth2'
import jwt from 'jsonwebtoken'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_CLIENT_CALLBACK_URL,
  resource: 'https://graph.microsoft.com/',
  scope: 'Calendars.Read Contacts.Read Notes.Read People.Read Tasks.Read User.Read Mail.Read Files.ReadWrite Sites.Read.All offline_access',
  passReqToCallback: true
}, function (req, accessToken, refreshToken, params, profile, done) {
  process.nextTick(() => {
    let decoded = jwt.decode(params.id_token)
    let service = new Service()
    service.provider = 'microsoft'
    service.identity = decoded.upn
    service.accountId = req.session.passport.user
    service.accessToken = accessToken
    service.refreshToken = refreshToken
    service.profile = Object.assign(params, profile, decoded)
    service.save(err => {
      if(err) {
        logger.warn(err)
      }
      return done(null, profile)
    })
  })
}))

const router = Router()

router.get('/', passport.authenticate('azure_ad_oauth2', {
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('azure_ad_oauth2', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router
