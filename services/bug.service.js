import { makeId, readJsonFile, writeJsonFile } from './util.service.js'
import { loggerService } from './logger.service.js'

const bugs = readJsonFile('data/bug.json')

const BUGS_PER_PAGE = 4

export const bugService = {
    query,
    getById,
    remove,
    save,
    getEmptyBug
}

function query(filter = {}, sort = {}, page = {}) {
    console.log('Query called with:', { filter, sort, page })

    let filteredBugs = [...bugs] // Start with a copy of all bugs

    // Apply text filtering
    if (filter.txt && filter.txt.trim()) {
        const regex = new RegExp(filter.txt.trim(), 'i')
        filteredBugs = filteredBugs.filter(bug =>
            regex.test(bug.title) || regex.test(bug.description || '')
        ).map(bug => ({
            ...bug,
            img: `./img/bug1.jpg`
        }))
        console.log(`After text filter "${filter.txt}":`, filteredBugs.length, 'bugs')
    }

    // Apply severity filtering
    if (filter.minSeverity && filter.minSeverity > 0) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= filter.minSeverity)
        console.log(`After severity filter ${filter.minSeverity}:`, filteredBugs.length, 'bugs')
    }

    // Apply sorting
    if (sort.sortBy) {
        console.log('Applying sort:', sort)
        if (['severity', 'createdAt'].includes(sort.sortBy)) {
            filteredBugs.sort((a, b) =>
                (a[sort.sortBy] - b[sort.sortBy]) * sort.sortDir)
        } else {
            filteredBugs.sort((a, b) =>
                a[sort.sortBy].toLowerCase().localeCompare(b[sort.sortBy].toLowerCase()) * sort.sortDir)
        }
    }

    // Calculate pagination info BEFORE slicing
    const totalBugs = filteredBugs.length
    const totalPages = Math.ceil(totalBugs / BUGS_PER_PAGE)
    const currentPage = page.pageIdx || 1

    // Apply pagination
    if (page.pageIdx && page.pageIdx > 0) {
        const startIdx = (page.pageIdx - 1) * BUGS_PER_PAGE
        const endIdx = startIdx + BUGS_PER_PAGE
        filteredBugs = filteredBugs.slice(startIdx, endIdx)
    }

    console.log(`Final result: ${filteredBugs.length} bugs on page ${currentPage} of ${totalPages}`)

    return Promise.resolve({
        bugs: filteredBugs,
        totalBugs,
        totalPages,
        currentPage,
        bugsPerPage: BUGS_PER_PAGE
    })
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
        // Update existing bug
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)

        if (idx === -1) {
            loggerService.error(`Couldn't find bug ${bugToSave._id} in bugService`)
            return Promise.reject(`Couldn't save bug`)
        }

        bugToSave.updatedAt = Date.now()
        bugs.splice(idx, 1, bugToSave)
    } else {
        // Create new bug
        bugToSave._id = makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.updatedAt = Date.now()
        bugToSave.isDone = false
        bugs.push(bugToSave)
    }

    return _saveBugs()
        .then(() => bugToSave) // Return the saved bug
}

function _saveBugs() {
    return writeJsonFile('./data/bug.json', bugs)
}

function getEmptyBug(title = '', description = '', severity = 1) {
    return {
        title,
        description,
        severity: +severity,
        isDone: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
}