const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { UserList } from '../cmps/UserList.jsx'
import { authService } from '../services/auth.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'

export function AdminDashboard() {
    const user = authService.getLoggedinUser()
    const navigate = useNavigate()

    const [users, setUsers] = useState([])

    useEffect(() => {
        if (!user || !user.isAdmin) {
            showErrorMsg('Not Authorized')
            navigate('/')
        }
        userService.query().then(setUsers)
    }, [])

    function onRemoveUser(userId) {
        userService.remove(userId)
            .then(() => {
                setUsers(users => users.filter(user => user._id !== userId))
                showSuccessMsg('Removed successfully')
            })
            .catch(err => {
                // console.log('here is the msg from the server', err?.response?.data)
                console.log('err', err)
                showErrorMsg('Had issues removing the user')
            })
    }

    // if (!user || !user.isAdmin) return <div>You are not allowed in this page</div>

    return (
        <section className="admin-dashboard main-layout">
            <h1>Hello, {user.fullname}</h1>
            <h3>User Managment</h3>
            <UserList users={users} onRemoveUser={onRemoveUser} />
        </section>
    )
}
