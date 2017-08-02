require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'
import passport from 'passport'
import { Strategy } from 'passport-twitter'

passport.serializeUser(function (user, done) {
  done(null, obj)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CLIENT_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    console.log('accessToken: ', accessToken)
    console.log('refreshToken: ', refreshToken)
    console.log('profile: ', profile)
    return done(null, profile)
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

/* Sample ACCESSTOKEN 744966299814498304-poYX0nt6AlEpX8qnTU2omk2C8AzKixs */

/* Sample REFRESHTOKEN WZiCWMIqg8rKYBgztIBmkQNBN2jH5tPM8fKkz16gxFfQO */

/* Sample PROFILE dataset
profile:  { id: '744966299814498304',
  username: 'ajones02832207',
  displayName: 'Adam Jones',
  photos: [ { value: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png' } ],
  provider: 'twitter',
  _raw: '{"id":744966299814498304,"id_str":"744966299814498304","name":"Adam Jones","screen_name":"ajones02832207","location":"","description":"","url":null,"entities":{"description":{"urls":[]}},"protected":false,"followers_count":6,"friends_count":182,"listed_count":0,"created_at":"Mon Jun 20 18:53:01 +0000 2016","favourites_count":0,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":0,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"F5F8FA","profile_background_image_url":null,"profile_background_image_url_https":null,"profile_background_tile":false,"profile_image_url":"http:\\/\\/abs.twimg.com\\/sticky\\/default_profile_images\\/default_profile_normal.png","profile_image_url_https":"https:\\/\\/abs.twimg.com\\/sticky\\/default_profile_images\\/default_profile_normal.png","profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":true,"following":false,"follow_request_sent":false,"notifications":false,"translator_type":"none"}',
  _json:
   { id: 744966299814498300,
     id_str: '744966299814498304',
     name: 'Adam Jones',
     screen_name: 'ajones02832207',
     location: '',
     description: '',
     url: null,
     entities: { description: [Object] },
     protected: false,
     followers_count: 6,
     friends_count: 182,
     listed_count: 0,
     created_at: 'Mon Jun 20 18:53:01 +0000 2016',
     favourites_count: 0,
     utc_offset: null,
     time_zone: null,
     geo_enabled: false,
     verified: false,
     statuses_count: 0,
     lang: 'en',
     contributors_enabled: false,
     is_translator: false,
     is_translation_enabled: false,
     profile_background_color: 'F5F8FA',
     profile_background_image_url: null,
     profile_background_image_url_https: null,
     profile_background_tile: false,
     profile_image_url: 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
     profile_image_url_https: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
     profile_link_color: '1DA1F2',
     profile_sidebar_border_color: 'C0DEED',
     profile_sidebar_fill_color: 'DDEEF6',
     profile_text_color: '333333',
     profile_use_background_image: true,
     has_extended_profile: false,
     default_profile: true,
     default_profile_image: true,
     following: false,
     follow_request_sent: false,
     notifications: false,
     translator_type: 'none' },
  _accessLevel: 'read-write' }
 */
