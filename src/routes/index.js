import express from 'express'
import create from './create'
import validate from './validate'
import box from './box'
import dropbox from './dropbox'
import twitter from './twitter'
import google from './google'
import microsoft from './microsoft'
import evernote from './evernote'
import linkedin from './linkedin'

const router = express.Router()

// Route Create Account
router.use('/create', create)

// Route Validate Account
router.use('/validate', validate)

// Route Authorize Box Service
router.use('/box', box)

// Route Authorize Dropbox Service
router.use('/dropbox', dropbox)

// Route Authorize Evernote Service
router.use('/evernote', evernote)

// Route Authorize Google Service
router.use('/google', google)

// Route Authorize LinkedIn Service
router.use('/linkedin', linkedin)

// Route Authorize Microsoft Service
router.use('/microsoft', microsoft)

// Route Authorize Twitter Service
router.use('/twitter', twitter)

export default router
