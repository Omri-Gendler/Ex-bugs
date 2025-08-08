import { makeId, readJsonFile, writeJsonFile } from './util.service.js'

const bugs = readJsonFile('data/bug.json')

const BUGS_PER_PAGE = 3


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
        const regex = new RegExp(filter.txt, 'i')
        filteredBugs = filteredBugs.filter(bug => regex.test(bug.title) || regex.test(bug.description))
    }

    // Apply sorting
    if (sort) {
        console.log(filter, sort, page)

        if (['severity', 'createdAt'].includes(sort.sortBy)) {
            // Numeric sorting
            filteredBugs.sort((a, b) =>
                (a[sort.sortBy] - b[sort.sortBy]) * sort.sortDir)
        } else {
            // String sorting
            filteredBugs.sort((a, b) =>
                a[sort.sortBy].toLowerCase().localeCompare(b[sort.sortBy].toLowerCase()) * sort.sortDir)
        }

        let startPage = page.pageIdx * BUGS_PER_PAGE
        let endPage = startPage + BUGS_PER_PAGE

        filteredBugs = filteredBugs.slice(startPage, endPage)

        return Promise.resolve(filteredBugs)
    }
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
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    
    if (bugIdx === -1) {
        return Promise.reject(`Bug with id ${bugId} not found`)
    }
    
    bugs.splice(bugIdx, 1)
    return _saveBugs()
        .then(() => bugId)
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