import React from 'react';
import './Error.scss';

function Error({message}) {
    return (
        <div className="error">
            <i className="fas fa-exclamation-triangle"></i>&nbsp;{message}
        </div>
    )
}

export default Error
