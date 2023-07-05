import React from 'react';
import HashLoader from "react-spinners/HashLoader";
import './FloatingSpinner.scss';

function FloatingSpinner({loading = true, size = 40, color = "#4285f4", ...props}) {
    return (
        <div className='floating-spinner'>          
            <HashLoader
                loading={loading}
                size={size}
                color={color}
                aria-label='loading'
                {...props}
            />
        </div>
    )
}

export default FloatingSpinner