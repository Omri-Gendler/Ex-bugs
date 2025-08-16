const { NavLink, Link, useNavigate } = ReactRouterDOM

import { authService } from '../services/auth.service.js'
import { UserMsg } from './UserMsg.jsx'


export function AppHeader({ loggedinUser, setLoggedinUser }) {
    const navigate = useNavigate()

    function onLogout() {
        authService.logout()
            .then(() => {
                setLoggedinUser(null)
                navigate('/auth')
            })
            .catch(err => {
                console.log(err)
                showErrorMsg(`Couldn't logout`)
            })
    }


    return <header className="app-header main-content single-row">
        <img
            onClick={() => navigate('/')}
            className="logo width=50px "
            src="assets/img/miss-bug.png"
            style={{ width: '50px', height: '50px' }}
        />
        <div className="nav-bar-container flex space-between">
            <nav className="nav-bar">
                {/* <NavLink to="/">Home</NavLink> */}
                <NavLink to="/bug">Bugs</NavLink>

                {
                    loggedinUser && loggedinUser.isAdmin && <NavLink to="/admin">Admin</NavLink>
                }
                <NavLink to="/about">About</NavLink>

                {
                    !loggedinUser ?
                        <NavLink to="/auth" >Login</NavLink> :
                        <div className="user">
                            <Link to={`/user/${loggedinUser._id}`}>{loggedinUser.fullname}</Link>
                            <button onClick={onLogout}>logout</button>
                        </div>
                }
            </nav>
        </div>
    </header>
}