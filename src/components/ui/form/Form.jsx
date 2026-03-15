import React from 'react';
import { Form } from 'formik';
import './Form.scss';

function Form({ children, ...props }) {
    return (
        <Form {...props}>
            {children}
        </Form>
    )
}

export default Form
