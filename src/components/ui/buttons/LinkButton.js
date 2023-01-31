import React from 'react';
import { Link } from 'react-router-dom';
import './LinkButton.scss';

function LinkButton({ children, className, to, ...props }) {

    const getCssClasses = () => {
        let cssClasses = "link-button";
        if (className) {
            cssClasses += ` ${className}`;
        }

        return cssClasses;
    }

    const getLinkButtonElement = () => {
        if (to) {
            return <Link to={to} className={getCssClasses()} {...props}>{children}</Link>;
        }
        return <a className={getCssClasses()} {...props}>{children}</a>;
    }

    return getLinkButtonElement();
}

export default LinkButton