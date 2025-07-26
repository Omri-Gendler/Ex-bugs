import express from 'express'
import { bugService } from './public/services/bug.service.js'

const app = express()

app.get('/', (req, res) => {
    bugService.query().then(bugs => res.send(bugs))
})

app.get('/api/bug/save', (req, res) => { })

app.get('/api/bug/:bugId', (req, res) => { })

app.get('/api/bug/:bugId/remove', (req, res) => { })


const port = 3030
app.listen(port, () => console.log('Server ready at port 3030')) 