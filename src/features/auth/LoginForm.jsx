import React from 'react';
import ButtonSuccess from '@/shared/components/buttons/ButtonSuccess';
import Input from '@/shared/components/form/Input';
import Error from '@/shared/components/form/Error';
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
                {({ isSubmitting, status }) => (
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
                        {status && (
                            <div className="login-form-error">
                                <Error message={status} />
                            </div>
                        )}
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
