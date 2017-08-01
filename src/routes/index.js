import express from 'express'

const router = express.Router()

router.post('/login', (req, res) => {
  res.status(200).send('OK')
})

export default router
