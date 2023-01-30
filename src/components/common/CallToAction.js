import React from 'react';
import LinkButton from './LinkButton';
import './CallToAction.scss';

function CallToAction({children, className, ...props}) {

    const getCssClasses = () => {
        let cssClasses = "call-to-action";
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

export default CallToAction