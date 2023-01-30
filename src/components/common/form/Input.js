import React from 'react'
import { useField } from "formik";
import Label from './Label';
import Error from './Error';
import './Input.scss';

function Input({ label, ...props }) {
    const [field, meta] = useField(props);
    return (
        <div className="input">
            <Label htmlFor={props.id || props.name}>{label}</Label>
            <input className="input-field" {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default Input
