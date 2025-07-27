import express from 'express'
import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
})

app.get('/api/bug/save', (req, res) => {
    const bug = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        _id: req.query._id
    }
    bugService.save(bug)
        .then(savedBug => res.send(savedBug))
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => res.status(404).send({ error: err }))
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    bugService.remove(bugId)
        .then(() => res.send({ message: 'Bug removed successfully' }))
        .catch(err => res.status(404).send({ error: err }))
})

const port = 3030
app.listen(port, () => console.log('Server ready at port 3030')) 