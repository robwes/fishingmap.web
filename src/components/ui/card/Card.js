import React from 'react';
import './Card.scss';

function Card({children, className}) {

    const getCssClasses = () => {
        let cssClasses = "card";
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

export default Card