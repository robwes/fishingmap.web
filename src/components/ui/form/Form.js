import React from 'react';
import { Formik, Form as FormikForm } from 'formik';
import './Form.scss';

function Form({children, className, initialValues, validationSchema, onSubmit}) {
    
    const getCssClasses = () => {
        let cssClasses = "form";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }
    
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            <FormikForm className={getCssClasses()}>
                {children}
            </FormikForm>
        </Formik>
    )
}

export default Form
