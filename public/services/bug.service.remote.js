const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
}

function query(filterBy) {
    return axios.get(BASE_URL)
        .then(res => res.data)
        .then(bugs => {

            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }

            if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }

            return bugs
        })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(`${BASE_URL}${bugId}`) // Use DELETE method, not GET
        .then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        // Editing existing bug - use PUT
        return axios.put(`${BASE_URL}${bug._id}`, bug)
            .then(res => res.data)
    } else {
        // Creating new bug - use POST
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}