import React from 'react'
import { useField } from "formik";
import Label from './Label';
import Error from './Error';
import './Select.scss';

/**
 * A Formik-bound native select, matching Input's shape and look.
 *
 * Native rather than a custom listbox on purpose: it gets keyboard support,
 * type-ahead and the platform's mobile picker for free. Children are the
 * options, so callers can group them with optgroup.
 * @param {string} label - Field label.
 * @param {React.ReactNode} children - option / optgroup elements.
 */
function Select({ label, children, ...props }) {
    const [field, meta] = useField(props);
    // Falls back to the field name so the label is actually associated with
    // the control — Formik supplies `name`, never `id`.
    const id = props.id || props.name;

    return (
        <div className="select">
            <Label htmlFor={id}>{label}</Label>
            <select className="select-field" id={id} {...field} {...props}>
                {children}
            </select>
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default Select
