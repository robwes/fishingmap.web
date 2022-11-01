import { useField } from 'formik';
import React from 'react';
import Error from './Error';
import './form.css';

function Select({ label, ...props }) {
    const [field, meta] = useField(props)

    return (
        <div className="input-group">
            <label className="form-label" htmlFor={props.id || props.name}>{label}</label>
            <select {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default Select
