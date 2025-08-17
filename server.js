import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'


const app = express()
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// GET ALL BUGS
app.get('/api/bug', (req, res) => {
    console.log('GETTING BUGS...')
    console.log('req.query:', req.query)

    const { txt, minSeverity, sortBy, sortDir, pageIdx } = req.query


    const filter = {
        txt: txt || '',
        minSeverity: minSeverity ? parseInt(minSeverity) : 0 // Add minSeverity
    }

    const sort = {
        sortBy: sortBy || 'title',
        sortDir: sortDir ? parseInt(sortDir) : 1,
    }

    const page = {
        pageIdx: pageIdx ? parseInt(pageIdx) : 1
    }

    console.log('Calling bugService.query with:', { filter, sort, page })

    bugService.query(filter, sort, page)
        .then(result => {
            console.log('Sending to frontend:', result)
            res.send(result)
        })
        .catch(err => {
            console.error('Query error:', err)
            res.status(500).send({ error: err })
        })
})

// GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    let visitedCount = +req.cookies.visitedCount || 0
    if (visitedCount > 3) {
        return res.status(401).send({ error: 'Wait for a bit' })
    }
    visitedCount++
    res.cookie('visitedCount', visitedCount, { maxAge: 1000 * 7 })

    bugService.getById(bugId)
        .then(bug => res.send(bug)) // Send the actual bug object
        .catch(err => res.status(404).send({ error: err }))
})

// EDIT BUG
app.put('/api/bug/:bugId', (req, res) => {
    loggerService.debug('Saving bug:', req.body)
    console.log('Request body:', req.body) // Add this debug log
    console.log('Bug ID from params:', req.params.bugId) // Add this debug log

    const { title, description, severity } = req.body

    // Check if required fields are present
    if (!title || !description || severity === undefined) {
        return res.status(400).send({ error: 'Missing required fields: title, description, severity' })
    }

    const bug = {
        _id: req.params.bugId,
        title,
        description,
        severity: +severity,
    }

    bugService.save(bug)
        .then(savedBug => {
            console.log('Saved bug:', savedBug) // Add this debug log
            res.send(savedBug)
        })
        .catch(err => {
            console.error('Save error:', err) // Add this debug log
            res.status(400).send({ error: err })
        })
})

app.post('/api/bug', (req, res) => {
    loggerService.debug('Creating bug:', req.body)

    const { title, description, severity } = req.body

    const bug = {
        title,
        description,
        severity: +severity,
    }

    bugService.save(bug)
        .then(savedBug => res.send(savedBug)) // Send the bug object, not a string
        .catch(err => res.status(400).send({ error: err }))
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    console.log('DELETING BUG:', bugId)

    bugService.remove(bugId)
        .then(() => {
            loggerService.info('Deleting bug:', bugId)
            res.send({ message: `Bug ${bugId} deleted`, success: true }) // Send object instead of string
        })
        .catch(err => {
            console.error('Delete error:', err)
            res.status(404).send({ error: err })
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete bug')

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`Bug id : ${bugId} deleted`))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(401).send('Cannot remove bug')
        })
})

app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    const bug = req.body
    delete loggedinUser.username
    bug.creator = loggedinUser

    bugService.save(bug, loggedinUser)
        .then(addedBug => res.send(addedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug', (req, res, next) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    const bug = req.body
    bugService.save(bug, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Had issues:', err)
            res.status(400).send('Cannot save bug')
        })
})

app.delete('/api/user/:userId', (req, res) => {
    const { loginToken } = req.cookies
    const loggedinUser = authService.validateToken(loginToken)

    if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('Cannot remove user')
    const { userId } = req.params

    bugService.hasBugs(userId)
        .then(() => userService.remove(userId))
        .then(() => res.send('Removed!'))
        .catch(err => {
            loggerService.error('Cannot delete user!', err)
            res.status(401).send('Cannot delete user!')
        })
})

//* ------------------- Auth API -------------------

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    console.log('🚀 ~ req.body:', req.body)
    // console.log('credentials:', credentials)

    userService.signup(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(401).send('Cannot signup')
        })
})


app.post('/api/auth/login', (req, res) => {
    const credentials = {
        username: req.body.username,
        password: req.body.password,
    }
    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(401).send('Cannot login')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})


// Listen will always be the last line in our server!
const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://localhost:${port}/`)
)