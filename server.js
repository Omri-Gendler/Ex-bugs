import express from 'express'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))
app.use(express.json())

// GET ALL BUGS
app.get('/api/bug', (req, res) => {
    console.log('GETTING BUGS...')
    console.log('req.query:', req.query)

    const { txt, sortBy, sortDir, pageIdx } = req.query

    const filter = {
        txt: txt || '',
    }

    const sort = {
        sortBy: sortBy || 'title', // Default sort by title
        sortDir: sortDir ? parseInt(sortDir) : 1, // Default to ascending order
    }

    const page = {
        pageIdx: pageIdx ? parseInt(pageIdx) : 1
    }

    bugService.query(filter, sort, page)
        .then(bugs => res.send(bugs))
})

// GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    bugService.getById(bugId)
        .then(bug => res.send(bug)) // Send the actual bug object
        .catch(err => res.status(404).send({ error: err }))
})

// EDIT BUG
app.put('/api/bug/:bugId', (req, res) => {

    loggerService.debug('Saving bug:', req.body)

    const { title, description, severity, _id } = req.body

    const bug = {
        _id,
        title,
        description,
        severity: +severity,
    }
    bugService.save(bug)
        .then(savedBug => res.send(`Bug saved with ID: ${savedBug._id}`))
})

app.post('/api/bug', (req, res) => {
    loggerService.debug('Creating bug:', req.body)
    const bug = bugService.getEmptyBug(req.body)

    bugService.save(bug)
        .then(savedBug => res.send(`Bug created with ID: ${savedBug._id}`))
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    console.log('DELETING BUG:', bugId)

    bugService.remove(bugId)
        .then(() => {
            loggerService.info('Deleting bug:', bugId)
            res.send(`Bug ${bugId} deleted`)
        })
        .catch(err => res.status(404).send({ error: err }))
})

const port = 3030
app.listen(port, () => console.log('Server ready at port 3030')) 