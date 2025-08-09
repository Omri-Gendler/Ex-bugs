const { useState, useEffect } = React

import { bugService } from '../services/bug.service.remote.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState([])
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [paginationData, setPaginationData] = useState({
        totalBugs: 0,
        totalPages: 1,
        currentPage: 1
    })

    useEffect(loadBugs, [filterBy])

    function loadBugs() {
        console.log('Loading bugs with filterBy:', filterBy) // Debug log
        
        bugService.query(filterBy)
            .then(result => {
                console.log('Frontend received:', result)
                
                if (result && result.bugs) {
                    setBugs(result.bugs)
                    setPaginationData({
                        totalBugs: result.totalBugs,
                        totalPages: result.totalPages,
                        currentPage: result.currentPage
                    })
                } else if (Array.isArray(result)) {
                    setBugs(result)
                    setPaginationData({
                        totalBugs: result.length,
                        totalPages: 1,
                        currentPage: 1
                    })
                }
            })
            .catch(err => {
                console.error('Load bugs error:', err)
                showErrorMsg(`Couldn't load bugs - ${err}`)
            })
    }

    function onPageChange(pageIdx) {
        setFilterBy(prevFilter => ({ ...prevFilter, pageIdx }))
    }

    function onSetFilterBy(newFilterBy) {
        console.log('Setting filter:', newFilterBy) // Debug log
        setFilterBy(prevFilter => ({ 
            ...prevFilter, 
            ...newFilterBy, 
            pageIdx: 1 // Reset to page 1 when filtering
        }))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                // Instead of manually filtering, reload the page data
                loadBugs() // This will refresh with correct pagination
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            severity: +prompt('Bug severity?', 3),
            description: prompt('Bug description?')
        }

        bugService.save(bug)
            .then(savedBug => {
                console.log('Bug added:', savedBug)
                // Go to last page to see the new bug
                loadBugs() // Refresh current page first
                showSuccessMsg('Bug added')
            })
            .catch(err => {
                console.error('Add bug error:', err)
                showErrorMsg(`Cannot add bug`, err)
            })
    }

    function onEditBug(bug) {
        const title = prompt('Bug title?', bug.title)
        if (title === null) return // User cancelled

        const description = prompt('Bug description?', bug.description)
        if (description === null) return

        const severity = +prompt('Bug severity?', bug.severity)
        if (isNaN(severity)) return

        // Make sure to include ALL required fields
        const bugToSave = {
            ...bug,  // Keep all existing properties
            title,
            description,
            severity
        }

        console.log('Sending bug to save:', bugToSave) // Debug log

        bugService.save(bugToSave)
            .then(savedBug => {
                console.log('Received saved bug:', savedBug) // Debug log
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => {
                console.error('Edit error:', err) // Debug log
                showErrorMsg('Cannot update bug', err)
            })
    }

    return <section className="bug-index main-content">
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>

        <div className="pagination-info">
            Showing {bugs.length} of {paginationData.totalBugs} bugs 
            (Page {paginationData.currentPage} of {paginationData.totalPages})
        </div>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />

        {/* Pagination buttons */}
        {paginationData.totalPages > 1 && (
            <div className="pagination">
                {/* Previous button */}
                <button 
                    onClick={() => onPageChange(paginationData.currentPage - 1)}
                    disabled={paginationData.currentPage === 1}
                    className="page-btn"
                >
                    Previous
                </button>

                {/* Page number buttons */}
                {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`page-btn ${pageNum === paginationData.currentPage ? 'active' : ''}`}
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Next button */}
                <button 
                    onClick={() => onPageChange(paginationData.currentPage + 1)}
                    disabled={paginationData.currentPage === paginationData.totalPages}
                    className="page-btn"
                >
                    Next
                </button>
            </div>
        )}
    </section>
}
