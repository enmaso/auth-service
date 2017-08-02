require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'
import passport from 'passport'
import { Strategy } from 'passport-google-oauth2'

passport.serializeUser(function (user, done) {
  done(null, obj)
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
    console.log('accessToken: ', accessToken)
    console.log('refreshToken: ', refreshToken)
    console.log('profile: ', profile)
    return done(null, profile)
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

/* Sample ACCESSTOKEN ya29.GluaBPxikF3jys28Dxv_yNxbuf-CzkGc24NK6Rq8tK7WEL0UG7g7Q0bHDyYko8AQymCKszOo67PEj1afLvoKPHq4sn00pGOGGjQ5oc8Yp3uGH5g8DodBMzsp5XmT */

/* Sample REFRESHTOKEN 1/aVLFxf9mD6m6j3QB_V99PXEESoJqcuxaPU0NltK3dA10OGotbDG63w_X2OYXcO6U */

/* Sample PROFILE dataset
profile:  { provider: 'google',
  id: '100875524114991257351',
  displayName: 'Adam Jones',
  name: { familyName: 'Jones', givenName: 'Adam' },
  isPerson: true,
  isPlusUser: true,
  language: 'en',
  emails: [ { value: 'jones.gabriel@gmail.com', type: 'account' } ],
  email: 'jones.gabriel@gmail.com',
  gender: 'male',
  photos: [ { value: 'https://lh5.googleusercontent.com/-L26cPxgmp5o/AAAAAAAAAAI/AAAAAAAAAV0/MHEzqB25EWY/photo.jpg?sz=50' } ],
  _raw: '{\n "kind": "plus#person",\n "etag": "\\"Sh4n9u6EtD24TM0RmWv7jTXojqc/BApp2hqbIIn4GAjvGAJkqwKYueE\\"",\n "gender": "male",\n "emails": [\n  {\n   "value": "jones.gabriel@gmail.com",\n   "type": "account"\n  }\n ],\n "objectType": "person",\n "id": "100875524114991257351",\n "displayName": "Adam Jones",\n "name": {\n  "familyName": "Jones",\n  "givenName": "Adam"\n },\n "url": "https://plus.google.com/100875524114991257351",\n "image": {\n  "url": "https://lh5.googleusercontent.com/-L26cPxgmp5o/AAAAAAAAAAI/AAAAAAAAAV0/MHEzqB25EWY/photo.jpg?sz=50",\n  "isDefault": false\n },\n "isPlusUser": true,\n "language": "en",\n "ageRange": {\n  "min": 21\n },\n "circledByCount": 17,\n "verified": false\n}\n',
  _json:
   { kind: 'plus#person',
     etag: '"Sh4n9u6EtD24TM0RmWv7jTXojqc/BApp2hqbIIn4GAjvGAJkqwKYueE"',
     gender: 'male',
     emails: [ [Object] ],
     objectType: 'person',
     id: '100875524114991257351',
     displayName: 'Adam Jones',
     name: { familyName: 'Jones', givenName: 'Adam' },
     url: 'https://plus.google.com/100875524114991257351',
     image:
      { url: 'https://lh5.googleusercontent.com/-L26cPxgmp5o/AAAAAAAAAAI/AAAAAAAAAV0/MHEzqB25EWY/photo.jpg?sz=50',
        isDefault: false },
     isPlusUser: true,
     language: 'en',
     ageRange: { min: 21 },
     circledByCount: 17,
     verified: false } }
 */
