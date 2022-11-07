import React from 'react'
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import LoginForm from './LoginForm'
import './login.css';
import { useCurrentUser } from '../../hooks/CurrentUserContext';

function Login() {

    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useCurrentUser();

    const handleSubmit = async (loginValues, { setSubmitting }) => {
        const result = await authService.login(loginValues.username, loginValues.password);
        if (result) {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            navigate("/");
        }
    }

    const handleWhoAmI = async () => {
        const currentUser = await authService.getCurrentUser();
    }

    const handleLogout = async () => {
        const currentUser = await authService.logout();
    }

    return (
        <div className='login-page'>
            <LoginForm
                onSubmit={handleSubmit}
            />
            {/* <button className="button button-primary" onClick={handleWhoAmI}>Who am I?</button>
            <button className="button button-secondary" onClick={handleLogout}>Logout</button> */}
        </div>
    )
}

export default Login