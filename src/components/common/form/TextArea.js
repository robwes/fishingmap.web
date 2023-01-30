import { useField } from 'formik';
import React from 'react';
import Label from './Label';
import Error from './Error';
import './TextArea.scss';

function TextArea({label, className, ...props}) {

    const [field, meta] = useField(props);

    const getCssClasses = () => {
        return "text-area" + (className ? ` ${className}` : "");
    }

    return (
        <div className={getCssClasses()}>
            <Label htmlFor={props.id || props.name}>{label}</Label>
            <textarea className="textarea-field" {...field} {...props} />
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default TextArea
