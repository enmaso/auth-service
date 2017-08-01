import express from 'express'
import create from './create'

const router = express.Router()

router.use('/create', create)

router.post('/login', (req, res) => {
  res.status(200).send('OK')
})

export default router
