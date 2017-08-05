require('dotenv').config()

import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import passport from 'passport'
import { Strategy } from 'passport-linkedin-oauth2'

passport.serializeUser(function (user, done) {
  done(null, user.id)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})
passport.use(new Strategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.LINKEDIN_CLIENT_CALLBACK_URL,
  scope: ['r_emailaddress', 'r_basicprofile', 'w_share', 'rw_company_admin'],
  passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
  process.nextTick(() => {
    let service = new Service()
    service.provider = 'linkedin'
    service.identity = profile.emails[0].value
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

router.get('/', passport.authenticate('linkedin', {
  accessType: 'offline',
  approvalPrompt: 'force'
}))

router.get('/callback', (req, res, next) => {
  passport.authenticate('linkedin', function(err, profile, info) {
    res.send('OK')
  })(req, res, next)
})

export default router

/* Sample ACCESSTOKEN AQWZefk3Iuk3S0aMip-LLAkh4yCsNMTCAZ_ZWFa4na-5wzdtVRRxGT4KShTQZmH-cK1_wn6bOpiZTxniVI3l_iDMYb6YPefnR_0Q1K_FXgyM9edVLy-GTIP8rOpGPhr5xC9pGVm4EvsxQU5b7dXGoH4uvGcOgyMiM_Sr88-UvbGFRAmjHOM */

/* Sample REFRESHTOKEN undefined */

/* Sample PROFILE dataset
profile:  { provider: 'linkedin',
  id: 'FiE1hGZWfT',
  displayName: 'Adam Jones',
  name: { familyName: 'Jones', givenName: 'Adam' },
  emails: [ { value: 'jones.gabriel@gmail.com' } ],
  photos: [ { value: 'https://media.licdn.com/mpr/mprx/0__u25yHgQEiT4ImoTLesXBp4Q2iFkS2by7u9IVgMQDFwLSpIj_sZetVUQekrBwywlCmZXR7N6_Ll5aHeDo0dMNpvo6LlXaH7l70dQxj8FDXkeXONDimxH0Wm9QKwqbH486ySW4_dCHZO' } ],
  _raw: '{\n  "apiStandardProfileRequest": {\n    "headers": {\n      "_total": 1,\n      "values": [{\n        "name": "x-li-auth-token",\n        "value": "name:lR-Y"\n      }]\n    },\n    "url": "https://api.linkedin.com/v1/people/FiE1hGZWfT"\n  },\n  "currentShare": {\n    "author": {\n      "firstName": "Adam",\n      "id": "FiE1hGZWfT",\n      "lastName": "Jones"\n    },\n    "comment": "Anyone in the Boston Area looking for a job/change -- Looking to bring 2 web developers on board to work with me and others. -- You would be working downtown near the Children\'s Museum.",\n    "id": "s447982336",\n    "source": {"serviceProvider": {"name": "LINKEDIN"}},\n    "timestamp": 1309274152000,\n    "visibility": {"code": "anyone"}\n  },\n  "distance": 0,\n  "emailAddress": "jones.gabriel@gmail.com",\n  "firstName": "Adam",\n  "formattedName": "Adam Jones",\n  "headline": "Principle Engineer at Kollabria",\n  "id": "FiE1hGZWfT",\n  "industry": "Information Technology and Services",\n  "lastName": "Jones",\n  "location": {\n    "country": {"code": "us"},\n    "name": "Greater Boston Area"\n  },\n  "numConnections": 167,\n  "numConnectionsCapped": false,\n  "pictureUrl": "https://media.licdn.com/mpr/mprx/0__u25yHgQEiT4ImoTLesXBp4Q2iFkS2by7u9IVgMQDFwLSpIj_sZetVUQekrBwywlCmZXR7N6_Ll5aHeDo0dMNpvo6LlXaH7l70dQxj8FDXkeXONDimxH0Wm9QKwqbH486ySW4_dCHZO",\n  "pictureUrls": {\n    "_total": 1,\n    "values": ["https://media.licdn.com/mpr/mprx/0_1P6FhGlCEt2cR7JlA3VXKshCsApZmDVRkvVhvp8CV_pgm3VOk7RXkdTCwG8nj3MgTARXKthFZFhUupU-z4BecJ8kfFhRupIg34BLCGyXsjl-uwsq3ybXXFwAkL"]\n  },\n  "positions": {\n    "_total": 1,\n    "values": [{\n      "company": {\n        "id": 3001764,\n        "industry": "Market Research",\n        "name": "Kollabria",\n        "size": "11-50",\n        "type": "Privately Held"\n      },\n      "id": 606288647,\n      "isCurrent": true,\n      "location": {\n        "country": {\n          "code": "us",\n          "name": "United States"\n        },\n        "name": "Greater Boston Area"\n      },\n      "startDate": {\n        "month": 2,\n        "year": 2014\n      },\n      "summary": "Responsible for architecture, design and technology requirements required for product development, and researching and evaluating new and existing technologies to help formulate and execute product requirements. This included the development and implementation of an enterprise architecture, working prototype and working demo of a SaaS product for a $1B+ revenue Kollabria client, and the development and implementation of an enterprise architecture, prototype, working code, and initial UX/UI wireframes for a separate SaaS product based on product requirements defined by Kollabria.",\n      "title": "Principal Engineer & Software Development Director"\n    }]\n  },\n  "publicProfileUrl": "https://www.linkedin.com/in/adamjones07",\n  "relationToViewer": {"distance": 0},\n  "siteStandardProfileRequest": {"url": "https://www.linkedin.com/profile/view?id=AAoAAACfHZ0BojjqE38VufORdMxXoLPRWG0jtc4&authType=name&authToken=lR-Y&trk=api*a4508104*s4571474*"},\n  "summary": "IT Leader with 13 years of progressive experience in leading, developing, architecting, planning and implementing enterprise technology solutions. Successful in planning, monitoring and driving on-time deliverables of complex technology, business and process improvements.\\n\\nExperience in managing and implementing all aspects of the software development life cycle (SDLC), from initial capture of requirements through development, testing and delivery. Skilled in building, training and mentoring high-performance teams in delivering strategic software projects. Skilled in bridging the gap between technology and business to eliminate conflicts, improve understanding and drive successful project results. Demonstrated ability in introducing and championing the adoption of industry and corporate standards and best practices across an entire project life cycle that have enabled better alignment of technologies, resources and requirements.\\n\\nExperience with direction and oversight of large budgets and collaborative team environments, complex operations, and successfully leading development teams and projects in a variety of SDLC management methodologies including Agile, Waterfall, Scrum and Kanban.\\n\\nOngoing focus on researching and evaluating market trends and new technologies, combining and integrating best of breed solutions with new code in order to cost effectively deliver scalable and competitively differentiated solutions, and fostering and sustaining productive business relationships with customers, partners, team members and employees."\n}',
  _json:
   { apiStandardProfileRequest:
      { headers: [Object],
        url: 'https://api.linkedin.com/v1/people/FiE1hGZWfT' },
     currentShare:
      { author: [Object],
        comment: 'Anyone in the Boston Area looking for a job/change -- Looking to bring 2 web developers on board to work with me and others. -- You would be working downtown near the Children\'s Museum.',
        id: 's447982336',
        source: [Object],
        timestamp: 1309274152000,
        visibility: [Object] },
     distance: 0,
     emailAddress: 'jones.gabriel@gmail.com',
     firstName: 'Adam',
     formattedName: 'Adam Jones',
     headline: 'Principle Engineer at Kollabria',
     id: 'FiE1hGZWfT',
     industry: 'Information Technology and Services',
     lastName: 'Jones',
     location: { country: [Object], name: 'Greater Boston Area' },
     numConnections: 167,
     numConnectionsCapped: false,
     pictureUrl: 'https://media.licdn.com/mpr/mprx/0__u25yHgQEiT4ImoTLesXBp4Q2iFkS2by7u9IVgMQDFwLSpIj_sZetVUQekrBwywlCmZXR7N6_Ll5aHeDo0dMNpvo6LlXaH7l70dQxj8FDXkeXONDimxH0Wm9QKwqbH486ySW4_dCHZO',
     pictureUrls: { _total: 1, values: [Array] },
     positions: { _total: 1, values: [Array] },
     publicProfileUrl: 'https://www.linkedin.com/in/adamjones07',
     relationToViewer: { distance: 0 },
     siteStandardProfileRequest: { url: 'https://www.linkedin.com/profile/view?id=AAoAAACfHZ0BojjqE38VufORdMxXoLPRWG0jtc4&authType=name&authToken=lR-Y&trk=api*a4508104*s4571474*' },
     summary: 'IT Leader with 13 years of progressive experience in leading, developing, architecting, planning and implementing enterprise technology solutions. Successful in planning, monitoring and driving on-time deliverables of complex technology, business and process improvements.\n\nExperience in managing and implementing all aspects of the software development life cycle (SDLC), from initial capture of requirements through development, testing and delivery. Skilled in building, training and mentoring high-performance teams in delivering strategic software projects. Skilled in bridging the gap between technology and business to eliminate conflicts, improve understanding and drive successful project results. Demonstrated ability in introducing and championing the adoption of industry and corporate standards and best practices across an entire project life cycle that have enabled better alignment of technologies, resources and requirements.\n\nExperience with direction and oversight of large budgets and collaborative team environments, complex operations, and successfully leading development teams and projects in a variety of SDLC management methodologies including Agile, Waterfall, Scrum and Kanban.\n\nOngoing focus on researching and evaluating market trends and new technologies, combining and integrating best of breed solutions with new code in order to cost effectively deliver scalable and competitively differentiated solutions, and fostering and sustaining productive business relationships with customers, partners, team members and employees.' } }
 */
