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

/* Sample ACCESSTOKEN eyJ0eXAiOiJKV1QiLCJub25jZSI6IkFRQUJBQUFBQUFBOWtUa2xoVnk3U0pUR0F6Ui1wMUJjbTRLTTBjMkxHZmZBc1ZIcEkxM0Q2MXpIc0gzMUJEcU9fdEF0aVkxRVliajA4ZEZKaEZUenhQT1RGbTh2Q05PcVZWUUN3b21EVVJYZUZPS3lsWWsyUUNBQSIsImFsZyI6IlJTMjU2IiwieDV0IjoiVldWSWMxV0QxVGtzYmIzMDFzYXNNNWtPcTVRIiwia2lkIjoiVldWSWMxV0QxVGtzYmIzMDFzYXNNNWtPcTVRIn0.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20vIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMWFlZDNkMzItMDUzMS00OWJmLThhZjAtOTc2M2YzNmQ4MmIwLyIsImlhdCI6MTUwMTYzMjkyMCwibmJmIjoxNTAxNjMyOTIwLCJleHAiOjE1MDE2MzY4MjAsImFjciI6IjEiLCJhaW8iOiJBU1FBMi84RUFBQUFwZ3hNalhnMGM2emx4MCs4N2g1Yng4WHh5dEF5dy95cFNoNkVxODJGZmhZPSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiQml0SG9vcCBMb2NhbCIsImFwcGlkIjoiNDIwYmU4ZTEtZTg3Ny00MDE1LWJhNWEtZjgzZmM2NjIwODA4IiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJKb25lcyIsImdpdmVuX25hbWUiOiJBZGFtIiwiaXBhZGRyIjoiNjguMjI4LjIwNy4xMzQiLCJuYW1lIjoiQWRhbSBKb25lcyIsIm9pZCI6IjE3ZmI5MzdmLTg1OWUtNGYxMy1hOWZkLTQyM2JkYWQzMDQ0OSIsInBsYXRmIjoiNSIsInB1aWQiOiIxMDAzQkZGRDlEOTQ1RUYxIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWRXcml0ZS5TaGFyZWQgQ29udGFjdHMuUmVhZFdyaXRlLlNoYXJlZCBGaWxlcy5SZWFkV3JpdGUuQWxsIE1haWwuUmVhZFdyaXRlLlNoYXJlZCBNYWlsLlNlbmQuU2hhcmVkIE5vdGVzLlJlYWRXcml0ZS5BbGwgb2ZmbGluZV9hY2Nlc3MgUGVvcGxlLlJlYWQgcHJvZmlsZSBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJZS2dvSERiam54am5vaFRmSkJBaGpzMzg4cm1pOTdVdW9MRllHR3FBUFpRIiwidGlkIjoiMWFlZDNkMzItMDUzMS00OWJmLThhZjAtOTc2M2YzNmQ4MmIwIiwidW5pcXVlX25hbWUiOiJkZXZAdXMua29sbGFicmlhLmNvbSIsInVwbiI6ImRldkB1cy5rb2xsYWJyaWEuY29tIiwidXRpIjoiZ01DRnFtRUI0MHV0UDdWMGZsd0tBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.aQIHEq4LT48h7P4LirKh8ZDZfUgJYm1GgI0CC4v01M6YZgZ2i9U7kt08qVoQNSZT9W399Dp5X1pHk8HCbKrpOTbVliG06a9tojYkW3RIAqNY2hgbBgw8IR6RobgH-a2viaFi2xJus8xsPmiXZ3dcbdvqmp-M5YTO7qn3v-G4wFTuvwpHMTEEkwXF0gpjnEMnUljMOk5Rh8Ic4k9TZj5qHjwdTT_1v3JriasTrIgNslog0EhTiaWdEFO8IjGQFlb6bXEJxVVD0ZsV6EJP8h6E39563txUJhcouCkYqfX7_C56tDDEgXvDvhkupsrblM38cRuKi7Thsrp_38Kgerwkzg */

