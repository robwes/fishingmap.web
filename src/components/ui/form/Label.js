import React from 'react';
import './Label.scss';

function Label({children, ...props}) {
    return (
        <label className="label" {...props}>{children}</label>
    )
}

export default Label