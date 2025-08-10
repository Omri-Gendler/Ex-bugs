import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

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

const port = 3030
app.listen(port, () => console.log('Server ready at port 3030'))