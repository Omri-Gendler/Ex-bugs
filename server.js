import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))
app.use(express.json())

app.get('/api/bug', (req, res) => {
    console.log('GETTING BUGS...')

    bugService.query()
        .then(bugs => res.send(bugs))
})


// GET BY ID
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => res.status(404).send({ error: err }))
})

// SAVE BUG
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
        .then(savedBug => res.send(savedBug))
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    console.log('DELETING BUG:', bugId)

    bugService.remove(bugId)
        .then(() => {
            loggerService.info('Deleting bug:', bugId)
            res.send('removed')
        })
        .catch(err => res.status(404).send({ error: err }))
})

const port = 3030
app.listen(port, () => console.log('Server ready at port 3030')) 