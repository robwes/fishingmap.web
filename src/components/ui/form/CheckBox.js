import { useField } from 'formik';
import React from 'react';
import Error from './Error';

function CheckBox({ children, ...props}) {
    const [field, meta] = useField({ ...props, type: "checkbox"})
    return (
        <div className="check-box">
            <label>
                <input {...field} {...props} />
                {children}
            </label>
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default CheckBox