/* Sample REFRESHTOKEN AQABAAAAAAA9kTklhVy7SJTGAzR-p1Bc8I9Swfz3zj-oPJdMlDNASm6WMa-ISeWZQ2gAVnxyP5vP9rSwrdV6kZVX06hU4P8UNP9ek5Ank_t_yOpiamPY6VbOmx33H1sX0HLxuPZKqcrR907wCEkbTlxxVNdZ01wJsYCbliEBf86My56G3Ky5PvItifuAwf-Ydzy5Me5vxY2D0s_rhZIRfVJPIO9oGWiSeWUQzdqIBOZcG4jBlmz3LsJkXMrZTcTiLSI-b8Z4dFyWm_puRocW0TUHeOB6PGWgqlE6-mX8v3U8zl4UJiUb45zb1Ek5xTs7ZwhM8fAs_063I8whxtRE2orgq843_b3KYz9-zGsg8oBvYIq4JHYYxHMlFnhbI1LsW2pJ1v669iMGxy2ma8-bFhm_cfKXSbyE2IeT9YMjTSyOi_9wriXaq8-4uogZpo2VmHEUa2T224OPAlhe_44wC7mI_YSg-91gEcehJsNGp6wJRK_ERZg34Zc2F3u8Hcrf1BWInfSInFbSABuDsq_XVwFPasOeCYzPOjtMzA1633z7KHzqWJWW6CmQZDDhouYdGywmA4NB1ohcfOWr72iUm8aNSbEqGhnhAvJiGTzmDQNp5NoGAj8dzR1Nupq7j0GRVwPNljeM9pfeAuUxZbUdF4Z22emPZo3k9htytxTFf3xk7j7BRW53KUywZrXlQuTH0M3xmGLHHnyQ0dCpuFg4K1pAABwZIE7VcBwTqiO-j_p5oVK2rgfy9iS67CKVKURKfxWIioXZTWBSr6l17Q9bXTMLHxu_i4JRIAA */

