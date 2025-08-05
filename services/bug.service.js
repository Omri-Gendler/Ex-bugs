import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

const bugs = readJsonFile('data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save,
    getEmptyBug
}

function query(filter, sort, page) {
    let filteredBugs = bugs

    if (filter.txt) {
        console.log(filter, sort, page)
        const regex = new RegExp(filter.txt, 'i')
        filteredBugs = filteredBugs.filter(bug => regex.test(bug.title) || regex.test(bug.description))
    }
    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)

    if (!bug) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt get bug`)
    }
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)

    if (idx === -1) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt remove bug`)
    }

    bugs.splice(idx, 1)
    return _saveBugs()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)

        if (idx === -1) {
            loggerService.error(`Couldnt find bug ${bugToSave._id} in bugService`)
            return Promise.reject(`Couldnt save bug`)
        }

        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.updatedAt = Date.now()
        bugs.push(bugToSave)
    }
    return _saveBugs()
        .then(() => bugToSave)
}

function _saveBugs() {
    return writeJsonFile('./data/bug.json', bugs)
}

function getEmptyBug(title, description, severity, labels) {
    return {
        title: title || '',
        description: description || '',
        severity: severity || 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        labels: labels || [],
    }
}