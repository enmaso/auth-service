require('dotenv').config()

import express from 'express'
import bodyParser from 'body-parser'
import logger from './lib/logger'
import routes from './routes'

const app = express()
const PORT = process.env.PORT || 8080

// Service middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('morgan')('short', {stream: logger.stream}))

// Service routes
app.use('/auth', routes)

// Service status route
app.get('/status', (req, res) => {
  res.status(200).send('OK')
})

// If Route not found, 404
app.all('*', (req, res) => {
  res.status(404).send('Not Found')
})

// Run service
app.listen(PORT, () => {
  logger.debug(`[${process.env.NODE_ENV}] Auth-Service started on port ${PORT}`)
})

export default app
