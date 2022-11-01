import React from 'react';
import { Formik, Form as FormikForm } from 'formik';
import './form.css';

function Form({children, initialValues, validationSchema, onSubmit}) {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            <FormikForm>
                {children}
            </FormikForm>
        </Formik>
    )
}

export default Form
