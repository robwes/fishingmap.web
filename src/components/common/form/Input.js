import React from 'react'
import { useField } from "formik";
import Error from './Error';
import './form.css';

function Input({ label, ...props }) {
    const [field, meta] = useField(props);
    return (
        <div className="input-group">
            <label className="form-label" htmlFor={props.id || props.name}>{label}</label>
            <input className="form-input" {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default Input
