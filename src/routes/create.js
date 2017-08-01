import { Router } from 'express'
import _ from 'lodash'
import logger from '../lib/logger'
import Account from '../lib/account'

const router = Router()

// POST /auth/create
router.post('/', (req, res) => {
  let params = _.pick(req.body, 'email', 'password')
  if(!params.email || !params.password) {
    logger.error('Missing Parameters')
    res.status(400).send('Missing Parameters')
  } else {
    let account = new Account()
    account.email = params.email
    account.password = params.password
    account.save(err => {
      if(err) {
        logger.debug(err, err.stack)
        if(err.code === 11000) {
          res.status(400).send('Account Exists')
        } else {
          res.status(400).send('Error Creating Account')
        }
      } else {
        res.status(201).json({
          account: account
        })
      }
    })
  }
})


export default router
