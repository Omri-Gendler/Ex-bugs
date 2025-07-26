import { readJsonFile } from './util.service.js'
import fs from 'fs'

const bugs = readJsonFile('./data/bug.json')

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy) {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    return axios.get(BASE_URL, bugId)
}

function remove(bugId) {
    return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
    if (bug._id) {
        return storageService.put(STORAGE_KEY, bug)
    } else {
        return storageService.post(STORAGE_KEY, bug)
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}