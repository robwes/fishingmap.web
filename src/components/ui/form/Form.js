import React from 'react';
import { Formik, Form as FormikForm } from 'formik';
import './Form.scss';

function Form({children, initialValues, validationSchema, onSubmit}) {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            <FormikForm className='form'>
                {children}
            </FormikForm>
        </Formik>
    )
}

export default Form
