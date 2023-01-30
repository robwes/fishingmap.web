import { useField } from 'formik';
import React from 'react';
import Label from './Label';
import Error from './Error';

function Select({ label, ...props }) {
    const [field, meta] = useField(props)

    return (
        <div className="select">
            <Label htmlFor={props.id || props.name}>{label}</Label>
            <select {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default Select
