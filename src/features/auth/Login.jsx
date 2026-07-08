import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from './authService';
import LoginForm from './LoginForm';
import { useCurrentUser } from '@/shared/context/CurrentUserContext';
import './Login.scss';

function Login() {

    const navigate = useNavigate();

    const [, setCurrentUser] = useCurrentUser();

    /**
     * Attempts to log in and, on success, stores the authenticated user and
     * navigates home. On failure a form-level error is shown via Formik's
     * status (the backend doesn't say why, so the message stays generic).
     * @param {{username: string, password: string}} loginValues - The submitted credentials.
     * @param {Object} formikBag - Formik helpers (setStatus).
     */
    const handleSubmit = async (loginValues, { setStatus }) => {
        setStatus(null);

        const loggedIn = await authService.login(loginValues.username, loginValues.password);
        if (!loggedIn) {
            setStatus("Login failed. Check your username and password and try again.");
            return;
        }

        const user = await authService.getCurrentUser();
        if (!user) {
            setStatus("Logged in, but loading your account failed. Please try again.");
            return;
        }

        setCurrentUser(user);
        navigate("/");
    }

    return (
        <div className='login page'>
            <LoginForm
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default Login
