import React from 'react';
import { useField } from 'formik';
import Error from './Error';
import Collapse from '../Collapse';
import './CollapsibleTextarea.scss';

function CollapsibleTextarea({ label, ...props }) {

    const [field, meta] = useField(props);

    return (
        <div className="collapsible-textarea">
            <Collapse label={label}>
                <textarea className="textarea-field" {...field} {...props} />
            </Collapse>
            {meta.touched && meta.error ? (
                <Error message={meta.error} />
            ) : null}
        </div>
    )
}

export default CollapsibleTextarea
