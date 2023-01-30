import React from 'react';
import ButtonSuccess from '../common/ButtonSuccess';
import Form from '../common/form/Form';
import Input from '../common/form/Input';
import './LoginForm.scss';

function LoginForm({initialValues, onSubmit}) {

    const initialFormValues = initialValues ? initialValues : { username: "", password: "" };

    return (
        <div className='login-form'>
            <h3 className='login-form-title'>Log in</h3>
            <Form
                initialValues={initialFormValues}
                onSubmit={onSubmit}
            >
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
                <ButtonSuccess type="submit">Log in</ButtonSuccess>
            </Form>
        </div>
    )
}

export default LoginForm