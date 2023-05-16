import React from 'react';
import Button from './Button';
import './ButtonPrimaryOutline.scss';

function ButtonPrimaryOutline({children, className, ...rest}) {

    const getCssClasses = () => {
        let cssClasses = "button-primary-outline";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <Button className={getCssClasses()} {...rest}>
            {children}
        </Button>
    )
}

export default ButtonPrimaryOutline