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

// Route create
router.use('/create', create)

// Route validate
router.use('/validate', validate)

// Route Box Authorize
router.use('/box', box)

// Route Dropbox Authorize
router.use('/dropbox', dropbox)

// Route Evernote Authorize
router.use('/evernote', evernote)

// Route Google Authorize
router.use('/google', google)

// Route LinkedIn Authorize
router.use('/linkedin', linkedin)

// Route Microsoft Authorize
router.use('/microsoft', microsoft)

// Route Twitter Authorize
router.use('/twitter', twitter)

export default router
