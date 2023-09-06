import React from 'react';
import ButtonSuccess from '../../components/ui/buttons/ButtonSuccess';
import Input from '../../components/ui/form/Input';
import { Formik, Form } from 'formik';
import './LoginForm.scss';

function LoginForm({ initialValues, onSubmit }) {

    const initialFormValues = initialValues ? initialValues : { username: "", password: "" };

    return (
        <div className='login-form'>
            <h3 className='login-form-title'>Log in</h3>
            <Formik
                initialValues={initialFormValues}
                onSubmit={onSubmit}>
                {({ isSubmitting }) => (
                    <Form>
                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            placeholder="Username..."
                            disabled={isSubmitting}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Password..."
                            disabled={isSubmitting}
                        />
                        <ButtonSuccess
                            type="submit"
                            disabled={isSubmitting}>
                            Log in
                        </ButtonSuccess>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default LoginForm