import React from 'react'
import LinkButton from './LinkButton';
import './LinkButtonPrimaryOutline.scss';

function LinkButtonPrimaryOutline({children, className, ...props}) {

    const getCssClasses = () => {
        let cssClasses = "link-button-primary-outline";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    return (
        <LinkButton className={getCssClasses()} {...props}>
            {children}
        </LinkButton>
    )
}

export default LinkButtonPrimaryOutline