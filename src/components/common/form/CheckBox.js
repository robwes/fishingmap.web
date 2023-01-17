import { useField } from 'formik';
import React from 'react';
import Error from './Error';
import './form.scss';

function CheckBox({ children, ...props}) {
    const [field, meta] = useField({ ...props, type: "checkbox"})
    return (
        <div className="input-group">
            <label className="form-checkbox">
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
