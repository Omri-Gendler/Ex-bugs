const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
}

function query(filterBy = {}) {
    console.log('Remote service query called with:', filterBy)
    
    const params = new URLSearchParams()
    
    // Add ALL filter parameters
    if (filterBy.txt) params.append('txt', filterBy.txt)
    if (filterBy.minSeverity && filterBy.minSeverity > 0) params.append('minSeverity', filterBy.minSeverity)
    if (filterBy.sortBy) params.append('sortBy', filterBy.sortBy)
    if (filterBy.sortDir) params.append('sortDir', filterBy.sortDir)
    if (filterBy.pageIdx) params.append('pageIdx', filterBy.pageIdx)
    
    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL
    console.log('Making request to:', url)
    
    return axios.get(url)
        .then(res => {
            console.log('Remote service received:', res.data)
            return res.data
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
    console.log('Save function called with:', bug) // Debug log
    
    if (bug._id) {
        // Editing existing bug - use PUT
        console.log('Making PUT request to:', `${BASE_URL}${bug._id}`)
        return axios.put(`${BASE_URL}${bug._id}`, bug)
            .then(res => {
                console.log('PUT response:', res.data)
                return res.data
            })
    } else {
        // Creating new bug - use POST
        console.log('Making POST request to:', BASE_URL)
        return axios.post(BASE_URL, bug)
            .then(res => {
                console.log('POST response:', res.data)
                return res.data
            })
    }
}

function getDefaultFilter() {
    return { 
        txt: '', 
        minSeverity: 0, 
        pageIdx: 1,
        sortBy: 'title',
        sortDir: 1
    }
}