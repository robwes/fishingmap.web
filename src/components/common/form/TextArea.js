import { useField } from 'formik';
import React from 'react';
import Error from './Error';
import './form.scss';

function TextArea({label, cssClass, ...props}) {

    const [field, meta] = useField(props);

    const cssClasses = "input-group" + (cssClass ? ` ${cssClass}` : "");

    return (
        <div className={cssClasses}>
            <label className="form-label" htmlFor={props.id || props.name}>{label}</label>
            <textarea className="form-input" {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default TextArea
