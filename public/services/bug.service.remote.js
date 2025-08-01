
const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
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
    const url = BASE_URL + bugId + '/remove'
    console.log(url)

    return axios.get(url)
}

function save(bug) {

    var queryParmas = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`
    if (bug._id) queryParmas += `&_id=${bug._id}`
    console.log(queryParmas);

    return axios.get(BASE_URL + 'save/' + queryParmas).then(res => res.data)
}



function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}