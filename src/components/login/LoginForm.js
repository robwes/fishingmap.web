import React from 'react'
import Form from '../common/form/Form'
import Input from '../common/form/Input';
import { useHistory } from 'react-router-dom';
import './login.scss';

function LoginForm({initialValues, onSubmit}) {

    const initialFormValues = initialValues ? initialValues : { username: "", password: "" };

    return (
        <div className='login-form'>
            <Form
                initialValues={initialFormValues}
                onSubmit={onSubmit}
            >
                <h3 className='login-form-title'>Log in</h3>
                <Input
                    label="Username"
                    name="username"
                    type="text"
                    placeholder="Username..."
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Password..."
                />
                <button className="submit-button login-submit" type="submit">Log in</button>
            </Form>
        </div>
    )
}

export default LoginForm