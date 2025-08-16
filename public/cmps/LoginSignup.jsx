import { authService } from '../services/auth.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { LoginForm } from './LoginForm.jsx'

const { useNavigate } = ReactRouterDOM
const { useState } = React

export function LoginSignup({ setLoggedinUser }) {
    const [isSignup, setIsSignUp] = useState(false)
    const navigate = useNavigate()

    function onLogin(credentials) {
        isSignup ? signup(credentials) : login(credentials)
    }

    function login(credentials) {
        authService.login(credentials)
            .then(user => setLoggedinUser(user))
            .then(() => {
                showSuccessMsg('Logged in successfully')
                navigate('/')
            })
            .catch(err => {
                console.log('err', err)
                showErrorMsg('Oops try again')
            })
    }

    function signup(credentials) {
        authService.signup(credentials)
            .then(setLoggedinUser)
            .then(() => {
                showSuccessMsg('Signed in successfully')
                navigate('/')
            })
            .catch(err => {
                showErrorMsg('Oops try again')
            })
    }

    return (
        <section className="login">
            <LoginForm onLogin={onLogin} isSignup={isSignup} />
            <div className="btns">
                <a href="#" onClick={() => setIsSignUp(prev => !prev)}>
                    {isSignup ? 'Already a member? Login' : 'New user? Signup here'}
                </a>
            </div>
        </section>
    )
}
