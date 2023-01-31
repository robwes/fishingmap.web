import React from 'react';
import './Button.scss';

function Button({ children, className, ...rest }) {
    
    const getCssClasses = () => {
        let cssClasses = "button";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }
    
    return (
        <button className={getCssClasses()} {...rest}>
            {children}
        </button>
    )
}

export default Button