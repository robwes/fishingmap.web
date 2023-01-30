import React from 'react';
import './ButtonBar.scss';

function ButtonBar({children, className}) {

    const getCssClasses = () => {
        let cssClasses = "button-bar";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <div className={getCssClasses()}>
            {children}
        </div>
    )
}

export default ButtonBar