/* Sample PARAMS dataset
params:  { token_type: 'Bearer',
  scope: 'Calendars.ReadWrite.Shared Contacts.ReadWrite.Shared Files.ReadWrite.All Mail.ReadWrite.Shared Mail.Send.Shared Notes.ReadWrite.All offline_access People.Read profile User.ReadWrite.All',
  expires_in: '3599',
  ext_expires_in: '0',
  expires_on: '1501636820',
  not_before: '1501632920',
  resource: 'https://graph.microsoft.com/',
  access_token: 'eyJ0eXAiOiJKV1QiLCJub25jZSI6IkFRQUJBQUFBQUFBOWtUa2xoVnk3U0pUR0F6Ui1wMUJjbTRLTTBjMkxHZmZBc1ZIcEkxM0Q2MXpIc0gzMUJEcU9fdEF0aVkxRVliajA4ZEZKaEZUenhQT1RGbTh2Q05PcVZWUUN3b21EVVJYZUZPS3lsWWsyUUNBQSIsImFsZyI6IlJTMjU2IiwieDV0IjoiVldWSWMxV0QxVGtzYmIzMDFzYXNNNWtPcTVRIiwia2lkIjoiVldWSWMxV0QxVGtzYmIzMDFzYXNNNWtPcTVRIn0.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20vIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMWFlZDNkMzItMDUzMS00OWJmLThhZjAtOTc2M2YzNmQ4MmIwLyIsImlhdCI6MTUwMTYzMjkyMCwibmJmIjoxNTAxNjMyOTIwLCJleHAiOjE1MDE2MzY4MjAsImFjciI6IjEiLCJhaW8iOiJBU1FBMi84RUFBQUFwZ3hNalhnMGM2emx4MCs4N2g1Yng4WHh5dEF5dy95cFNoNkVxODJGZmhZPSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiQml0SG9vcCBMb2NhbCIsImFwcGlkIjoiNDIwYmU4ZTEtZTg3Ny00MDE1LWJhNWEtZjgzZmM2NjIwODA4IiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJKb25lcyIsImdpdmVuX25hbWUiOiJBZGFtIiwiaXBhZGRyIjoiNjguMjI4LjIwNy4xMzQiLCJuYW1lIjoiQWRhbSBKb25lcyIsIm9pZCI6IjE3ZmI5MzdmLTg1OWUtNGYxMy1hOWZkLTQyM2JkYWQzMDQ0OSIsInBsYXRmIjoiNSIsInB1aWQiOiIxMDAzQkZGRDlEOTQ1RUYxIiwic2NwIjoiQ2FsZW5kYXJzLlJlYWRXcml0ZS5TaGFyZWQgQ29udGFjdHMuUmVhZFdyaXRlLlNoYXJlZCBGaWxlcy5SZWFkV3JpdGUuQWxsIE1haWwuUmVhZFdyaXRlLlNoYXJlZCBNYWlsLlNlbmQuU2hhcmVkIE5vdGVzLlJlYWRXcml0ZS5BbGwgb2ZmbGluZV9hY2Nlc3MgUGVvcGxlLlJlYWQgcHJvZmlsZSBVc2VyLlJlYWRXcml0ZS5BbGwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJZS2dvSERiam54am5vaFRmSkJBaGpzMzg4cm1pOTdVdW9MRllHR3FBUFpRIiwidGlkIjoiMWFlZDNkMzItMDUzMS00OWJmLThhZjAtOTc2M2YzNmQ4MmIwIiwidW5pcXVlX25hbWUiOiJkZXZAdXMua29sbGFicmlhLmNvbSIsInVwbiI6ImRldkB1cy5rb2xsYWJyaWEuY29tIiwidXRpIjoiZ01DRnFtRUI0MHV0UDdWMGZsd0tBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.aQIHEq4LT48h7P4LirKh8ZDZfUgJYm1GgI0CC4v01M6YZgZ2i9U7kt08qVoQNSZT9W399Dp5X1pHk8HCbKrpOTbVliG06a9tojYkW3RIAqNY2hgbBgw8IR6RobgH-a2viaFi2xJus8xsPmiXZ3dcbdvqmp-M5YTO7qn3v-G4wFTuvwpHMTEEkwXF0gpjnEMnUljMOk5Rh8Ic4k9TZj5qHjwdTT_1v3JriasTrIgNslog0EhTiaWdEFO8IjGQFlb6bXEJxVVD0ZsV6EJP8h6E39563txUJhcouCkYqfX7_C56tDDEgXvDvhkupsrblM38cRuKi7Thsrp_38Kgerwkzg',
  id_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI0MjBiZThlMS1lODc3LTQwMTUtYmE1YS1mODNmYzY2MjA4MDgiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xYWVkM2QzMi0wNTMxLTQ5YmYtOGFmMC05NzYzZjM2ZDgyYjAvIiwiaWF0IjoxNTAxNjMyOTIwLCJuYmYiOjE1MDE2MzI5MjAsImV4cCI6MTUwMTYzNjgyMCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IkpvbmVzIiwiZ2l2ZW5fbmFtZSI6IkFkYW0iLCJpcGFkZHIiOiI2OC4yMjguMjA3LjEzNCIsIm5hbWUiOiJBZGFtIEpvbmVzIiwib2lkIjoiMTdmYjkzN2YtODU5ZS00ZjEzLWE5ZmQtNDIzYmRhZDMwNDQ5IiwicGxhdGYiOiI1Iiwic3ViIjoiRnFrZXJXLWxvamxfVExCNldFSkp4UGx3cmhRQnVEbVk5alN1OG5mRDN1SSIsInRpZCI6IjFhZWQzZDMyLTA1MzEtNDliZi04YWYwLTk3NjNmMzZkODJiMCIsInVuaXF1ZV9uYW1lIjoiZGV2QHVzLmtvbGxhYnJpYS5jb20iLCJ1cG4iOiJkZXZAdXMua29sbGFicmlhLmNvbSIsInZlciI6IjEuMCJ9.' }
*/
/* Sample PROFILE dataset
{ provider: 'azure_ad_oauth2' }

DECODED portion jwt decode of id_token

decoded:  { aud: '420be8e1-e877-4015-ba5a-f83fc6620808',
  iss: 'https://sts.windows.net/1aed3d32-0531-49bf-8af0-9763f36d82b0/',
  iat: 1501972879,
  nbf: 1501972879,
  exp: 1501976779,
  amr: [ 'pwd' ],
  family_name: 'Jones',
  given_name: 'Adam',
  ipaddr: '68.228.207.134',
  name: 'Adam Jones',
  oid: '17fb937f-859e-4f13-a9fd-423bdad30449',
  platf: '5',
  sub: 'FqkerW-lojl_TLB6WEJJxPlwrhQBuDmY9jSu8nfD3uI',
  tid: '1aed3d32-0531-49bf-8af0-9763f36d82b0',
  unique_name: 'dev@us.kollabria.com',
  upn: 'dev@us.kollabria.com',
  ver: '1.0' }

 */
