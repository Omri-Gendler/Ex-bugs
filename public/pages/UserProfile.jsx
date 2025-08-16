const { useState, useEffect } = React

import { BugList } from '../cmps/BugList.jsx'
import { bugService } from '../services/bug.service.js'
import { userService } from '../services/user.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
const { useNavigate, useParams } = ReactRouterDOM

export function UserProfile() {
    const [user, setUser] = useState(null)
    const [userBugs, setUserBugs] = useState([])

    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        loadUser()
        loadUserBugs()
    }, [params.userId])

    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    function loadUserBugs() {
        bugService.query({ userId: params.userId })
            .then(res => {
                setUserBugs(res.bugs)
            })
            .catch(err => {
                console.log('err:', err)
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                setUserBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch(err => {
                console.log('from remove bug', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        if (!severity) return alert('Please enter a severity')
        const bugToSave = { ...bug, severity }
        bugService.save(bugToSave)
            .then(savedBug => {
                console.log('Updated Bug:', savedBug)
                setUserBugs(prevBugs =>
                    prevBugs.map(currBug =>
                        currBug._id === savedBug._id ? savedBug : currBug
                    )
                )
                showSuccessMsg('Bug updated')
            })
            .catch(err => {
                console.log('from edit bug', err)
                showErrorMsg('Cannot update bug')
            })
    }

    if (!user) return null

    return (
        <section className="user-profile main-layout">
            <h1>Hello {user.fullname}</h1>

            {!userBugs || (!userBugs.length && <h2>No bugs to show</h2>)}
            {userBugs && userBugs.length > 0 && <h3>Manage your bugs</h3>}
            <BugList bugs={userBugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
        </section>
    )
}
