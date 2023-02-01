import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import LoginForm from './LoginForm';
import { useCurrentUser } from '../../context/CurrentUserContext';
import './Login.scss';

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

    return (
        <div className='login'>
            <LoginForm
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default Login