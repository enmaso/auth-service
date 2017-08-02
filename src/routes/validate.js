import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'
import jwt from 'jsonwebtoken'

const router = Router()

// POST /auth/login
router.post('/', (req, res) => {
  let params = _.pick(req.body, 'email', 'password')
  if (!params.email || !params.password) {
    logger.error('Missing Parameters')
    res.status(400).send('Missing Parameters')
  } else {
    Account.findOne({
      email: params.email
    }, (err, account) => {
      if (err) {
        // Mongo server error
        logger.error(err, err.stack)
        res.status(500).send('Server Error')
      } else {
        if (account == null) {
          // Account does not exist
          res.status(400).send('Invalid Email')
        } else {
          if (!Account.match(params.password, account.password)) {
            // Password for email does not match
            res.status(400).send('Invalid Password')
          } else {
            // Ding ding ding! We have a winner!
            let payload = {
              id: account._id,
              email: account.email,
              scope: [],
              iss: 'https://enmaso.com'
            }
            let token = jwt.sign(payload, account.key)
            res.status(200).json({
              token: token
            })
          }
        }
      }
    })
  }
})

export default router
